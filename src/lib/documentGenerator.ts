import JSZip from 'jszip';
import { pdf, Document, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { EstimateData, FormData } from './types';
import QuotePDF from '@/components/QuotePDF';
import React from 'react';

// Font registration function
const registerFonts = async () => {
  try {
    // Check if fonts are already registered
    if (Font.getRegisteredFontFamilies().includes('Roboto')) {
      console.log('Fonts already registered');
      return;
    }

    // Register fonts
    Font.register({
      family: 'Roboto',
      fonts: [
        { 
          src: '/fonts/roboto-regular-webfont.ttf',
          fontWeight: 'normal',
          fontStyle: 'normal'
        },
        { 
          src: '/fonts/roboto-bold-webfont.ttf',
          fontWeight: 'bold',
          fontStyle: 'normal'
        },
        { 
          src: '/fonts/roboto-italic-webfont.ttf',
          fontWeight: 'normal',
          fontStyle: 'italic'
        },
        { 
          src: '/fonts/roboto-bolditalic-webfont.ttf',
          fontWeight: 'bold',
          fontStyle: 'italic'
        }
      ],
    });
    console.log('Fonts registered successfully');
  } catch (error) {
    console.error('Error registering fonts:', error);
    throw new Error(`Failed to register fonts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

const generatePDF = async (
  props: DocumentGeneratorProps,
  documentType: DocumentType,
  showCoverPage: boolean = false
): Promise<Blob> => {
  try {
    console.log(`Starting PDF generation for ${documentType}...`);
    
    // Register fonts before generating PDF
    await registerFonts();
    
    const { estimateData, formData, companyInfo, clientInfo, quoteInfo } = props;

    console.log('Creating PDF document with props:', {
      documentType,
      showCoverPage,
      hasEstimateData: !!estimateData,
      hasFormData: !!formData,
      hasCompanyInfo: !!companyInfo,
      hasClientInfo: !!clientInfo,
      hasQuoteInfo: !!quoteInfo
    });

    // Create the PDF document
    const pdfDoc = await pdf(
      React.createElement(Document, {}, 
        React.createElement(QuotePDF, {
          estimateData,
          formData,
          companyInfo,
          clientInfo,
          quoteInfo,
          showCoverPage,
          documentType
        })
      )
    ).toBlob();
    
    if (!pdfDoc) {
      console.error(`Failed to generate ${documentType} PDF: PDF blob is null`);
      throw new Error(`Failed to generate ${documentType} PDF: PDF blob is null`);
    }

    console.log(`Successfully generated ${documentType} PDF`);
    return pdfDoc;
  } catch (error) {
    console.error(`Error generating ${documentType} PDF:`, error);
    console.error('Error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to generate ${documentType} PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    console.log('Starting document package generation with:', {
      clientInfo,
      companyInfo,
      quoteInfo,
      hasEstimateData: !!estimateData,
      hasFormData: !!formData
    });

    // Validate all required data
    validateDocumentData({ estimateData, formData, companyInfo, clientInfo, quoteInfo });

    const zip = new JSZip();
    const projectName = quoteInfo.projectName.trim() || 'Project';
    const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Create folder for the project
    const folder = zip.folder(sanitizedProjectName);
    if (!folder) throw new Error('Failed to create ZIP folder');

    // Define document configurations
    const documents: Array<{ type: DocumentType; prefix: string; showCover: boolean }> = [
      { type: 'QUOTE', prefix: '', showCover: true },
      { type: 'WORK_ORDER', prefix: 'WO-', showCover: false },
      { type: 'PURCHASE_ORDER', prefix: 'PO-', showCover: false },
      { type: 'CHANGE_ORDER', prefix: 'CO-', showCover: false },
      { type: 'INVOICE', prefix: 'INV-', showCover: false }
    ];

    // Generate all documents
    for (const doc of documents) {
      try {
        const modifiedQuoteInfo = {
          ...quoteInfo,
          quoteNumber: `${doc.prefix}${quoteInfo.quoteNumber}`,
        };

        const pdfBlob = await generatePDF(
          {
            estimateData,
            formData,
            companyInfo,
            clientInfo,
            quoteInfo: modifiedQuoteInfo,
          },
          doc.type,
          doc.showCover
        );

        const fileName = `${doc.type.replace('_', ' ')}.pdf`;
        folder.file(fileName, pdfBlob);
      } catch (error) {
        console.error(`Error generating ${doc.type}:`, error);
        throw new Error(`Failed to generate ${doc.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Generate and download the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    if (!zipBlob) throw new Error('Failed to generate ZIP file');
    
    saveAs(zipBlob, `${sanitizedProjectName}_Documents.zip`);
  } catch (error) {
    console.error('Error generating document package:', error);
    throw new Error(`Failed to generate document package: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 