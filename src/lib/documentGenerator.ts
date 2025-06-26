import JSZip from 'jszip';
import { pdf } from '@react-pdf/renderer';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { EstimateData, FormData } from './types';
import { generateQuoteDocx } from './docxGenerator';
import QuotePDF from '@/components/QuotePDF';

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
      <QuotePDF
        estimateData={estimateData}
        formData={formData}
        companyInfo={companyInfo}
        clientInfo={clientInfo}
        quoteInfo={quoteInfo}
        showCoverPage={true}
      />
    ).toBlob();
    folder.file('Quote.pdf', quotePDFBlob);

    // Generate Quote DOCX
    const quoteDocxBlob = await generateQuoteDocx(
      estimateData,
      formData,
      companyInfo,
      clientInfo,
      quoteInfo
    );
    folder.file('Quote.docx', quoteDocxBlob);

    // Generate Work Order (using the same template but with modified title and content)
    const workOrderQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `WO-${quoteInfo.quoteNumber}`,
    };
    const workOrderBlob = await generateQuoteDocx(
      estimateData,
      formData,
      companyInfo,
      clientInfo,
      workOrderQuoteInfo
    );
    folder.file('Work_Order.docx', workOrderBlob);

    // Generate Purchase Order
    const purchaseOrderQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `PO-${quoteInfo.quoteNumber}`,
    };
    const purchaseOrderBlob = await generateQuoteDocx(
      estimateData,
      formData,
      companyInfo,
      clientInfo,
      purchaseOrderQuoteInfo
    );
    folder.file('Purchase_Order.docx', purchaseOrderBlob);

    // Generate Change Order
    const changeOrderQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `CO-${quoteInfo.quoteNumber}`,
    };
    const changeOrderBlob = await generateQuoteDocx(
      estimateData,
      formData,
      companyInfo,
      clientInfo,
      changeOrderQuoteInfo
    );
    folder.file('Change_Order.docx', changeOrderBlob);

    // Generate Invoice
    const invoiceQuoteInfo = {
      ...quoteInfo,
      quoteNumber: `INV-${quoteInfo.quoteNumber}`,
    };
    const invoiceBlob = await generateQuoteDocx(
      estimateData,
      formData,
      companyInfo,
      clientInfo,
      invoiceQuoteInfo
    );
    folder.file('Invoice.docx', invoiceBlob);

    // Generate and download the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${sanitizedProjectName}_Documents.zip`);
  } catch (error) {
    console.error('Error generating document package:', error);
    throw error;
  }
}; 