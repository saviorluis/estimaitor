import JSZip from 'jszip';
import { pdf, Document, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { EstimateData, FormData } from './types';
import QuotePDF from '@/components/QuotePDF';
import React from 'react';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
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

const generatePDF = async (
  props: DocumentGeneratorProps,
  documentType: DocumentType,
  showCoverPage: boolean = false
): Promise<Blob> => {
  try {
    const { estimateData, formData, companyInfo, clientInfo, quoteInfo } = props;

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
    
    if (!pdfDoc) throw new Error(`Failed to generate ${documentType} PDF`);
    return pdfDoc;
  } catch (error) {
    console.error(`Error generating ${documentType} PDF:`, error);
    throw error;
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
    // Validate required data
    if (!estimateData || !formData || !companyInfo || !clientInfo || !quoteInfo) {
      throw new Error('Missing required data for document generation');
    }

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