import JSZip from 'jszip';
import { pdf, Document, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { EstimateData, FormData } from './types';
import QuotePDF from '@/components/QuotePDF';
import React from 'react';
import { fonts } from './fonts';

// Register fonts statically
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: fonts.regular,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    {
      src: fonts.bold,
      fontWeight: 'bold',
      fontStyle: 'normal'
    },
    {
      src: fonts.italic,
      fontWeight: 'normal',
      fontStyle: 'italic'
    },
    {
      src: fonts.boldItalic,
      fontWeight: 'bold',
      fontStyle: 'italic'
    }
  ]
});

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
    
    const { estimateData, formData, companyInfo, clientInfo, quoteInfo } = props;

    // Validate input data
    if (!estimateData || !formData || !companyInfo || !clientInfo || !quoteInfo) {
      throw new Error('Missing required data for PDF generation');
    }

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
    const doc = React.createElement(Document, {}, 
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

    // Initialize PDF instance with proper WASM loading
    const instance = pdf(doc);
    if (!instance) {
      throw new Error('Failed to initialize PDF instance');
    }

    // Generate the final blob
    const blob = await instance.toBlob();
    if (!blob) {
      throw new Error('Failed to generate PDF blob');
    }

    console.log(`Successfully generated ${documentType} PDF`);
    return blob;
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
    console.log('Starting document package generation...');

    // Validate all required data
    validateDocumentData({ estimateData, formData, companyInfo, clientInfo, quoteInfo });

    // For now, let's focus on generating just the quote
    console.log('Generating quote document...');
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
      throw new Error('Failed to generate quote PDF');
    }

    // Save the PDF directly
    const sanitizedProjectName = quoteInfo.projectName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Project';
    const fileName = `${sanitizedProjectName}_Quote.pdf`;
    
    console.log('Saving quote PDF...');
    saveAs(pdfBlob, fileName);
    console.log('Quote generation completed successfully');
  } catch (error) {
    console.error('Error generating document package:', error);
    throw new Error(`Failed to generate document package: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 