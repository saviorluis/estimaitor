'use client';

import React, { useState } from 'react';
import { EstimateData, FormData } from '@/lib/types';
import { formatDate, formatCurrency, generateQuoteNumber } from '@/lib/utils';
import { PDFDownloadLink } from '@react-pdf/renderer';
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
  // Company information state
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Big Brother Property Solutions",
    address: "1200 Eastchester Dr.",
    city: "High Point, NC 27265",
    phone: "(336) 624-7442",
    email: "bids@bigbroprops.com",
    website: "www.bigbrotherpropertysolutions.com"
  });

  // Client information state
  const [clientInfo, setClientInfo] = useState({
    name: '',
    company: '',
    address: '',
    email: '',
    phone: '',
  });

  // Quote information state
  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: generateQuoteNumber(),
    date: formatDate(new Date()),
    validUntil: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    projectName: '',
    projectAddress: '',
    notes: 'This quote includes all labor, materials, equipment, and supplies needed to complete the specified cleaning services.',
    terms: `1. Payment Terms: 50% deposit required to secure booking, balance due upon completion.
2. Cancellation Policy: 48-hour notice required for cancellation or rescheduling.
3. Scope: This quote covers only the services explicitly described.
4. Additional Services: Any services not specified will be quoted separately.
5. Equipment: All necessary cleaning equipment and supplies are included.
6. Access: Client must provide necessary access to the property.
7. Utilities: Working electricity and water must be available on-site.
8. Quote Validity: This quote is valid for 30 days from the date issued.`,
  });

  // Handle company information changes
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle client information changes
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle quote information changes
  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuoteInfo(prev => ({ ...prev, [name]: value }));
  };

  // Get cleaning type display name
  const getCleaningTypeDisplay = (type: string): string => {
    switch (type) {
      case 'rough': return 'Rough Clean (First Stage)';
      case 'final': return 'Final Clean (Second Stage)';
      case 'powder_puff': return 'Powder Puff Clean (Third Stage)';
      case 'complete': return 'Complete Package (All Three Stages)';
      default: return type;
    }
  };

  // Get project type display name
  const getProjectTypeDisplay = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  // Handle print function
  const handlePrint = () => {
    window.print();
  };

  // Handle Word document download
  const handleWordDownload = async () => {
    try {
      const blob = await generateQuoteDocx(
        estimateData,
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

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8 print:shadow-none print:p-0">
      {/* Print and Download Buttons - Hidden when printing */}
      <div className="flex justify-end mb-6 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
        >
          Print Quote
        </button>
        <PDFDownloadLink
          document={
            <QuotePDF 
              estimateData={estimateData} 
              formData={formData} 
              companyInfo={companyInfo} 
              clientInfo={clientInfo} 
              quoteInfo={quoteInfo} 
            />
          }
          fileName={`Quote-${quoteInfo.quoteNumber}.pdf`}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition"
        >
          {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
        </PDFDownloadLink>
        <button 
          onClick={handleWordDownload}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
        >
          Download Word (.docx)
        </button>
      </div>

      {/* Editable Company Information */}
      <div className="mb-6 print:hidden">
        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Company Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="name"
              value={companyInfo.name}
              onChange={handleCompanyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={companyInfo.phone}
              onChange={handleCompanyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={companyInfo.address}
              onChange={handleCompanyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              name="email"
              value={companyInfo.email}
              onChange={handleCompanyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={companyInfo.city}
              onChange={handleCompanyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="text"
              name="website"
              value={companyInfo.website}
              onChange={handleCompanyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Editable Client Information */}
      <div className="mb-6 print:hidden">
        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Client Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              name="name"
              value={clientInfo.name}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={clientInfo.phone}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              name="company"
              value={clientInfo.company}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              name="email"
              value={clientInfo.email}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={clientInfo.address}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Editable Quote Information */}
      <div className="mb-6 print:hidden">
        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Quote Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={quoteInfo.projectName}
              onChange={handleQuoteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quote Number</label>
            <input
              type="text"
              name="quoteNumber"
              value={quoteInfo.quoteNumber}
              onChange={handleQuoteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Address</label>
            <input
              type="text"
              name="projectAddress"
              value={quoteInfo.projectAddress}
              onChange={handleQuoteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Until</label>
            <input
              type="text"
              name="validUntil"
              value={quoteInfo.validUntil}
              onChange={handleQuoteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={quoteInfo.notes}
              onChange={handleQuoteChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
            <textarea
              name="terms"
              value={quoteInfo.terms}
              onChange={handleQuoteChange}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Quote Preview */}
      <div className="border p-8 rounded-lg">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Quote</h1>
            <p className="font-semibold">{companyInfo.name}</p>
            <p className="text-sm">{companyInfo.address}</p>
            <p className="text-sm">{companyInfo.city}</p>
            <p className="text-sm">{companyInfo.phone}</p>
            <p className="text-sm">{companyInfo.email}</p>
            <p className="text-sm">{companyInfo.website}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600">QUOTE</h2>
            <p className="text-sm">Quote #: {quoteInfo.quoteNumber}</p>
            <p className="text-sm">Date: {quoteInfo.date}</p>
            <p className="text-sm">Valid Until: {quoteInfo.validUntil}</p>
          </div>
        </div>

        {/* Client and Project Information */}
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
            <p>Square Footage: {formData.squareFootage.toLocaleString()} sq ft</p>
            <p>Cleaning Type: {getCleaningTypeDisplay(formData.cleaningType)}</p>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Service Details</h3>
          
          {/* Scope of Work */}
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Scope of Work</h4>
            <p className="whitespace-pre-line text-sm">
              {SCOPE_OF_WORK[formData.projectType]} ({formData.squareFootage.toLocaleString()} sq ft)
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Base Cleaning Service */}
              <tr>
                <td className="border p-2">
                  <div className="font-semibold">{getCleaningTypeDisplay(formData.cleaningType)} - {formData.squareFootage.toLocaleString()} sq ft</div>
                  <div className="text-sm">Base Price: {formatCurrency(estimateData.basePrice)}</div>
                  <div className="text-sm">Project Type Multiplier: {(estimateData.projectTypeMultiplier).toFixed(2)}x</div>
                  <div className="text-sm">Cleaning Type Multiplier: {(estimateData.cleaningTypeMultiplier).toFixed(2)}x</div>
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier)}
                </td>
              </tr>

              {/* VCT Flooring if applicable */}
              {formData.hasVCT && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">VCT Flooring Treatment</div>
                    <div className="text-sm">Stripping, waxing, and buffing of vinyl composition tile</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(estimateData.vctCost)}</td>
                </tr>
              )}

              {/* Pressure Washing if applicable */}
              {formData.needsPressureWashing && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Pressure Washing Services</div>
                    <div className="text-sm">{formData.pressureWashingArea.toLocaleString()} sq ft of exterior/concrete surfaces</div>
                    <div className="text-sm">Includes equipment rental and materials</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(estimateData.pressureWashingCost)}</td>
                </tr>
              )}

              {/* Travel Expenses */}
              <tr>
                <td className="border p-2">
                  <div className="font-semibold">Travel Expenses</div>
                  <div className="text-sm">{formData.distanceFromOffice} miles at current gas price (${(formData.gasPrice || 0).toFixed(2)}/gallon)</div>
                </td>
                <td className="border p-2 text-right">{formatCurrency(estimateData.travelCost)}</td>
              </tr>

              {/* Overnight Accommodations if applicable */}
              {formData.stayingOvernight && (
                <tr>
                  <td className="border p-2">
                    <div className="font-semibold">Overnight Accommodations</div>
                    <div className="text-sm">{formData.numberOfNights} night(s) for {formData.numberOfCleaners} staff members</div>
                    <div className="text-sm">Includes hotel and per diem expenses</div>
                  </td>
                  <td className="border p-2 text-right">{formatCurrency(estimateData.overnightCost)}</td>
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
                      ((estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier) +
                      estimateData.vctCost + estimateData.travelCost + estimateData.overnightCost + estimateData.pressureWashingCost) * 
                      (estimateData.urgencyMultiplier - 1)
                    )}
                  </td>
                </tr>
              )}

              {/* Subtotal */}
              <tr className="bg-gray-100">
                <td className="border p-2 font-semibold">Subtotal</td>
                <td className="border p-2 text-right font-semibold">{formatCurrency(estimateData.totalBeforeMarkup)}</td>
              </tr>

              {/* Markup if applicable */}
              {formData.applyMarkup && (
                <tr>
                  <td className="border p-2 font-semibold">Service Fee (50%)</td>
                  <td className="border p-2 text-right">{formatCurrency(estimateData.markup)}</td>
                </tr>
              )}

              {/* Total */}
              <tr className="bg-blue-50">
                <td className="border p-2 font-bold">TOTAL</td>
                <td className="border p-2 text-right font-bold">{formatCurrency(estimateData.totalPrice)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Project Timeline and Additional Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Project Timeline</h3>
            <p>Estimated Hours: {estimateData.estimatedHours} hours</p>
            <p>Team Size: {formData.numberOfCleaners} cleaners</p>
            <p>Hours Per Cleaner: {(estimateData.estimatedHours / formData.numberOfCleaners).toFixed(1)} hours</p>
            <p>Estimated Completion: {Math.ceil(estimateData.estimatedHours / (8 * formData.numberOfCleaners))} day(s)</p>
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
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate; 