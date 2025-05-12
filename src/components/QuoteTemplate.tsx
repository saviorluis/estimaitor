'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EstimateData, FormData } from '@/lib/types';
import { formatDate, formatCurrency, generateQuoteNumber, getQuoteCounter, incrementQuoteCounter } from '@/lib/utils';
import { pdf } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';
import { SCOPE_OF_WORK } from '@/lib/constants';
import { PDFViewer } from '@react-pdf/renderer';

// Define the calculateTotalPressureWashingArea function
const calculateTotalPressureWashingArea = (formData: FormData): number => {
  if (!formData.pressureWashingServices || !formData.pressureWashingServiceAreas) return 0;
  
  let totalArea = 0;
  formData.pressureWashingServices.forEach(service => {
    totalArea += formData.pressureWashingServiceAreas?.[service] || 0;
  });
  
  return totalArea;
};

// Inline logo component to avoid import issues
const CompanyLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        className="w-full h-full"
      >
        <rect x="0" y="0" width="200" height="80" fill="#2563eb" rx="8" ry="8" />
        <text
          x="100"
          y="40"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          fill="white"
          dominantBaseline="middle"
        >
          BBPS
        </text>
        <text
          x="100"
          y="60"
          fontFamily="Arial, sans-serif"
          fontSize="10"
          textAnchor="middle"
          fill="white"
          dominantBaseline="middle"
        >
          Big Brother Property Solutions
        </text>
      </svg>
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
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isTMMode, setIsTMMode] = useState(false);
  
  // Move defaultQuoteInfo above useEffect
  const defaultCompanyInfo = {
    name: "Big Brother Property Solutions",
    address: "1200 Eastchester Dr.",
    city: "High Point, NC 27265",
    phone: "(336) 624-7442",
    email: "bids@bigbroprops.com",
    website: "www.bigbrotherpropertysolutions.com"
  };
  const defaultClientInfo = {
    name: '',
    company: '',
    address: '',
    email: '',
    phone: '',
  };
  const defaultTerms = `1. Payment Terms: Net 15 - Payment due within 15 days of completion.\n2. Cancellation Policy: 48-hour notice required for cancellation or rescheduling.\n3. Scope: This quote covers only the services explicitly described.\n4. Additional Services: Any services not specified will be quoted separately.\n5. Access: Client must provide necessary access to the property.\n6. Utilities: Working electricity and water must be available on-site.\n7. Quote Validity: This quote is valid for 30 days from the date issued.`;
  const defaultNotes = 'This quote includes all labor, materials, equipment, and supplies needed to complete the specified cleaning services.';
  function defaultQuoteInfo(formData?: FormData) {
    return {
      quoteNumber: generateQuoteNumber(),
      date: formatDate(new Date()),
      validUntil: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      projectName: formData?.projectName || '',
      projectAddress: (formData && 'projectAddress' in formData && (formData as any).projectAddress) ? (formData as any).projectAddress : '',
      notes: defaultNotes,
      terms: defaultTerms,
    };
  }

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
      return savedCompanyInfo ? JSON.parse(savedCompanyInfo) : defaultCompanyInfo;
    }
    return defaultCompanyInfo;
  });

  // State to track if company info is being edited
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(false);

  // Client information state - initialize from localStorage if available
  const [clientInfo, setClientInfo] = useState(() => {
    // Only run this code on the client side
    if (typeof window !== 'undefined') {
      const savedClientInfo = localStorage.getItem('quoteClientInfo');
      return savedClientInfo ? JSON.parse(savedClientInfo) : defaultClientInfo;
    }
    return defaultClientInfo;
  });

  // Quote information state
  const [quoteInfo, setQuoteInfo] = useState(defaultQuoteInfo(formData));

  // Add useEffect to reset info on new calculation
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCompanyInfo(defaultCompanyInfo);
    setClientInfo(defaultClientInfo);
    setQuoteInfo(defaultQuoteInfo(formData));
    setMarkupPercentage(0);
    setAdjustedPrices({});
    setQuoteCounter(getQuoteCounter());
  }, [formData]);

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

    try {
      console.log('FormData:', formData);
      console.log('Project Type:', formData.projectType, 'Project Type Multiplier:', estimateData.projectTypeMultiplier);
      console.log('Cleaning Type:', formData.cleaningType, 'Cleaning Type Multiplier:', estimateData.cleaningTypeMultiplier);

      // IMPORTANT: The basePrice coming from estimateData already includes:
      // 1. The square footage calculation
      // 2. The project type multiplier
      // 3. The cleaning type multiplier
      // So we DON'T need to multiply it again by these factors here

      // Check if the price per square foot seems reasonable
      const calculatedPricePerSqFt = estimateData.basePrice / formData.squareFootage;
      console.log('Price per square foot calculation check:', {
        basePrice: estimateData.basePrice,
        squareFootage: formData.squareFootage,
        calculatedPricePerSqFt,
        expectedPricePerSqFt: 0.18 * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier
      });
      
      // Get all the line items
      const lineItems = [
        {
          key: 'basePrice',
          value: estimateData.basePrice // Use the base price directly, don't multiply again
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
      
      // Log the base values for debugging
      console.log('Base price calculation:', {
        basePrice: estimateData.basePrice,
        projectTypeMultiplier: estimateData.projectTypeMultiplier,
        cleaningTypeMultiplier: estimateData.cleaningTypeMultiplier,
        calculatedBasePrice: (estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1),
        totalBeforeMarkup,
        lineItems
      });
      
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
      
      // Log the final adjusted prices for debugging
      console.log('Final adjusted prices:', {
        rawAdjustedPrices: adjustedPrices,
        balancedPrices,
        finalPrices: Object.keys(balancedPrices).length > 0 ? balancedPrices : adjustedPrices,
        total: Object.values(Object.keys(balancedPrices).length > 0 ? balancedPrices : adjustedPrices).reduce((sum, price) => sum + price, 0)
      });
    } catch (error) {
      console.error('Error calculating adjusted prices:', error);
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
    if (basePrice && windowCleaning && windowCleaning.value > 0 && formData.needsWindowCleaning && formData.chargeForWindowCleaning) {
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
    
    // Base price - IMPORTANT: This already includes project type and cleaning type multipliers
    subtotal += getAdjustedPrice('basePrice', estimateData.basePrice || 0);
    
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
      case 'rough': return 'Rough Clean';
      case 'final': return 'Final Clean';
      case 'rough_final': return 'Rough & Final Clean';
      case 'rough_final_touchup': return 'Rough, Final & Touch-up Clean';
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
      case 'mailroom': return 'Mailroom/Shipping Center';
      case 'church': return 'Church/Religious Facility';
      case 'car_wash': return 'Car Wash Facility';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  // Handle print function - add a slight delay to ensure styles are applied
  const handlePrint = () => {
    setShowPDFModal(true);
  };

  // Direct PDF download using react-pdf
  const handlePDFDownload = async () => {
    console.log('PDF download button clicked');
    console.log('Current device type:', window.innerWidth <= 768 ? 'Mobile' : 'Desktop');
    console.log('Raw estimate data:', estimateData);
    console.log('Current form data:', formData);
    console.log('Markup percentage:', markupPercentage);
    console.log('Current adjusted prices:', adjustedPrices);
    
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
      
      console.log('PDF subtotal calculation:', {
        usingAdjustedPrices: Object.keys(adjustedPrices).length > 0,
        adjustedPricesTotal: Object.keys(adjustedPrices).length > 0 ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0) : 0,
        fallbackTotal: estimateData.totalBeforeMarkup,
        calculatedSubtotal: subtotal
      });
      
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
        // Use the adjusted prices that already have markup distributed
        adjustedEstimateData.adjustedLineItems = adjustedPrices;
        console.log('Using existing adjusted prices for PDF');
      } else {
        console.log('Creating new adjusted line items for PDF');
        // We need to ensure the base price includes the cleaning type multiplier
        const basePrice = estimateData.basePrice || 0; // Use this directly as it already includes the multipliers
        const vctCost = formData.hasVCT ? (estimateData.vctCost || 0) : 0;
        const pressureWashingCost = formData.needsPressureWashing ? (estimateData.pressureWashingCost || 0) : 0;
        const travelCost = estimateData.travelCost || 0;
        const overnightCost = formData.stayingOvernight ? (estimateData.overnightCost || 0) : 0;
        
        // For urgency calculation, use the original components but don't multiply basePrice again
        const urgencyCost = estimateData.urgencyMultiplier > 1 ? 
          ((estimateData.basePrice || 0) +
           (estimateData.vctCost || 0) + (estimateData.travelCost || 0) + (estimateData.overnightCost || 0) + (estimateData.pressureWashingCost || 0)) *
          ((estimateData.urgencyMultiplier || 1) - 1) : 0;
        
        const windowCleaningCost = (formData.needsWindowCleaning && formData.chargeForWindowCleaning) ? (estimateData.windowCleaningCost || 0) : 0;
        const displayCaseCost = (formData.projectType === 'jewelry_store' && estimateData.displayCaseCost > 0) ? (estimateData.displayCaseCost || 0) : 0;
        
        console.log('New line item calculations:', {
          basePrice,
          vctCost,
          pressureWashingCost,
          travelCost,
          overnightCost,
          urgencyCost,
          windowCleaningCost,
          displayCaseCost,
          total: basePrice + vctCost + pressureWashingCost + travelCost + overnightCost + urgencyCost + windowCleaningCost + displayCaseCost
        });
        
        adjustedEstimateData.adjustedLineItems = {
          basePrice,
          vctCost,
          pressureWashingCost,
          travelCost,
          overnightCost,
          urgencyCost,
          windowCleaningCost,
          displayCaseCost
        };
        
        // Double-check that the total of these line items matches our calculated subtotal
        const lineItemTotal = Object.values(adjustedEstimateData.adjustedLineItems).reduce((sum, price) => sum + price, 0);
        if (Math.abs(lineItemTotal - subtotal) > 0.01) {
          console.error('WARNING: Line item total does not match subtotal!', {
            lineItemTotal,
            subtotal,
            difference: lineItemTotal - subtotal
          });
          // Make sure the PDF uses the correct subtotal regardless
          adjustedEstimateData.totalBeforeMarkup = lineItemTotal;
          adjustedEstimateData.salesTax = lineItemTotal * 0.07;
          adjustedEstimateData.totalPrice = lineItemTotal + (lineItemTotal * 0.07);
          
          // Check price per square foot to help diagnose issues
          console.log('PRICE PER SQUARE FOOT CHECK:', {
            original: estimateData.pricePerSquareFoot,
            recalculated: lineItemTotal / formData.squareFootage,
            difference: (lineItemTotal / formData.squareFootage) - estimateData.pricePerSquareFoot,
            percentDifference: (((lineItemTotal / formData.squareFootage) - estimateData.pricePerSquareFoot) / estimateData.pricePerSquareFoot) * 100
          });
        }
      }
      
      console.log('PDF pricing data:', {
        subtotal,
        salesTax,
        total: subtotal + salesTax,
        adjustedLineItems: adjustedEstimateData.adjustedLineItems
      });

      // Log out comparison between display view and PDF data
      console.log('Comparing Display vs PDF Values:', {
        displayView: {
          subtotal: subtotal,
          total: subtotal + salesTax,
          adjustedPrices
        },
        pdfData: {
          subtotal: subtotal,
          total: subtotal + salesTax,
          adjustedLineItems: adjustedEstimateData.adjustedLineItems
        }
      });

      const blob = await pdf(
        <QuotePDF 
          estimateData={adjustedEstimateData} 
          formData={formData} 
          companyInfo={companyInfo}
          clientInfo={clientInfo}
          quoteInfo={quoteInfo}
          showCoverPage={true}
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

  useEffect(() => {
    // Add a class to the body when component mounts for print-specific CSS
    document.body.classList.add('quote-print-ready');
    
    // Remove it when component unmounts
    return () => {
      document.body.classList.remove('quote-print-ready');
    };
  }, []);

  // Add a useEffect to log the final price calculation whenever adjustedPrices changes
  useEffect(() => {
    if (Object.keys(adjustedPrices).length === 0) return;
    
    // Calculate the total that will be displayed in the table
    const basePrice = adjustedPrices.basePrice !== undefined 
      ? adjustedPrices.basePrice 
      : (estimateData.basePrice || 0) * (estimateData.projectTypeMultiplier || 1) * (estimateData.cleaningTypeMultiplier || 1);
    
    // Calculate the total from all adjusted prices
    const tableTotal = Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0);
    const tableTotalWithTax = tableTotal * 1.07;
    
    console.log('FINAL TABLE CALCULATION:', {
      basePrice,
      adjustedPrices,
      tableSubtotal: tableTotal,
      tableTax: tableTotal * 0.07,
      tableTotal: tableTotalWithTax,
      estimateDataTotal: estimateData.totalPrice,
      difference: tableTotalWithTax - estimateData.totalPrice
    });
  }, [adjustedPrices, estimateData]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8 print:shadow-none print:p-0 print:my-0 print:max-w-none">
      {/* Print and Download Buttons - Hidden when printing */}
      <div className="flex justify-end mb-6 print:hidden">
        <div className="mr-auto flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isTMMode}
              onChange={e => setIsTMMode(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-sm text-gray-700">Show as T&amp;M Quote</span>
          </label>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
        >
          Print Preview
        </button>
        <button
          onClick={handlePDFDownload}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition"
        >
          Save as PDF
        </button>
      </div>
      {/* PDF Print Preview Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-full h-full max-w-4xl max-h-[95vh] bg-white rounded shadow-lg flex flex-col">
            <button
              onClick={() => setShowPDFModal(false)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm z-10"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm z-10 print:hidden"
            >
              Print
            </button>
            <div className="flex-1 overflow-auto mt-10 mb-4">
              <PDFViewer width="100%" height="700px" showToolbar={false} style={{ width: '100%', height: '80vh', border: 'none' }}>
                <QuotePDF
                  estimateData={{ ...estimateData, adjustedLineItems: adjustedPrices }}
                  formData={formData}
                  companyInfo={companyInfo}
                  clientInfo={clientInfo}
                  quoteInfo={quoteInfo}
                  showCoverPage={true}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}

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
            <button 
              onClick={handleIncrementCounter}
              className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm"
            >
              Increment
            </button>
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

      {/* Service Table - Conditionally render T&M placeholder */}
      {isTMMode ? (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Time &amp; Materials (T&amp;M) Quote</h2>
          <p className="mb-4 text-gray-700">This quote is based on estimated labor hours and materials. Final invoice will reflect actual hours and materials used.</p>
          <div className="mb-2 text-md text-gray-800">
            <span className="font-semibold">Hourly Rate:</span> $18.00/hr<br />
            <span className="font-semibold">Estimated Total Labor Hours:</span> {(() => {
              const cleaners = formData.numberOfCleaners || 1;
              return Math.ceil((formData.squareFootage || 0) / (cleaners * 500));
            })()} hours
          </div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Labor Breakdown</h3>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left"># Cleaners</th>
                <th className="border p-2 text-left">Est. Hours</th>
                <th className="border p-2 text-left">Rate/hr</th>
                <th className="border p-2 text-right">Total Labor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{formData.numberOfCleaners || 1}</td>
                <td className="border p-2">{(() => {
                  const cleaners = formData.numberOfCleaners || 1;
                  const hours = Math.ceil((formData.squareFootage || 0) / (cleaners * 500));
                  return hours;
                })()}</td>
                <td className="border p-2">$18.00</td>
                <td className="border p-2 text-right font-semibold">{(() => {
                  const cleaners = formData.numberOfCleaners || 1;
                  const hours = Math.ceil((formData.squareFootage || 0) / (cleaners * 500));
                  const rate = 18;
                  return `$${(cleaners * hours * rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                })()}</td>
              </tr>
            </tbody>
          </table>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Materials &amp; Equipment</h3>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Qty</th>
                <th className="border p-2 text-left">Unit Cost</th>
                <th className="border p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Cleaning Supplies</td>
                <td className="border p-2">1</td>
                <td className="border p-2">$75.00</td>
                <td className="border p-2 text-right">$75.00</td>
              </tr>
              <tr>
                <td className="border p-2">Floor Machine Rental</td>
                <td className="border p-2">1</td>
                <td className="border p-2">$120.00</td>
                <td className="border p-2 text-right">$120.00</td>
              </tr>
            </tbody>
          </table>
          {(() => {
            const cleaners = formData.numberOfCleaners || 1;
            const hours = Math.ceil((formData.squareFootage || 0) / (cleaners * 500));
            const labor = cleaners * hours * 18;
            const materials = 75 + 120;
            const subtotal = labor + materials;
            const markup = 0;
            const total = subtotal + markup;
            return (
              <div className="mb-2">
                <div className="flex justify-between text-md mb-1">
                  <span className="font-semibold">Subtotal:</span>
                  <span>${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-md mb-1">
                  <span className="font-semibold">Markup:</span>
                  <span>${markup.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Estimated Total:</span>
                  <span>${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            );
          })()}
          <div className="mt-4 text-sm italic text-gray-600">
            This is a T&amp;M quote. Final invoice will reflect actual hours and materials used.
          </div>
        </div>
      ) : (
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
                  <div className="text-xs mt-1">
                    {(SCOPE_OF_WORK[formData.projectType] || '').replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`) || `Final Cleaning of ${(formData.squareFootage || 0).toLocaleString()} Sq Ft includes standard cleaning services`}
                  </div>
                  {formData.distanceFromOffice <= 100 && formData.distanceFromOffice > 0 && (
                    <div className="text-xs italic text-gray-500 mt-1">Note: Price includes travel ({formData.distanceFromOffice} miles)</div>
                  )}
                  {formData.projectType === 'church' && (
                    <div className="text-xs mt-2">
                      <div className="font-bold">Areas Included:</div>
                      <ul className="list-disc ml-4">
                        <li>Green Room</li>
                        <li>Religious Ed (6 split by age group: 4th, 5th, 3rd grade, 2nd grade, 2 nurseries, K-1)</li>
                        <li>Auditorium</li>
                        <li>Platform</li>
                        <li>Storage (5)</li>
                        <li>Kitchen</li>
                        <li>AV Control Room</li>
                        <li>Cafe</li>
                        <li>Restrooms (4)</li>
                        <li>2 Assembly Areas</li>
                        <li>Broadcast</li>
                        <li>4 Offices</li>
                      </ul>
                    </div>
                  )}
                </td>
                <td className="border p-2 text-right print:border print:border-gray-300 font-semibold">
                  {formatCurrency(getAdjustedPrice('basePrice', estimateData.basePrice || 0))}
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
              {(formData.needsPressureWashing || formData.cleaningType === 'pressure_washing_only') && (
                <tr>
                  <td className="border p-2 print:border print:border-gray-300">
                    <div className="font-semibold">Pressure Washing Services</div>
                    <div className="text-sm">
                      {formData.pressureWashingServices && formData.pressureWashingServices.length > 0 
                        ? `${calculateTotalPressureWashingArea(formData).toLocaleString()} sq ft total (multiple service types)`
                        : `${(formData.pressureWashingArea || 0).toLocaleString()} sq ft of exterior/concrete surfaces`
                      }
                    </div>
                    <div className="text-sm">Includes equipment rental, materials, and professional-grade cleaners</div>
                    {formData.pressureWashingServices && formData.pressureWashingServices.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="italic">Service Types: </span>
                        {formData.pressureWashingServices.map((service, i) => (
                          <span key={service}>
                            {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {i < formData.pressureWashingServices!.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="italic">Payment Terms: </span>
                      {formData.projectType === 'warehouse' ? 'Net 30' : 
                        ['restaurant', 'medical', 'office', 'retail', 'educational', 'hotel', 'jewelry_store'].includes(formData.projectType) ? 'Net 10' : 
                        'Payment on Invoice'}
                    </div>
                  </td>
                  <td className="border p-2 text-right print:border print:border-gray-300">{formatCurrency(getAdjustedPrice('pressureWashingCost', estimateData.pressureWashingCost || 0))}</td>
                </tr>
              )}
              {/* Travel Expenses - only show for jobs over 100 miles */}
              {formData.distanceFromOffice > 100 && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Travel Expenses</div>
                    <div className="text-sm">{(formData.distanceFromOffice || 0)} miles</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(getAdjustedPrice('travelCost', estimateData.travelCost || 0))}</td>
                </tr>
              )}
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
              {(formData.needsWindowCleaning || formData.cleaningType === 'window_cleaning_only') && (
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
                    <div className="text-sm">{(formData.numberOfDisplayCases || 0)} display case{formData.numberOfDisplayCases !== 1 ? 's' : ''}</div>
                    <div className="text-xs mt-1">Professional interior and exterior cleaning with specialized glass cleaners</div>
                  </td>
                  <td className="border p-2 text-right">Included</td>
                </tr>
              )}
              {/* Calculate adjusted subtotal */}
              {(() => {
                const subtotal = Object.keys(adjustedPrices).length > 0 
                  ? Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0)
                  : estimateData.totalBeforeMarkup;
                const salesTax = subtotal * 0.07;
                const total = subtotal + salesTax;
                
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
                      <td className="border p-2 text-right">{formatCurrency(salesTax)}</td>
                    </tr>
                    {/* Total */}
                    <tr className="bg-blue-600 text-white">
                      <td className="border p-2 font-bold">TOTAL</td>
                      <td className="border p-2 text-right font-bold">{formatCurrency(total)}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuoteTemplate;
