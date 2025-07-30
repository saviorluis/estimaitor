'use client';

import React, { useState, useEffect } from 'react';
import { EstimateData, FormData } from '@/lib/types';
import { formatDate, formatCurrency, generateQuoteNumber, getQuoteCounter, incrementQuoteCounter } from '@/lib/utils';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QuotePDF from './QuotePDF';
import WorkOrderPDF from './WorkOrderPDF';
import PurchaseOrderPDF from './PurchaseOrderPDF';
import InvoicePDF from './InvoicePDF';
import ChangeOrderPDF from './ChangeOrderPDF'; // Added import for ChangeOrderPDF
import WorkOrderPDFSpanish from './WorkOrderPDFSpanish';
import { SCOPE_OF_WORK } from '@/lib/constants';

// Inline logo component to avoid import issues
const CompanyLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/assets/logo.png" 
        alt="BBPS Logo"
        className="w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
}

interface QuoteTemplateProps {
  estimateData: EstimateData;
  formData: FormData;
}

const QuoteTemplate: React.FC<QuoteTemplateProps> = ({ estimateData, formData }) => {
  // State for custom markup percentage
  const [markupPercentage, setMarkupPercentage] = useState<number>(0);
  const [adjustedPrices, setAdjustedPrices] = useState<{[key: string]: number}>({});
  // State for quote counter
  const [quoteCounter, setQuoteCounter] = useState<number>(() => getQuoteCounter());
  // Remove the showCoverPage state since it's always true for quotes

  // Early return if data isn't fully loaded
  if (!estimateData || !formData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading quote data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your quote.</p>
        </div>
      </div>
    );
  }

  // Company information state - initialize from localStorage if available
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    // Only run this code on the client side
    if (typeof window !== 'undefined') {
      const savedCompanyInfo = localStorage.getItem('quoteCompanyInfo');
      return savedCompanyInfo ? JSON.parse(savedCompanyInfo) : {
        name: "Big Brother Property Solutions",
        address: "1200 Eastchester Dr.",
        city: "High Point, NC 27265",
        phone: "(336) 624-7442",
        email: "bids@bigbroprops.com",
        website: "www.bigbrotherpropertysolutions.com"
      };
    }
    return {
      name: "Big Brother Property Solutions",
      address: "1200 Eastchester Dr.",
      city: "High Point, NC 27265",
      phone: "(336) 624-7442",
      email: "bids@bigbroprops.com",
      website: "www.bigbrotherpropertysolutions.com"
    };
  });

  // State to track if company info is being edited
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(false);

  // Client information state - initialize from localStorage if available
  const [clientInfo, setClientInfo] = useState(() => {
    // Only run this code on the client side
    if (typeof window !== 'undefined') {
      const savedClientInfo = localStorage.getItem('quoteClientInfo');
      return savedClientInfo ? JSON.parse(savedClientInfo) : {
        name: '',
        company: '',
        address: '',
        email: '',
        phone: '',
      };
    }
    return {
      name: '',
      company: '',
      address: '',
      email: '',
      phone: '',
    };
  });

  // Default terms and conditions
  const defaultTerms = `1. Payment Terms: Net 15 - Payment due within 15 days of completion.
2. Cancellation Policy: 48-hour notice required for cancellation or rescheduling.
3. Scope: This quote covers only the services explicitly described.
4. Additional Services: Any services not specified will be quoted separately.
5. Access: Client must provide necessary access to the property.
6. Utilities: Working electricity and water must be available on-site.
7. Quote Validity: This quote is valid for 30 days from the date issued.
8. Reschedule/Site Access Policy: If reschedule is required due to site not being ready or poor planning on client's end, a minimum fee of $250 will be charged for the return trip.`;

  // Quote information state
  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: generateQuoteNumber(),
    date: formatDate(new Date()),
    validUntil: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    projectName: '',
    projectAddress: '',
    notes: 'This quote includes all labor, materials, equipment, and supplies needed to complete the specified cleaning services.',
    terms: defaultTerms,
    total: 0 // Initialize total
  });

  // Update total when estimate changes
  useEffect(() => {
    setQuoteInfo(prev => ({
      ...prev,
      total: estimateData.totalPrice
    }));
  }, [estimateData.totalPrice]);

  // Handle company information changes
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedCompanyInfo = {
      ...companyInfo,
      [name]: value
    };
    setCompanyInfo(updatedCompanyInfo);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('quoteCompanyInfo', JSON.stringify(updatedCompanyInfo));
    }
  };

  // Handle client information changes
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedClientInfo = {
      ...clientInfo,
      [name]: value
    };
    setClientInfo(updatedClientInfo);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('quoteClientInfo', JSON.stringify(updatedClientInfo));
    }
  };

  // Handle quote information changes
  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuoteInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle markup percentage change
  const handleMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newValue = isNaN(value) ? 0 : value;
    setMarkupPercentage(newValue);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('quoteMarkupPercentage', newValue.toString());
    }
  };

  // Handle quote counter increment
  const handleIncrementCounter = () => {
    const newCounter = incrementQuoteCounter();
    setQuoteCounter(newCounter);
    // Update the quote number in the quoteInfo state
    setQuoteInfo(prev => ({
      ...prev,
      quoteNumber: `Q-${new Date().getFullYear()}-${newCounter}`
    }));
  };

  // Calculate adjusted prices with markup
  useEffect(() => {
    if (!estimateData) return;

    // Get all the line items
      const lineItems = [
        {
          key: 'basePrice',
        value: (estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)
        }
      ];

      if (formData.hasVCT) {
        lineItems.push({ key: 'vctCost', value: estimateData.vctCost || 0 });
      }

      if (formData.needsPressureWashing) {
        lineItems.push({ key: 'pressureWashingCost', value: estimateData.pressureWashingCost || 0 });
      }

      lineItems.push({ key: 'travelCost', value: estimateData.travelCost || 0 });

      if (formData.stayingOvernight) {
        lineItems.push({ key: 'overnightCost', value: estimateData.overnightCost || 0 });
      }

      if (estimateData.urgencyMultiplier > 1) {
        const urgencyCost = (((estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)) +
          (estimateData.vctCost || 0) + (estimateData.travelCost || 0) + (estimateData.overnightCost || 0) + (estimateData.pressureWashingCost || 0)) *
          ((estimateData.urgencyMultiplier || 1) - 1);
        lineItems.push({ key: 'urgencyCost', value: urgencyCost });
      }

      if (formData.needsWindowCleaning) {
        lineItems.push({ key: 'windowCleaningCost', value: estimateData.windowCleaningCost || 0 });
      }

    // Display case cleaning for jewelry stores
      if (formData.projectType === 'jewelry_store' && estimateData.displayCaseCost > 0) {
        lineItems.push({ key: 'displayCaseCost', value: estimateData.displayCaseCost || 0 });
      }

    // Calculate total before markup
    const totalBeforeMarkup = lineItems.reduce((sum, item) => sum + item.value, 0);
      
    // If markup percentage is 0, and there's no built-in markup, use original prices
    if (markupPercentage === 0 && estimateData.markup === 0) {
        setAdjustedPrices({});
        return;
      }

    // If there's no custom markup but there is built-in markup, we don't need to adjust
    if (markupPercentage === 0 && estimateData.markup > 0) {
      setAdjustedPrices({});
      return;
    }

    // Calculate markup amount
    const markupAmount = totalBeforeMarkup * (markupPercentage / 100);
    
    // Distribute markup proportionally
      const adjustedPrices: {[key: string]: number} = {};
      lineItems.forEach(item => {
      const proportion = item.value / totalBeforeMarkup;
      const itemMarkup = markupAmount * proportion;
      adjustedPrices[item.key] = item.value + itemMarkup;
      });

      // Balance window cleaning pricing with base price
    const balancedPrices = balancePricing(adjustedPrices, lineItems, totalBeforeMarkup);
      if (Object.keys(balancedPrices).length > 0) {
        setAdjustedPrices(balancedPrices);
      } else {
        setAdjustedPrices(adjustedPrices);
      }
  }, [estimateData, formData, markupPercentage]);

  // Function to balance window cleaning pricing with base cleaning cost
  const balancePricing = (
    adjustedPrices: {[key: string]: number}, 
    lineItems: Array<{key: string, value: number}>, 
    totalBeforeMarkup: number
  ): {[key: string]: number} => {
    const result = {...adjustedPrices};
    
    // Find the base price and window cleaning items
    const basePrice = lineItems.find(item => item.key === 'basePrice');
    const windowCleaning = lineItems.find(item => item.key === 'windowCleaningCost');
    
    // Only balance if both exist and window cleaning is being charged
    if (basePrice && windowCleaning && windowCleaning.value > 0 && formData.needsWindowCleaning) {
      // Only apply if markup has been applied
      if (markupPercentage > 0) {
        // Calculate original markup for window cleaning
        const windowProportion = windowCleaning.value / totalBeforeMarkup;
        const windowMarkup = (totalBeforeMarkup * (markupPercentage / 100)) * windowProportion;
        
        // Calculate how much to transfer (50% of the window cleaning markup)
        const transferAmount = windowMarkup * 0.5;
        
        // Remove the transfer amount from window cleaning
        result['windowCleaningCost'] = adjustedPrices['windowCleaningCost'] - transferAmount;
        
        // Add the transfer amount to base price
        result['basePrice'] = adjustedPrices['basePrice'] + transferAmount;
        
        return result;
      }
    }
    
    return {};
  };

  // Get adjusted price for a line item
  const getAdjustedPrice = (key: string, originalPrice: number): number => {
    return adjustedPrices[key] !== undefined ? adjustedPrices[key] : originalPrice;
  };

  // Calculate adjusted total
  const calculateAdjustedTotal = (): number => {
    if (!estimateData || Object.keys(adjustedPrices).length === 0) {
      return estimateData?.totalPrice || 0;
    }

    // Sum all adjusted prices
    let subtotal = 0;
    
    // Base price
    subtotal += getAdjustedPrice('basePrice', 
      (estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1));
    
    // VCT cost
    if (formData.hasVCT) {
      subtotal += getAdjustedPrice('vctCost', estimateData.vctCost || 0);
    }
    
    // Pressure washing
    if (formData.needsPressureWashing) {
      subtotal += getAdjustedPrice('pressureWashingCost', estimateData.pressureWashingCost || 0);
    }
    
    // Travel cost
    subtotal += getAdjustedPrice('travelCost', estimateData.travelCost || 0);
    
    // Overnight cost
    if (formData.stayingOvernight) {
      subtotal += getAdjustedPrice('overnightCost', estimateData.overnightCost || 0);
    }
    
    // Urgency cost
    if (estimateData.urgencyMultiplier > 1) {
      const urgencyCost = (((estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)) +
        (estimateData.vctCost || 0) + (estimateData.travelCost || 0) + (estimateData.overnightCost || 0) + (estimateData.pressureWashingCost || 0)) *
        ((estimateData.urgencyMultiplier || 1) - 1);
      subtotal += getAdjustedPrice('urgencyCost', urgencyCost);
    }
    
    // Window cleaning
    if (formData.needsWindowCleaning) {
      subtotal += getAdjustedPrice('windowCleaningCost', estimateData.windowCleaningCost || 0);
    }
    
    // Display case cleaning for jewelry stores
    if (formData.projectType === 'jewelry_store' && estimateData.displayCaseCost > 0) {
      subtotal += getAdjustedPrice('displayCaseCost', estimateData.displayCaseCost || 0);
    }
    
    // Add sales tax
    const salesTax = subtotal * 0.07;
    
    // Return total
    return subtotal + salesTax;
  };

  // Get cleaning type display name
  const getCleaningTypeDisplay = (type: string): string => {
    switch (type) {
      case 'rough': return 'Rough Clean';
      case 'final': return 'Final Clean';
      case 'rough_final': return 'Rough & Final Clean';
      case 'rough_final_touchup': return 'Rough, Final & Touch-up Clean';
      case 'pressure_washing': return 'Pressure Washing Services';
      default: return type;
    }
  };

  // Get project type display name
  const getProjectTypeDisplay = (type: string): string => {
    switch (type) {
      case 'jewelry_store': return 'Jewelry Store';
      case 'grocery_store': return 'Grocery Store';
      case 'fast_food': return 'Fast Food Restaurant';
      case 'yoga_studio': return 'Yoga Studio';
      case 'kids_fitness': return 'Children\'s Fitness Center';
      case 'bakery': return 'Bakery';
      case 'interactive_toy_store': return 'Interactive Toy Store';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  // Handle print function - add a slight delay to ensure styles are applied
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Direct PDF download using react-pdf
  const handlePDFDownload = async () => {
    console.log('PDF download button clicked');
    try {
      // Create a blob from the PDF document
      console.log('Creating PDF blob...');
      
      // Create adjusted estimate data with the EXACT same calculation as the browser preview
      const adjustedEstimateData = {...estimateData};
    
    // Calculate subtotal EXACTLY as shown in the browser preview
      // This is a direct copy of the calculation used in the print view
    const subtotal = Object.keys(adjustedPrices).length > 0 
      ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0)
      : estimateData.totalBeforeMarkup;
    
    // Calculate sales tax 
    const salesTax = subtotal * 0.07;
    
      // Set all the values for the PDF
    adjustedEstimateData.totalBeforeMarkup = subtotal;
      // Set markup to 0 since we're distributing it across the line items
      adjustedEstimateData.markup = 0;
    adjustedEstimateData.salesTax = salesTax;
    adjustedEstimateData.totalPrice = subtotal + salesTax;
    
    // Add adjusted line items to the estimate data
    if (Object.keys(adjustedPrices).length > 0) {
      adjustedEstimateData.adjustedLineItems = adjustedPrices;
    } else {
        // Ensure the base price includes the cleaning type multiplier
      adjustedEstimateData.adjustedLineItems = {
          basePrice: estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier
        };
      }
      
      const blob = await pdf(
        <QuotePDF 
          estimateData={adjustedEstimateData} 
          formData={formData} 
          companyInfo={companyInfo}
          clientInfo={clientInfo}
          quoteInfo={quoteInfo}
          adjustedPrices={adjustedPrices}
        />
      ).toBlob();
      
      console.log('PDF blob created successfully');

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      console.log('Created URL for blob:', url);
      
      // Generate filename based on project name and location
      const projectName = quoteInfo.projectName.trim() || 'Quote';
      const projectLocation = quoteInfo.projectAddress.trim() || '';
      const fileName = projectName && projectLocation 
        ? `${projectName} ${projectLocation} Quote.pdf`
        : `Quote-${quoteInfo.quoteNumber}.pdf`;
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      console.log('Clicking download link...');
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
      console.log('PDF download process completed');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Falling back to print dialog.');
      // Fallback to print dialog if PDF generation fails
      handlePrint();
    }
  };

  // Handle ZIP package download
  const handlePackageDownload = async () => {
    try {
      const zip = new JSZip();
      
      // Extract just the number from quote number (e.g., "123" from "Q-2025-123")
      const quoteNumberParts = quoteInfo.quoteNumber.split('-');
      const quoteNumberOnly = quoteNumberParts[quoteNumberParts.length - 1] || quoteInfo.quoteNumber;

      // Create adjusted estimate data with the EXACT same calculation as the browser preview
      const adjustedEstimateData = {...estimateData};
    
      // Calculate subtotal EXACTLY as shown in the browser preview
      const subtotal = Object.keys(adjustedPrices).length > 0 
        ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0)
        : estimateData.totalBeforeMarkup;
      
      // Calculate sales tax 
      const salesTax = subtotal * 0.07;
      
      // Set all the values for the PDF
      adjustedEstimateData.totalBeforeMarkup = subtotal;
      // Set markup to 0 since we're distributing it across the line items
      adjustedEstimateData.markup = 0;
      adjustedEstimateData.salesTax = salesTax;
      adjustedEstimateData.totalPrice = subtotal + salesTax;
      
      // Add adjusted line items to the estimate data
      if (Object.keys(adjustedPrices).length > 0) {
        adjustedEstimateData.adjustedLineItems = adjustedPrices;
      } else {
        // Ensure the base price includes the cleaning type multiplier
        adjustedEstimateData.adjustedLineItems = {
          basePrice: estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier
        };
      }

      // Generate Quote PDF
      const quoteBlob = await pdf(
        <QuotePDF
          estimateData={adjustedEstimateData}
          formData={formData}
          companyInfo={companyInfo}
          clientInfo={clientInfo}
          quoteInfo={quoteInfo}
          adjustedPrices={adjustedPrices}
        />
      ).toBlob();
      zip.file("quote.pdf", quoteBlob);

      // Generate Work Order PDF (English)
      const workOrderBlob = await pdf(
        <WorkOrderPDF
          estimateData={adjustedEstimateData}
          formData={formData}
          companyInfo={companyInfo}
          quoteInfo={quoteInfo}
        />
      ).toBlob();
      zip.file(`${quoteInfo.projectName} Work Order.pdf`, workOrderBlob);

      // Generate Work Order PDF (Spanish)
      const workOrderSpanishBlob = await pdf(
        <WorkOrderPDFSpanish
          estimateData={adjustedEstimateData}
          formData={formData}
          companyInfo={companyInfo}
          quoteInfo={quoteInfo}
        />
      ).toBlob();
      zip.file(`${quoteInfo.projectName} Work Order Spanish.pdf`, workOrderSpanishBlob);

      // Generate Purchase Order PDF
      const purchaseOrderBlob = await pdf(
        <PurchaseOrderPDF
          estimateData={adjustedEstimateData}
          formData={formData}
          companyInfo={companyInfo}
          quoteInfo={quoteInfo}
        />
      ).toBlob();
      zip.file(`${quoteInfo.projectName} Purchase Order.pdf`, purchaseOrderBlob);

      // Generate Invoice PDF
      const invoiceInfo = {
        invoiceNumber: quoteInfo.quoteNumber,
        date: formatDate(new Date()),
        dueDate: formatDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), // 15 days from now
        paymentTerms: "Net 15 - Payment due within 15 days of invoice date",
      };

      const invoiceBlob = await pdf(
        <InvoicePDF
          estimateData={adjustedEstimateData}
          formData={formData}
          companyInfo={companyInfo}
          quoteInfo={quoteInfo}
          invoiceInfo={invoiceInfo}
        />
      ).toBlob();
      zip.file(`${quoteNumberOnly} ${quoteInfo.projectName} Invoice.pdf`, invoiceBlob);

      // Generate Change Order PDF
      const changeOrderInfo = {
        orderNumber: quoteInfo.quoteNumber,
        date: formatDate(new Date()),
        projectName: quoteInfo.projectName,
        projectAddress: quoteInfo.projectAddress,
      };

      const changeOrderBlob = await pdf(
        <ChangeOrderPDF
          formData={formData}
          companyInfo={companyInfo}
          clientInfo={clientInfo}
          changeOrderInfo={changeOrderInfo}
        />
      ).toBlob();
      zip.file(`${quoteInfo.projectName} Change Order.pdf`, changeOrderBlob);

      // Generate and save the zip file
      const content = await zip.generateAsync({ type: "blob" });
      // Extract city and state from the project address
      const addressParts = quoteInfo.projectAddress.split(',').map(part => part.trim());
      const city = addressParts[addressParts.length - 2] || '';
      const state = addressParts[addressParts.length - 1] || '';
      
      // Create filename: project name + quote number (without year) + city, state
      const projectName = quoteInfo.projectName.trim() || 'Project';
      const cityState = city && state ? `${city}, ${state}` : (quoteInfo.projectAddress.trim() || 'Location');
      const fileName = `${projectName} ${quoteNumberOnly} ${cityState}.zip`;
      saveAs(content, fileName);

      // Increment the quote counter after successful generation
      handleIncrementCounter();
    } catch (error) {
      console.error('Error generating package:', error);
      alert('Error generating document package. Please try again.');
    }
  };

  useEffect(() => {
    // Add a class to the body when component mounts for print-specific CSS
    document.body.classList.add('quote-print-ready');
    
    // Remove it when component unmounts
    return () => {
      document.body.classList.remove('quote-print-ready');
    };
  }, []);



  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8 print:shadow-none print:p-0 print:my-0 print:max-w-none">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="space-x-4">
          <button
            onClick={handlePDFDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={handlePackageDownload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Download Package
          </button>
        </div>
      </div>

      {/* Your Company Information - Hidden when printing */}
      <div className="mb-6 print:hidden">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold border-b pb-1">Your Company Information</h3>
          <button
            onClick={() => setEditingCompanyInfo(!editingCompanyInfo)}
            className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
          >
            {editingCompanyInfo ? 'Done Editing' : 'Edit Company Info'}
          </button>
        </div>

        <div className="flex">
          {editingCompanyInfo ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input
                  type="text"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="text"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                <input
                  type="text"
                  name="city"
                  value={companyInfo.city}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                <input
                  type="text"
                  name="website"
                  value={companyInfo.website}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg w-full">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name:</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{companyInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone:</p>
                <p className="text-gray-900 dark:text-gray-100">{companyInfo.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address:</p>
                <p className="text-gray-900 dark:text-gray-100">{companyInfo.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</p>
                <p className="text-gray-900 dark:text-gray-100">{companyInfo.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">City:</p>
                <p className="text-gray-900 dark:text-gray-100">{companyInfo.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website:</p>
                <p className="text-gray-900 dark:text-gray-100">{companyInfo.website}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Client Information - Hidden when printing */}
      <div className="mb-6 print:hidden">
        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Client Information (For Quote)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
            <input
              type="text"
              name="name"
              value={clientInfo.name}
              onChange={handleClientChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input
              type="text"
              name="phone"
              value={clientInfo.phone}
              onChange={handleClientChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter client phone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
            <input
              type="text"
              name="company"
              value={clientInfo.company}
              onChange={handleClientChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter client company"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="text"
              name="email"
              value={clientInfo.email}
              onChange={handleClientChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter client email"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <input
              type="text"
              name="address"
              value={clientInfo.address}
              onChange={handleClientChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter client address"
            />
          </div>
        </div>
      </div>

      {/* Quote Information */}
      <div className="mb-6 print:hidden">
        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Project and Quote Details</h3>
        
        {/* Price Adjustment Controls */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💰 Price Adjustment Controls
          </label>
          
          {/* Built-in Professional Markup Display */}
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800 font-medium">✅ Professional Markup (Built-in)</span>
              <span className="text-sm text-green-700 font-semibold">30%</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              All estimates automatically include 30% professional markup covering overhead, insurance, and profit margins.
            </p>
          </div>
          
          {/* Additional Adjustment Controls */}
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-3">Additional Adjustment:</label>
            <input
              type="number"
              min="-50"
              max="100"
              step="1"
              value={markupPercentage}
              onChange={handleMarkupChange}
              className="block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">%</span>
            <div className="ml-4 text-sm text-gray-600">
              {markupPercentage > 0 ? (
                <span className="text-blue-700">+{markupPercentage}% increase</span>
              ) : markupPercentage < 0 ? (
                <span className="text-orange-700">{markupPercentage}% discount</span>
              ) : (
                <span className="text-gray-600">No additional adjustment</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use positive values to increase prices further, or negative values to provide discounts while maintaining profitability.
          </p>
        </div>
        
        {/* Quote Counter Input */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quote Number
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              step="1"
              value={quoteCounter}
              onChange={(e) => {
                const newValue = parseInt(e.target.value, 10);
                if (!isNaN(newValue) && newValue > 0) {
                  setQuoteCounter(newValue);
                  // Save to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('quoteCounter', newValue.toString());
                  }
                  // Update the quote number in quoteInfo
                  setQuoteInfo(prev => ({
                    ...prev,
                    quoteNumber: `Q-${new Date().getFullYear()}-${newValue}`
                  }));
                }
              }}
              className="block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="ml-4 text-sm text-gray-600">
              Current Quote #: <span className="font-semibold">{quoteCounter}</span>
        </div>
      </div>
          <p className="text-xs text-gray-500 mt-2">
            Quote counter starts from 121 and will be remembered between sessions.
          </p>
    </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={quoteInfo.projectName}
              onChange={handleQuoteChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quote Number</label>
            <input
              type="text"
              name="quoteNumber"
              value={quoteInfo.quoteNumber}
              onChange={handleQuoteChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Quote number (auto-generated)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Address</label>
            <input
              type="text"
              name="projectAddress"
              value={quoteInfo.projectAddress}
              onChange={handleQuoteChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter project location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valid Until</label>
            <input
              type="text"
              name="validUntil"
              value={quoteInfo.validUntil}
              onChange={handleQuoteChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Expiration date (auto-generated)"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              name="notes"
              value={quoteInfo.notes}
              onChange={handleQuoteChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Additional notes about the project"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
            <textarea
              name="terms"
              value={quoteInfo.terms}
              onChange={handleQuoteChange}
              rows={8}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Terms and conditions for the quote"
            />
          </div>
        </div>
      </div>


      {/* ACTUAL QUOTE DISPLAY - This shows the formatted quote for preview and printing */}
      <div className="quote-display print:block">
        {/* Cover Page */}
        <div className="cover-page bg-white min-h-screen flex flex-col items-center justify-center text-center p-8 print:page-break-after">
          {/* Company Logo */}
          <div className="mb-8">
            <CompanyLogo className="w-48 h-24" />
          </div>

          {/* Title */}
          <div className="mb-8">
            {formData.cleaningType === 'pressure_washing' ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">PRESSURE WASHING</h1>
                <h2 className="text-2xl font-bold text-gray-800">SERVICES PROPOSAL</h2>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">POST CONSTRUCTION</h1>
                <h2 className="text-2xl font-bold text-gray-800">CLEANING PROPOSAL</h2>
              </>
            )}
          </div>

          {/* Prepared For Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Prepared for:</h3>
            <p className="text-xl font-bold text-gray-800 mb-2">
              {clientInfo.company || clientInfo.name || 'Client Name'}
            </p>
            
            <p className="text-base mb-1">
              <strong>Project:</strong> {quoteInfo.projectName || 'Project Name'}
            </p>
            <p className="text-base mb-4">
              <strong>Location:</strong> {quoteInfo.projectAddress || 'Project Address'}
            </p>
            
            <p className="text-base font-bold text-blue-600">
              Quote #: {quoteInfo.quoteNumber}
            </p>
          </div>

          {/* Company Contact Info */}
          <div className="mt-auto">
            <p className="text-lg font-bold mb-2">{companyInfo.name}</p>
            <p className="text-sm mb-1">{companyInfo.phone} | {companyInfo.email}</p>
            <p className="text-sm mb-1">{companyInfo.address}, {companyInfo.city}</p>
            <p className="text-sm">{companyInfo.website}</p>
          </div>
        </div>

        {/* Second Page - Detailed Quote */}
        <div className="quote-details bg-white min-h-screen p-8 print:page-break-before">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center">
              <CompanyLogo className="w-32 h-16 mr-4" />
              <div>
                <h3 className="font-bold text-lg">{companyInfo.name}</h3>
                <p className="text-sm">{companyInfo.address}</p>
                <p className="text-sm">{companyInfo.city}</p>
                <p className="text-sm">Phone: {companyInfo.phone}</p>
                <p className="text-sm">Email: {companyInfo.email}</p>
                <p className="text-sm">Website: {companyInfo.website}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600">QUOTE #{quoteInfo.quoteNumber}</h2>
              <p className="text-sm">Date: {quoteInfo.date}</p>
              <p className="text-sm">Valid Until: {quoteInfo.validUntil}</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Client Information</h3>
            <p className="text-sm">{clientInfo.name}</p>
            <p className="text-sm">{clientInfo.company}</p>
            <p className="text-sm">{clientInfo.address}</p>
            <p className="text-sm">{clientInfo.email}</p>
            <p className="text-sm">{clientInfo.phone}</p>
          </div>

          {/* Project Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Project Information</h3>
            <p className="text-sm"><strong>Project:</strong> {quoteInfo.projectName}</p>
            <p className="text-sm"><strong>Address:</strong> {quoteInfo.projectAddress}</p>
            <p className="text-sm"><strong>Type:</strong> {getProjectTypeDisplay(formData.projectType)}</p>
            <p className="text-sm"><strong>Square Footage:</strong> {(formData.squareFootage || 0).toLocaleString()} sq ft</p>
            <p className="text-sm"><strong>Cleaning Type:</strong> {getCleaningTypeDisplay(formData.cleaningType)}</p>
          </div>

          {/* Service Details & Pricing */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-1">Service Details & Pricing</h3>
            
            {/* Base Cleaning Service */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <div className="flex-1">
                <p className="font-semibold">{getCleaningTypeDisplay(formData.cleaningType)}</p>
                <p className="text-sm text-gray-600">{formData.squareFootage?.toLocaleString()} sq ft</p>
              </div>
              <div className="text-right font-medium">
                {formatCurrency(getAdjustedPrice('basePrice', 
                  (estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)))}
              </div>
            </div>

            {/* VCT Flooring */}
            {formData.hasVCT && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold">VCT Flooring Treatment</p>
                  <p className="text-sm text-gray-600">{(formData.vctSquareFootage || 0).toLocaleString()} sq ft of VCT flooring</p>
                  <p className="text-sm text-gray-600">Vinyl Composition Tile floor cleaning and maintenance</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(getAdjustedPrice('vctCost', estimateData.vctCost || 0))}
                </div>
              </div>
            )}

            {/* Travel Expenses */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <div className="flex-1">
                <p className="font-semibold">Travel Expenses</p>
                <p className="text-sm text-gray-600">Travel to project location ({formData.distanceFromOffice || 0} miles from our facility)</p>
              </div>
              <div className="text-right font-medium">
                {formatCurrency(getAdjustedPrice('travelCost', estimateData.travelCost || 0))}
              </div>
            </div>

            {/* Overnight Accommodations */}
            {formData.stayingOvernight && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold">Overnight Accommodations</p>
                  <p className="text-sm text-gray-600">{formData.numberOfNights} night(s) for {formData.numberOfCleaners} staff members</p>
                  <p className="text-sm text-gray-600">Includes hotel accommodations ({Math.ceil(formData.numberOfCleaners / 2)} rooms), meals & incidentals, and coordination</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(getAdjustedPrice('overnightCost', estimateData.overnightCost || 0))}
                </div>
              </div>
            )}

            {/* Pressure Washing */}
            {formData.needsPressureWashing && formData.pressureWashingArea > 0 && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold">Pressure Washing Services</p>
                  <p className="text-sm text-gray-600">{formData.pressureWashingArea?.toLocaleString()} sq ft of pressure washing</p>
                  <p className="text-sm text-gray-600">Includes equipment rental and cleaning solutions</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(getAdjustedPrice('pressureWashingCost', estimateData.pressureWashingCost || 0))}
                </div>
              </div>
            )}

            {/* Window Cleaning */}
            {formData.needsWindowCleaning && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold">Window Cleaning Services</p>
                  <p className="text-sm text-gray-600">Standard and high-access window cleaning, including equipment and solutions</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(getAdjustedPrice('windowCleaningCost', estimateData.windowCleaningCost || 0))}
                </div>
              </div>
            )}

            {/* Display Case Cleaning */}
            {formData.projectType === 'jewelry_store' && formData.numberOfDisplayCases > 0 && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold">Display Case Cleaning</p>
                  <p className="text-sm text-gray-600">{formData.numberOfDisplayCases} display cases with specialized cleaning</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(getAdjustedPrice('displayCaseCost', estimateData.displayCaseCost || 0))}
                </div>
              </div>
            )}

            {/* Urgency Adjustment */}
            {estimateData.urgencyMultiplier > 1 && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold">Urgency Adjustment</p>
                  <p className="text-sm text-gray-600">{((estimateData.urgencyMultiplier - 1) * 100).toFixed(0)}% adjustment for expedited timeline</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(getAdjustedPrice('urgencyCost', 
                    (((estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)) +
                      (estimateData.vctCost || 0) + (estimateData.travelCost || 0) + (estimateData.overnightCost || 0) + 
                      (estimateData.pressureWashingCost || 0)) * ((estimateData.urgencyMultiplier || 1) - 1)))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="mb-8 bg-gray-50 p-4 rounded">
            <div className="flex justify-between py-1">
              <span className="font-semibold">Subtotal:</span>
              <span>{formatCurrency(Object.keys(adjustedPrices).length > 0 ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0) : estimateData.totalBeforeMarkup)}</span>
            </div>

            {(estimateData.markup > 0 && Object.keys(adjustedPrices).length === 0) && (
              <div className="flex justify-between py-1">
                <span className="font-semibold">Business Overhead (30%):</span>
                <span>{formatCurrency(estimateData.markup)}</span>
              </div>
            )}

            <div className="flex justify-between py-1">
              <span className="font-semibold">Sales Tax (7%):</span>
              <span>{formatCurrency((Object.keys(adjustedPrices).length > 0 ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0) : estimateData.totalBeforeMarkup) * 0.07)}</span>
            </div>

            <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg bg-blue-50">
              <span>Total:</span>
              <span>{formatCurrency(calculateAdjustedTotal())}</span>
            </div>
          </div>

          {/* Detailed Scope of Work */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Detailed Scope of Work</h3>
            <div className="text-sm whitespace-pre-line">
              {SCOPE_OF_WORK[formData.projectType]?.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`) || 'No specific scope of work defined for this project type.'}
              
              {formData.cleaningType === 'rough_final_touchup' && (
                '\n\nThree-Stage Cleaning Schedule:\n• Rough Clean: During construction\n• Final Clean: After construction completion\n• Touch-up Clean: Before client move-in/opening'
              )}
              
              {formData.hasVCT && '\n\nVCT Flooring Treatment: Stripping, waxing, and buffing of vinyl composition tile.'}
              
              {formData.needsPressureWashing && formData.pressureWashingArea > 0 && '\n\nPressure Washing Services: Professional-grade cleaning solutions and equipment for exterior/concrete surfaces.'}
              
              {formData.stayingOvernight && '\n\nOvernight Accommodations: Hotel accommodations and per diem expenses for staff.'}
              
              {formData.needsWindowCleaning && (formData.numberOfWindows || formData.numberOfLargeWindows || formData.numberOfHighAccessWindows) > 0 && '\n\nWindow Cleaning Services: Standard and high-access window cleaning, including equipment and solutions.'}
              
              {formData.projectType === 'jewelry_store' && formData.numberOfDisplayCases > 0 && '\n\nDisplay Case Cleaning: Cleaning and maintenance of display cases.'}
              
              {formData.urgencyLevel > 5 && '\n\nUrgency Adjustment: Priority scheduling (Level ' + formData.urgencyLevel + '/10) for expedited timeline.'}
            </div>
          </div>

          {/* Updated Terms and Conditions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Professional Terms & Conditions</h3>
            <div className="text-sm whitespace-pre-line">
              {quoteInfo.terms}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Contact Information</h3>
            <div className="text-sm">
              <p>For questions regarding this quote, please contact:</p>
              <p><strong>{companyInfo.name}</strong></p>
              <p>Phone: {companyInfo.phone}</p>
              <p>Email: {companyInfo.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate;
