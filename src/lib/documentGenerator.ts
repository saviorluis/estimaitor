import JSZip from 'jszip';
import { pdf, Document } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { EstimateData, FormData } from './types';
import QuotePDF from '@/components/QuotePDF';
import React from 'react';

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

export const generateDocumentPackage = async ({
  estimateData,
  formData,
  companyInfo,
  clientInfo,
  quoteInfo,
}: DocumentGeneratorProps): Promise<void> => {
  try {
    const zip = new JSZip();
    const projectName = quoteInfo.projectName.trim() || 'Project';
    const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Create folder for the project
    const folder = zip.folder(sanitizedProjectName);
    if (!folder) throw new Error('Failed to create ZIP folder');

    // Generate Quote PDF
    const quotePDFBlob = await pdf(
      React.createElement(Document, {}, 
        React.createElement(QuotePDF, {
          estimateData,
          formData,
          companyInfo,
          clientInfo,
          quoteInfo,
          showCoverPage: true,
          documentType: "QUOTE"
        })
      )
    ).toBlob();
    folder.file('Quote.pdf', quotePDFBlob);

    // Generate Work Order PDF
    const workOrderQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `WO-${quoteInfo.quoteNumber}`,
    };
    const workOrderBlob = await pdf(
      React.createElement(Document, {}, 
        React.createElement(QuotePDF, {
          estimateData,
          formData,
          companyInfo,
          clientInfo,
          quoteInfo: workOrderQuoteInfo,
          showCoverPage: false,
          documentType: "WORK_ORDER"
        })
      )
    ).toBlob();
    folder.file('Work_Order.pdf', workOrderBlob);

    // Generate Purchase Order PDF
    const purchaseOrderQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `PO-${quoteInfo.quoteNumber}`,
    };
    const purchaseOrderBlob = await pdf(
      React.createElement(Document, {}, 
        React.createElement(QuotePDF, {
          estimateData,
          formData,
          companyInfo,
          clientInfo,
          quoteInfo: purchaseOrderQuoteInfo,
          showCoverPage: false,
          documentType: "PURCHASE_ORDER"
        })
      )
    ).toBlob();
    folder.file('Purchase_Order.pdf', purchaseOrderBlob);

    // Generate Change Order PDF
    const changeOrderQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `CO-${quoteInfo.quoteNumber}`,
    };
    const changeOrderBlob = await pdf(
      React.createElement(Document, {}, 
        React.createElement(QuotePDF, {
          estimateData,
          formData,
          companyInfo,
          clientInfo,
          quoteInfo: changeOrderQuoteInfo,
          showCoverPage: false,
          documentType: "CHANGE_ORDER"
        })
      )
    ).toBlob();
    folder.file('Change_Order.pdf', changeOrderBlob);

    // Generate Invoice PDF
    const invoiceQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `INV-${quoteInfo.quoteNumber}`,
    };
    const invoiceBlob = await pdf(
      React.createElement(Document, {}, 
        React.createElement(QuotePDF, {
          estimateData,
          formData,
          companyInfo,
          clientInfo,
          quoteInfo: invoiceQuoteInfo,
          showCoverPage: false,
          documentType: "INVOICE"
        })
      )
    ).toBlob();
    folder.file('Invoice.pdf', invoiceBlob);

    // Generate and download the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${sanitizedProjectName}_Documents.zip`);
  } catch (error) {
    console.error('Error generating document package:', error);
    throw error;
  }
}; 