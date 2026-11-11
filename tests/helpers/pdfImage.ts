import { deflateSync, inflateSync } from 'zlib';

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let n = 0; n < buf.length; n++) {
    c ^= buf[n];
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(8 + body.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 4 + body.length);
  return out;
}

/** Opaque 1×1 PNG. pdfkit stores its scanline, so tests can find this exact color. */
export function rgbPng(r: number, g: number, b: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.from([0, r, g, b]))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function inflatedStreams(pdf: Buffer): Buffer[] {
  const raw = pdf.toString('latin1');
  const streams: Buffer[] = [];
  const marker = /stream\r?\n/g;
  let match: RegExpExecArray | null;
  while ((match = marker.exec(raw))) {
    const start = match.index + match[0].length;
    const end = raw.indexOf('endstream', start);
    if (end < 0) break;
    const dictStart = raw.lastIndexOf('<<', match.index);
    const dict = dictStart >= 0 ? raw.slice(dictStart, match.index) : '';
    let data = pdf.subarray(start, end);
    if (data[data.length - 1] === 0x0a) data = data.subarray(0, data.length - 1);
    if (data[data.length - 1] === 0x0d) data = data.subarray(0, data.length - 1);
    if (/\/FlateDecode/.test(dict)) {
      try {
        streams.push(inflateSync(data));
      } catch {
        // A truncated or non-image stream is ignored.
      }
    }
    marker.lastIndex = end;
  }
  return streams;
}

export function pdfImageCount(pdf: Buffer): number {
  return pdf.toString('latin1').match(/\/Subtype \/Image/g)?.length ?? 0;
}

export function pdfHasImage(pdf: Buffer): boolean {
  return pdfImageCount(pdf) > 0;
}

export function pdfContainsRgbPixel(pdf: Buffer, rgb: [number, number, number]): boolean {
  const needle = Buffer.from([0, rgb[0], rgb[1], rgb[2]]);
  return inflatedStreams(pdf).some((stream) => stream.includes(needle));
}
