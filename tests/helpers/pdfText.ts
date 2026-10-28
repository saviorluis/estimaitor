import { inflateSync } from 'zlib';

/**
 * Minimal text extraction for the PDFs @react-pdf/renderer produces (pdfkit output):
 * Flate-compressed content streams, hex-string TJ/Tj text, and ToUnicode CMaps for
 * embedded fonts. Good enough to assert on rendered words and amounts in tests.
 */

interface PdfObject {
  dict: string;
  stream?: Buffer;
}

function parseObjects(pdf: Buffer): Map<number, PdfObject> {
  const raw = pdf.toString('latin1');
  const objects = new Map<number, PdfObject>();
  const objRe = /(\d+)\s+0\s+obj\b/g;
  let m: RegExpExecArray | null;
  while ((m = objRe.exec(raw))) {
    const num = Number(m[1]);
    const start = m.index + m[0].length;
    const end = raw.indexOf('endobj', start);
    if (end < 0) break;
    const body = raw.slice(start, end);
    const streamAt = body.indexOf('stream');
    if (streamAt >= 0) {
      const dict = body.slice(0, streamAt);
      let dataStart = start + streamAt + 'stream'.length;
      if (raw[dataStart] === '\r') dataStart++;
      if (raw[dataStart] === '\n') dataStart++;
      const dataEnd = raw.lastIndexOf('endstream', end);
      let data = pdf.subarray(dataStart, dataEnd);
      if (/\/FlateDecode/.test(dict)) {
        try {
          data = inflateSync(data);
        } catch {
          data = Buffer.alloc(0);
        }
      }
      objects.set(num, { dict, stream: data });
    } else {
      objects.set(num, { dict: body });
    }
    objRe.lastIndex = end;
  }
  return objects;
}

function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i + 1 < clean.length; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
  return bytes;
}

function unicodeFromHex(hex: string): string {
  const bytes = hexToBytes(hex);
  let out = '';
  for (let i = 0; i + 1 < bytes.length; i += 2) out += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
  return out;
}

type CMap = { codeBytes: number; map: Map<number, string> };

function parseToUnicode(cmap: string): CMap {
  const map = new Map<number, string>();
  let codeBytes = 2;
  const range = /begincodespacerange\s*<([0-9a-fA-F]+)>/.exec(cmap);
  if (range) codeBytes = range[1].length / 2;
  for (const block of cmap.match(/beginbfchar([\s\S]*?)endbfchar/g) || []) {
    for (const pair of Array.from(block.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g))) {
      map.set(parseInt(pair[1], 16), unicodeFromHex(pair[2]));
    }
  }
  for (const block of cmap.match(/beginbfrange([\s\S]*?)endbfrange/g) || []) {
    for (const r of Array.from(block.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(\[[^\]]*\]|<[0-9a-fA-F]+>)/g))) {
      const lo = parseInt(r[1], 16);
      const hi = parseInt(r[2], 16);
      if (r[3].startsWith('[')) {
        const items = Array.from(r[3].matchAll(/<([0-9a-fA-F]+)>/g)).map((x) => unicodeFromHex(x[1]));
        items.forEach((s, i) => map.set(lo + i, s));
      } else {
        const startCode = parseInt(r[3].slice(1, -1), 16);
        for (let c = lo; c <= hi; c++) map.set(c, String.fromCharCode(startCode + (c - lo)));
      }
    }
  }
  return { codeBytes, map };
}

function decodeString(bytes: number[], cmap?: CMap): string {
  if (!cmap) return String.fromCharCode(...bytes);
  let out = '';
  for (let i = 0; i + cmap.codeBytes - 1 < bytes.length; i += cmap.codeBytes) {
    let code = 0;
    for (let b = 0; b < cmap.codeBytes; b++) code = (code << 8) | bytes[i + b];
    out += cmap.map.get(code) ?? '';
  }
  return out;
}

function literalToBytes(lit: string): number[] {
  const inner = lit.slice(1, -1).replace(/\\([nrtbf()\\])/g, (_, c) =>
    ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' } as Record<string, string>)[c]
  );
  return inner.split('').map((ch) => ch.charCodeAt(0) & 0xff);
}

