import JSZip from 'jszip';
import { pdf, Document, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { EstimateData, FormData } from './types';
import QuotePDF from '@/components/QuotePDF';
import React from 'react';
import { fonts } from './fonts';
import { generateQuoteDocx } from './docxGenerator';

// Register fonts with absolute URLs
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: `/fonts/roboto-regular-webfont.ttf`,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    {
      src: `/fonts/roboto-bold-webfont.ttf`,
      fontWeight: 'bold',
      fontStyle: 'normal'
    },
    {
      src: `/fonts/roboto-italic-webfont.ttf`,
      fontWeight: 'normal',
      fontStyle: 'italic'
    },
    {
      src: `/fonts/roboto-bolditalic-webfont.ttf`,
      fontWeight: 'bold',
      fontStyle: 'italic'
    }
  ]
});

// Add a function to ensure WASM is loaded
const ensureWASMLoaded = async (): Promise<void> => {
  const maxAttempts = 10;
  const attemptInterval = 500; // ms
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Try to create a simple test document to verify WASM is ready
      const testDoc = React.createElement(Document, {}, []);
      const instance = pdf(testDoc);
      await instance.toBlob();
      return; // Success
    } catch (e) {
      if (attempt === maxAttempts) {
        throw new Error('Failed to initialize WASM after multiple attempts');
      }
      await new Promise(resolve => setTimeout(resolve, attemptInterval));
    }
  }
};

// Add a function to create PDF instance with retries
const createPDFInstance = async (doc: React.ReactElement): Promise<any> => {
  let retries = 3;
  let lastError = null;

  while (retries > 0) {
    try {
      // Create a new instance each time
      const instance = pdf(doc);
      
      // Verify the instance is valid
      if (!instance || typeof instance.toBlob !== 'function') {
        throw new Error('Invalid PDF instance created');
      }

      // Test if the instance can be used
      await instance.toBlob();
      
      return instance;
    } catch (e) {
      console.warn(`PDF instance creation failed, ${retries - 1} retries left:`, e);
      lastError = e;
      retries--;
      if (retries === 0) throw lastError;
      // Add increasing delay between retries
      await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
    }
  }

  throw new Error('Failed to create valid PDF instance after multiple attempts');
};

// Add a function to generate PDF blob with retries
const generatePDFBlob = async (instance: any): Promise<Blob> => {
  let retries = 3;
  let lastError = null;
  let blob = null;

  while (retries > 0) {
    try {
      // Verify instance is still valid
      if (!instance || typeof instance.toBlob !== 'function') {
        throw new Error('Invalid PDF instance provided to blob generation');
      }

      // Generate blob with timeout protection
      const blobPromise = instance.toBlob();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF blob generation timed out')), 30000)
      );

      blob = await Promise.race([blobPromise, timeoutPromise]);

      // Verify blob is valid
      if (!(blob instanceof Blob)) {
        throw new Error('Generated blob is not valid');
      }

      return blob;
    } catch (e) {
      console.warn(`PDF blob generation failed, ${retries - 1} retries left:`, e);
      lastError = e;
      retries--;
      if (retries === 0) throw lastError;
      // Add increasing delay between retries
      await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
    }
  }

  throw new Error('Failed to generate valid PDF blob after multiple attempts');
};

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
}

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

interface QuoteInfo {
  quoteNumber: string;
  date: string;
  validUntil: string;
  projectName: string;
  projectAddress: string;
  notes: string;
  terms: string;
}

interface DocumentGeneratorProps {
  estimateData: EstimateData;
  formData: FormData;
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  quoteInfo: QuoteInfo;
}

type DocumentType = 'QUOTE' | 'WORK_ORDER' | 'PURCHASE_ORDER' | 'CHANGE_ORDER' | 'INVOICE';

const validateDocumentData = (props: DocumentGeneratorProps): void => {
  const { estimateData, formData, companyInfo, clientInfo, quoteInfo } = props;

  console.log('Validating document data with:', {
    clientInfo,
    companyInfo,
    quoteInfo,
    hasEstimateData: !!estimateData,
    hasFormData: !!formData
  });

  if (!estimateData) throw new Error('Estimate data is required');
  if (!formData) throw new Error('Form data is required');
  if (!companyInfo) throw new Error('Company information is required');
  if (!clientInfo) throw new Error('Client information is required');
  if (!quoteInfo) throw new Error('Quote information is required');

  // Validate company info
  if (!companyInfo.name) throw new Error('Company name is required');
  if (!companyInfo.address) throw new Error('Company address is required');
  if (!companyInfo.phone) throw new Error('Company phone is required');

  // Validate client info
  console.log('Validating client info:', clientInfo);
  if (!clientInfo.name || clientInfo.name.trim() === '') {
    console.error('Client name is missing or empty');
    throw new Error('Client name is required');
  }
  if (!clientInfo.company || clientInfo.company.trim() === '') {
    console.error('Client company is missing or empty');
    throw new Error('Client company is required');
  }
  if (!clientInfo.address || clientInfo.address.trim() === '') {
    console.error('Client address is missing or empty');
    throw new Error('Client address is required');
  }

  // Validate quote info
  if (!quoteInfo.quoteNumber) throw new Error('Quote number is required');
  if (!quoteInfo.projectName) throw new Error('Project name is required');
  if (!quoteInfo.projectAddress) throw new Error('Project address is required');
};

