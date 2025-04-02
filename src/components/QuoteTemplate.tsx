'use client';

import React, { useState, useEffect } from 'react';
import { EstimateData, FormData } from '@/lib/types';
import { formatDate, formatCurrency, generateQuoteNumber } from '@/lib/utils';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import QuotePDF from './QuotePDF';
import { generateQuoteDocx } from '@/lib/docxGenerator';
import { SCOPE_OF_WORK } from '@/lib/constants';

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
5. Equipment: All necessary cleaning equipment and supplies are included.
6. Access: Client must provide necessary access to the property.
7. Utilities: Working electricity and water must be available on-site.
8. Quote Validity: This quote is valid for 30 days from the date issued.`;

  // Quote information state
  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: generateQuoteNumber(),
    date: formatDate(new Date()),
    validUntil: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    projectName: '',
    projectAddress: '',
    notes: 'This quote includes all labor, materials, equipment, and supplies needed to complete the specified cleaning services.',
    terms: defaultTerms,
  });

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

    if (formData.needsWindowCleaning && formData.chargeForWindowCleaning) {
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

    setAdjustedPrices(adjustedPrices);
  }, [estimateData, formData, markupPercentage]);

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
    if (formData.needsWindowCleaning && formData.chargeForWindowCleaning) {
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
      case 'rough': return 'Rough Clean (First Stage)';
      case 'final': return 'Final Clean (Second Stage)';
      case 'powder_puff': return 'Touch-up Clean (Third Stage)';
      case 'complete': return 'Commercial Cleaning';
      default: return type;
    }
  };

  // Get project type display name
  const getProjectTypeDisplay = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
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
      }
      
      const blob = await pdf(
        <QuotePDF 
          estimateData={adjustedEstimateData} 
          formData={formData} 
          companyInfo={companyInfo}
          clientInfo={clientInfo}
          quoteInfo={quoteInfo}
        />
      ).toBlob();
      
      console.log('PDF blob created successfully');
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      console.log('Created URL for blob:', url);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote-${quoteInfo.quoteNumber}.pdf`;
      
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

  // Handle Word document download
  const handleWordDownload = async () => {
    try {
      // Create adjusted estimate data with the EXACT same calculation as the browser preview
      const adjustedEstimateData = {...estimateData};
      
      // Calculate subtotal EXACTLY as shown in the browser preview
      // This is a direct copy of the calculation used in the print view
      const subtotal = Object.keys(adjustedPrices).length > 0 
        ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0)
        : estimateData.totalBeforeMarkup;
      
      // Calculate sales tax
      const salesTax = subtotal * 0.07;
      
      // Set all the values for the Word document
      adjustedEstimateData.totalBeforeMarkup = subtotal;
      adjustedEstimateData.markup = Object.keys(adjustedPrices).length > 0 ? subtotal - estimateData.totalBeforeMarkup : estimateData.markup;
      adjustedEstimateData.salesTax = salesTax;
      adjustedEstimateData.totalPrice = subtotal + salesTax;
      
      // Add adjusted line items to the estimate data
      if (Object.keys(adjustedPrices).length > 0) {
        adjustedEstimateData.adjustedLineItems = adjustedPrices;
      }
      
      const blob = await generateQuoteDocx(
        adjustedEstimateData,
        formData,
        companyInfo,
        clientInfo,
        quoteInfo
      );
      saveAs(blob, `Quote-${quoteInfo.quoteNumber}.docx`);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('There was an error generating the Word document. Please try again.');
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
      {/* Print and Download Buttons - Hidden when printing */}
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
        >
          Print Quote
        </button>

        <button
          onClick={handlePDFDownload}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition"
        >
          Save as PDF
        </button>

        <button
          onClick={handleWordDownload}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
        >
          Download Word (.docx)
        </button>
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

        {editingCompanyInfo ? (
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
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
        
        {/* Markup Percentage Input */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Adjustment (Markup Percentage)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={markupPercentage}
              onChange={handleMarkupChange}
              className="block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">%</span>
            <div className="ml-4 text-sm text-gray-600">
              {markupPercentage > 0 ? (
                <span>Adding {markupPercentage}% markup evenly distributed across all line items</span>
              ) : (
                <span>No markup applied</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This will adjust all prices proportionally to maintain the same relative pricing structure.
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

        {/* Add a page break for printing at the beginning to ensure the quote starts on a fresh page */}
        <div className="hidden print:block print:mb-8"></div>

        {/* Client and Project Information - Ensure no empty placeholders in printed version */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Client Information</h3>
            <p>{clientInfo.name || '[Client Name]'}</p>
            <p>{clientInfo.company || '[Company]'}</p>
            <p>{clientInfo.address || '[Address]'}</p>
            <p>{clientInfo.email || '[Email]'}</p>
            <p>{clientInfo.phone || '[Phone]'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Project Information</h3>
            <p>{quoteInfo.projectName || '[Project Name]'}</p>
            <p>{quoteInfo.projectAddress || '[Project Address]'}</p>
            
            <p>Project Type: {getProjectTypeDisplay(formData.projectType)}</p>
            <p>Square Footage: {(formData.squareFootage || 0).toLocaleString()} sq ft</p>
            <p>Cleaning Type: {getCleaningTypeDisplay(formData.cleaningType)}</p>
          </div>
        </div>

        {/* Service Details - Enhance table for printing */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Service Details</h3>

          {/* Scope of Work */}
          <div className="mb-4 p-4 bg-gray-50 print:bg-white rounded">
            <h4 className="font-semibold mb-2">Scope of Work</h4>
            <p className="whitespace-pre-line text-sm">
              {SCOPE_OF_WORK[formData.projectType] || ''} ({(formData.squareFootage || 0).toLocaleString()} sq ft)
            </p>
          </div>

          <table className="w-full border-collapse print:border print:border-gray-300">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border p-2 text-left print:font-bold">Description</th>
                <th className="border p-2 text-right print:font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Base Cleaning Service */}
              <tr>
                <td className="border p-2 print:border print:border-gray-300">
                  <div className="font-semibold">{getCleaningTypeDisplay(formData.cleaningType)} - {(formData.squareFootage || 0).toLocaleString()} sq ft</div>
                </td>
                <td className="border p-2 text-right print:border print:border-gray-300">
                  {formatCurrency(getAdjustedPrice('basePrice', (estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)))}
                </td>
              </tr>

              {/* VCT Flooring if applicable */}
              {formData.hasVCT && (
                <tr>
                  <td className="border p-2 print:border print:border-gray-300">
                    <div className="font-semibold">VCT Flooring Treatment</div>
                    <div className="text-sm">Stripping, waxing, and buffing of vinyl composition tile</div>
                  </td>
                  <td className="border p-2 text-right print:border print:border-gray-300">{formatCurrency(getAdjustedPrice('vctCost', estimateData.vctCost || 0))}</td>
                </tr>
              )}

              {/* Pressure Washing if applicable */}
              {formData.needsPressureWashing && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Pressure Washing Services</div>
                    <div className="text-sm">{(formData.pressureWashingArea || 0).toLocaleString()} sq ft of exterior/concrete surfaces</div>
                    <div className="text-sm">Includes equipment rental and materials</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(getAdjustedPrice('pressureWashingCost', estimateData.pressureWashingCost || 0))}</td>
                </tr>
              )}

              {/* Travel Expenses */}
              <tr>
                <td className="border p-2">
                  <div className="font-semibold">Travel Expenses</div>
                  <div className="text-sm">{(formData.distanceFromOffice || 0)} miles at current gas price (${((formData.gasPrice || 0)).toFixed(2)}/gallon)</div>
                </td>
                <td className="border p-2 text-right">{formatCurrency(getAdjustedPrice('travelCost', estimateData.travelCost || 0))}</td>
              </tr>

              {/* Overnight Accommodations if applicable */}
              {formData.stayingOvernight && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Overnight Accommodations</div>
                    <div className="text-sm">{formData.numberOfNights} night(s) for {formData.numberOfCleaners} staff members</div>
                    <div className="text-sm">Includes hotel and per diem expenses</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(getAdjustedPrice('overnightCost', estimateData.overnightCost || 0))}</td>
                </tr>
              )}

              {/* Urgency Adjustment if applicable */}
              {estimateData.urgencyMultiplier > 1 && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Urgency Adjustment</div>
                    <div className="text-sm">Priority scheduling (Level {formData.urgencyLevel}/10)</div>
                  </td>
                  <td className="border p-2 text-right">
                    {formatCurrency(
                      getAdjustedPrice('urgencyCost',
                        (((estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1)) +
                          (estimateData.vctCost || 0) + (estimateData.travelCost || 0) + (estimateData.overnightCost || 0) + (estimateData.pressureWashingCost || 0)) *
                        ((estimateData.urgencyMultiplier || 1) - 1)
                      )
                    )}
                  </td>
                </tr>
              )}

              {/* Window Cleaning if applicable */}
              {formData.needsWindowCleaning && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Window Cleaning Services</div>
                    <div className="text-sm">{(formData.numberOfWindows || 0)} standard windows, {(formData.numberOfLargeWindows || 0)} large windows, {(formData.numberOfHighAccessWindows || 0)} high-access windows</div>
                    <div className="text-sm">Includes all necessary equipment and cleaning solutions</div>
                    {!formData.chargeForWindowCleaning && (
                      <div className="text-sm italic text-gray-500">Window cleaning will be quoted separately</div>
                    )}
                  </td>
                  <td className="border p-2 text-right">
                    {formData.chargeForWindowCleaning ? formatCurrency(getAdjustedPrice('windowCleaningCost', estimateData.windowCleaningCost || 0)) : 'Separate Quote'}
                  </td>
                </tr>
              )}

              {/* Display case cleaning for jewelry stores */}
              {formData.projectType === 'jewelry_store' && estimateData.displayCaseCost > 0 && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Display Case Cleaning</div>
                    <div className="text-sm">{(formData.numberOfDisplayCases || 0)} display cases</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(getAdjustedPrice('displayCaseCost', estimateData.displayCaseCost || 0))}</td>
                </tr>
              )}

              {/* Calculate adjusted subtotal */}
              {(() => {
                const subtotal = Object.keys(adjustedPrices).length > 0 
                  ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0)
                  : estimateData.totalBeforeMarkup;
                return (
                  <>
                    {/* Subtotal */}
                    <tr>
                      <td className="border p-2 font-semibold">Subtotal</td>
                      <td className="border p-2 text-right font-semibold">{formatCurrency(subtotal)}</td>
                    </tr>

                    {/* Sales Tax */}
                    <tr>
                      <td className="border p-2">Sales Tax (7%)</td>
                      <td className="border p-2 text-right">{formatCurrency(subtotal * 0.07)}</td>
                    </tr>

                    {/* Total */}
                    <tr className="bg-blue-600 text-white">
                      <td className="border p-2 font-bold">TOTAL</td>
                      <td className="border p-2 text-right font-bold">{formatCurrency(subtotal * 1.07)}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>

          {/* Remove the markup note and replace with a general note */}
          <div className="mt-2 text-sm italic text-gray-600">
            <p>Note: All prices include professional-grade cleaning supplies, equipment, and labor costs.</p>
          </div>
        </div>

        {/* Project Timeline and Additional Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Project Timeline</h3>
            {formData.cleaningType === 'complete' ? (
              <>
                <p className="font-semibold mt-2">Three-Stage Cleaning Schedule:</p>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  <li><span className="font-medium">Rough Clean:</span> During construction</li>
                  <li><span className="font-medium">Final Clean:</span> After construction completion</li>
                  <li><span className="font-medium">Touch-up Clean:</span> Before client move-in/opening</li>
                </ul>
                <p className="mt-2 text-sm italic">Note: These cleaning phases are performed at different stages during the construction timeline.</p>
              </>
            ) : (
              <>
                <p>Team Size: {(formData.numberOfCleaners || 1)} cleaners</p>
              </>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Additional Information</h3>
            <p className="text-sm">{quoteInfo.notes}</p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Terms & Conditions</h3>
          <p className="text-sm whitespace-pre-line">{quoteInfo.terms}</p>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Acceptance</h3>
            <div className="border-b border-black mt-8 mb-1"></div>
            <p className="text-xs">Client Signature</p>
            <div className="border-b border-black mt-8 mb-1"></div>
            <p className="text-xs">Date</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Provider</h3>
            <div className="border-b border-black mt-8 mb-1"></div>
            <p className="text-xs">Authorized Signature</p>
            <div className="border-b border-black mt-8 mb-1"></div>
            <p className="text-xs">Date</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-12">
          <p>Thank you for your business! | {companyInfo.name} | {companyInfo.phone} | {companyInfo.email}</p>
          <p className="mt-2 text-xs italic">
            All prices include our standard supplies, equipment, labor, and service fees for professional-grade cleaning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate;