function extractTextFromObjects(objects: Map<number, PdfObject>, streamNums?: number[]): string {
  const fontCMaps = new Map<number, CMap>();
  for (const [num, obj] of Array.from(objects)) {
    const ref = /\/ToUnicode\s+(\d+)\s+0\s+R/.exec(obj.dict);
    if (!ref) continue;
    const cmapObj = objects.get(Number(ref[1]));
    if (cmapObj?.stream) fontCMaps.set(num, parseToUnicode(cmapObj.stream.toString('latin1')));
  }

  const resourceFonts = new Map<string, number>();
  for (const obj of Array.from(objects.values())) {
    for (const block of obj.dict.match(/\/Font\s*<<([\s\S]*?)>>/g) || []) {
      for (const entry of Array.from(block.matchAll(/\/([A-Za-z0-9_.+-]+)\s+(\d+)\s+0\s+R/g))) {
        if (entry[1] !== 'Font') resourceFonts.set(entry[1], Number(entry[2]));
      }
    }
  }

  const streams = streamNums
    ? streamNums.map((num) => objects.get(num)).filter((obj): obj is PdfObject => Boolean(obj))
    : Array.from(objects.values());

  const lines: string[] = [];
  for (const obj of streams) {
    if (!obj.stream || /\/(Length1|Subtype\s*\/(Image|XML)|Type\s*\/(XObject|Metadata))/.test(obj.dict)) continue;
    const content = obj.stream.toString('latin1');
    if (!/\bT[Jj]\b/.test(content)) continue;
    let cmap: CMap | undefined;
    const tokenRe = /\/([A-Za-z0-9_.+-]+)\s+[\d.]+\s+Tf|\[((?:[^\]\\]|\\.)*)\]\s*TJ|(<[0-9a-fA-F\s]*>|\((?:[^()\\]|\\.)*\))\s*Tj|\bET\b/g;
    let line = '';
    let t: RegExpExecArray | null;
    while ((t = tokenRe.exec(content))) {
      if (t[1]) {
        const fontObj = resourceFonts.get(t[1]);
        cmap = fontObj !== undefined ? fontCMaps.get(fontObj) : undefined;
      } else if (t[2] !== undefined) {
        for (const s of Array.from(t[2].matchAll(/<([0-9a-fA-F\s]*)>|(\((?:[^()\\]|\\.)*\))/g))) {
          line += decodeString(s[1] !== undefined ? hexToBytes(s[1]) : literalToBytes(s[2]), cmap);
        }
      } else if (t[3]) {
        line += decodeString(t[3].startsWith('<') ? hexToBytes(t[3].slice(1, -1)) : literalToBytes(t[3]), cmap);
      } else if (line) {
        lines.push(line);
        line = '';
      }
    }
    if (line) lines.push(line);
  }
  return lines.join('\n');
}

export function extractPdfText(pdf: Buffer): string {
  return extractTextFromObjects(parseObjects(pdf));
}

function pageContentRefs(dict: string): number[] {
  const array = /\/Contents\s*\[([^\]]+)\]/.exec(dict);
  if (array) {
    return Array.from(array[1].matchAll(/(\d+)\s+0\s+R/g)).map((m) => Number(m[1]));
  }
  const single = /\/Contents\s+(\d+)\s+0\s+R/.exec(dict);
  return single ? [Number(single[1])] : [];
}

/** Page texts in document order. Used to assert totals and payment stay together. */
export function extractPdfPageTexts(pdf: Buffer): string[] {
  const objects = parseObjects(pdf);
  const pageNums: number[] = [];
  for (const kids of Array.from(pdf.toString('latin1').matchAll(/\/Kids\s*\[([^\]]+)\]/g))) {
    for (const ref of Array.from(kids[1].matchAll(/(\d+)\s+0\s+R/g))) {
      const num = Number(ref[1]);
      const obj = objects.get(num);
      if (obj && /\/Type\s*\/Page\b/.test(obj.dict) && !pageNums.includes(num)) pageNums.push(num);
    }
  }
  if (pageNums.length === 0) {
    for (const [num, obj] of Array.from(objects)) {
      if (/\/Type\s*\/Page\b/.test(obj.dict)) pageNums.push(num);
    }
  }
  return pageNums.map((num) => extractTextFromObjects(objects, pageContentRefs(objects.get(num)!.dict)));
}

export function countPdfPages(pdf: Buffer): number {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
}