const initializeFonts = async (): Promise<void> => {
  try {
    // Verify fonts exist
    for (const [key, path] of Object.entries(fonts)) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Font file not found: ${path}`);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Failed to load font ${key}: ${errorMessage}`);
      }
    }

    // Register fonts only once
    await Font.register({
      family: 'Roboto',
      fonts: [
        { src: fonts.regular, fontWeight: 'normal', fontStyle: 'normal' },
        { src: fonts.bold, fontWeight: 'bold', fontStyle: 'normal' },
        { src: fonts.italic, fontWeight: 'normal', fontStyle: 'italic' },
        { src: fonts.boldItalic, fontWeight: 'bold', fontStyle: 'italic' }
      ]
    });
  } catch (error: unknown) {
    console.error('Error initializing fonts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to initialize fonts: ${errorMessage}`);
  }
};

const generatePDF = async (
  props: DocumentGeneratorProps,
  documentType: DocumentType,
  showCoverPage: boolean = false
): Promise<Blob> => {
  let instance = null;
  try {
    console.log(`Starting PDF generation for ${documentType}...`);
    
    const { estimateData, formData, companyInfo, clientInfo, quoteInfo } = props;

    // Validate input data
    if (!estimateData || !formData || !companyInfo || !clientInfo || !quoteInfo) {
      throw new Error('Missing required data for PDF generation');
    }

    // Initialize WASM and fonts
    await ensureWASMLoaded();
    await initializeFonts();

    console.log('Creating PDF document with props:', {
      documentType,
      showCoverPage,
      hasEstimateData: !!estimateData,
      hasFormData: !!formData,
      hasCompanyInfo: !!companyInfo,
      hasClientInfo: !!clientInfo,
      hasQuoteInfo: !!quoteInfo
    });

    // Create the PDF document with explicit styles
    const doc = React.createElement(Document, { 
      creator: 'EstimAItor',
      producer: 'EstimAItor PDF Generator',
      language: 'en-US'
    }, 
      React.createElement(QuotePDF, {
        estimateData,
        formData,
        companyInfo,
        clientInfo,
        quoteInfo,
        showCoverPage,
        documentType
      })
    );

    // Initialize PDF instance with retries
    console.log('Initializing PDF instance...');
    instance = await createPDFInstance(doc);
    
    if (!instance) {
      throw new Error('Failed to create PDF instance');
    }

    // Generate the final blob with retries
    console.log('Generating PDF blob...');
    const blob = await generatePDFBlob(instance);

    console.log(`Successfully generated ${documentType} PDF`);
    return blob;
  } catch (error) {
    console.error(`Error generating ${documentType} PDF:`, error);
    throw error;
  } finally {
    // Cleanup
    if (instance && typeof instance.cleanup === 'function') {
      try {
        await instance.cleanup();
      } catch (e) {
        console.warn('Error during PDF instance cleanup:', e);
      }
    }
  }
};

export const generateDocumentPackage = async ({
  estimateData,
  formData,
  companyInfo,
  clientInfo,
  quoteInfo,
}: DocumentGeneratorProps): Promise<void> => {
  try {
    console.log('Starting document package generation...');

    // Validate all required data
    validateDocumentData({ estimateData, formData, companyInfo, clientInfo, quoteInfo });

    // Create new ZIP file
    const zip = new JSZip();
    
    // Generate PDF with retries
    console.log('Generating PDF document...');
    const pdfBlob = await generatePDF(
      {
        estimateData,
        formData,
        companyInfo,
        clientInfo,
        quoteInfo,
      },
      'QUOTE',
      true // Show cover page for quote
    );

    if (!pdfBlob) {
      throw new Error('Failed to generate PDF document');
    }

    // Generate DOCX with retries
    console.log('Generating DOCX document...');
    const docxBlob = await generateQuoteDocx(
      estimateData,
      formData,
      companyInfo,
      clientInfo,
      quoteInfo
    );

    if (!docxBlob) {
      throw new Error('Failed to generate DOCX document');
    }

    // Add files to ZIP
    const sanitizedProjectName = quoteInfo.projectName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Project';
    zip.file(`${sanitizedProjectName}_Quote.pdf`, pdfBlob);
    zip.file(`${sanitizedProjectName}_Quote.docx`, docxBlob);
    
    // Generate and save ZIP
    console.log('Creating ZIP archive...');
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      }
    });

    console.log('Saving document package...');
    saveAs(zipBlob, `${sanitizedProjectName}_Documents.zip`);
    
    console.log('Document package generated successfully');
  } catch (error) {
    console.error('Error generating document package:', error);
    throw new Error(`Failed to generate document package: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 