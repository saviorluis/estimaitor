import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import {
  formatCurrency,
  getQuoteDocumentAmounts
} from '@/lib/utils';
import { isUsableImageSrc } from '@/lib/companySettings';
import { SCOPE_OF_WORK } from '@/lib/constants';
import { formatSalesTaxPercent } from '@/lib/salesTax';
import { getPressureWashingLineTitle, isPressureWashingJob } from '@/lib/pressureWashDocs';
import type { ProposalDocument } from '@/lib/proposals';
import { ProposalFactLines, ProposalLineItemRows } from './proposal/ProposalPdfParts';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 26,
    paddingBottom: 36,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  companyInfo: {
    width: '50%',
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 56,
    height: 56,
    marginRight: 10,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: 'contain',
    objectPosition: 'left top',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  invoiceInfo: {
    width: '50%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 6,
  },
  invoiceDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  section: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1e40af',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoColumn: {
    width: '50%',
    paddingRight: 15,
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: 0,
  },
  totalsTable: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#CCCCCC',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  tableHeader: {
    backgroundColor: '#F0F0F0',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  descriptionCell: {
    width: '75%',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
  },
  quantityCell: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
    textAlign: 'center',
  },
  rateCell: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
    textAlign: 'right',
  },
  amountCell: {
    width: '25%',
    textAlign: 'right',
  },
  scopeText: {
    fontSize: 9,
    marginTop: 5,
    color: '#666666',
  },
  scopeItem: {
    fontSize: 9,
    marginLeft: 10,
    marginTop: 2,
    color: '#666666',
  },
  subtotalRow: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
  },
  totalRow: {
    backgroundColor: '#E6F0FF',
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    marginTop: 2,
  },
  paymentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '50%',
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
  },
  paymentDetails: {
    fontSize: 10,
    marginBottom: 5,
  },
  paymentPreferred: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
    backgroundColor: '#E6F0FF',
    padding: 5,
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 26,
    right: 26,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  balanceDueBox: {
    position: 'absolute',
    right: 30,
    top: 520,
    padding: 15,
    backgroundColor: '#1e40af',
    borderRadius: 4,
    width: 200,
  },
  balanceDueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  balanceDueAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});

interface InvoicePDFProps {
  estimateData: EstimateData;
  formData: FormData;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    logoSrc?: string;
  };
  quoteInfo: {
    quoteNumber: string;
    projectName: string;
    projectAddress: string;
    notes: string;
    total: number;
  };
  invoiceInfo: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    paymentTerms: string;
  };
  clientInfo?: {
    name?: string;
    company?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  preTaxSubtotal?: number;
  /** Resolved proposal for template-driven services; when present it supplies the line items. */
  proposal?: ProposalDocument | null;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({
  estimateData,
  formData,
  companyInfo,
  quoteInfo,
  invoiceInfo,
  clientInfo,
  preTaxSubtotal,
  proposal
}) => {
  const billToLines = [
    clientInfo?.name,
    clientInfo?.company,
    clientInfo?.address,
    clientInfo?.phone ? `Phone: ${clientInfo.phone}` : '',
    clientInfo?.email ? `Email: ${clientInfo.email}` : '',
  ].filter((line): line is string => Boolean(line && line.trim()));
  const logoPath = isUsableImageSrc(companyInfo.logoSrc) ? companyInfo.logoSrc : '/assets/logo.png';
  const legacyAmounts = getQuoteDocumentAmounts(formData, estimateData, preTaxSubtotal);
  const { windowQuoteShare, subtotalForPrimaryService, truckStopSplit } = legacyAmounts;
  const { subtotal, taxRate, salesTax, finalTotal } = proposal?.amounts
    ? { ...proposal.amounts, finalTotal: proposal.amounts.total }
    : legacyAmounts;

  // Get cleaning type display
  const getCleaningTypeDisplay = (type: string): string => {
    switch (type) {
      case 'rough':
        return 'Rough Clean';
      case 'final':
        return 'Final Clean';
      case 'final_touchup':
        return 'Final & Touchup Clean';
      case 'rough_final':
        return 'Rough & Final Clean';
      case 'rough_final_touchup':
        return 'Rough, Final & Touch-up Clean';
      case 'pressure_washing':
        return 'Pressure Washing Services';
      default:
        return type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  // Get scope of work based on project type and split into array
  let scopeOfWorkText = SCOPE_OF_WORK[formData.projectType] || '';
  if (
    formData.projectType === 'truck_stop' &&
    formData.truckStopIncludesFastFood &&
    (formData.truckStopFastFoodSquareFootage ?? 0) > 0
  ) {
    const ff = (formData.truckStopFastFoodSquareFootage || 0).toLocaleString();
    scopeOfWorkText += `\n• Fast Food / QSR Area (${ff} sq ft): Degrease and sanitize kitchen lines, hood zones (exterior surfaces), food prep counters, dining seating, and condiment stations.`;
  }
  const scopeOfWork = scopeOfWorkText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace('• ', '').trim());

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo and Company Info */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Image src={logoPath} style={styles.logo} />
              </View>
              <View>
                <Text style={styles.companyName}>{companyInfo.name}</Text>
                <Text style={styles.companyDetails}>{companyInfo.address}</Text>
                <Text style={styles.companyDetails}>{companyInfo.city}</Text>
                <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
                <Text style={styles.companyDetails}>{companyInfo.email}</Text>
              </View>
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetails}>Date: {invoiceInfo.date}</Text>
            <Text style={styles.invoiceDetails}>Due Date: {invoiceInfo.dueDate}</Text>
            <Text style={styles.invoiceDetails}>Quote Reference: #{quoteInfo.quoteNumber}</Text>
          </View>
        </View>

        {/* Bill To and Project Information */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            {billToLines.length > 0 ? (
              billToLines.map((line, i) => (
                <Text key={i} style={styles.infoValue}>{line}</Text>
              ))
            ) : (
              <Text style={styles.infoValue}>______________________________</Text>
            )}
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Project Location</Text>
            <Text style={styles.infoValue}>{quoteInfo.projectName}</Text>
            <Text style={styles.infoValue}>{quoteInfo.projectAddress}</Text>
            {proposal ? <ProposalFactLines facts={proposal.projectFacts} textStyle={styles.infoValue} /> : null}
          </View>
        </View>

        {/* Service Details Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text>Item</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>Amount</Text>
              </View>
            </View>

            {proposal ? (
              <ProposalLineItemRows
                items={proposal.lineItems}
                rowStyle={styles.tableRow}
                descriptionCellStyle={[styles.tableCell, styles.descriptionCell]}
                amountCellStyle={[styles.tableCell, styles.amountCell]}
                captionStyle={{ fontSize: 9, marginTop: 4 }}
              />
            ) : (
            <>
            {/* Main Cleaning Service */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                {isPressureWashingJob(formData) ? (
                  <>
                    <Text>{getPressureWashingLineTitle(formData)}</Text>
                    {formData.needsChimneyWash && (formData.chimneyCount || 0) > 0 ? (
                      <Text style={{ marginTop: 6 }}>
                        Exterior chimney wash — {(formData.chimneyCount || 0).toLocaleString()} chimney
                        {(formData.chimneyCount || 0) === 1 ? '' : 's'}
                      </Text>
                    ) : null}
                  </>
                ) : truckStopSplit ? (
                  <>
                    <Text>
                      {getCleaningTypeDisplay(formData.cleaningType)} — Truck stop facility (
                      {formData.squareFootage.toLocaleString()} sq ft)
                    </Text>
                    <Text style={{ marginTop: 6 }}>
                      {getCleaningTypeDisplay(formData.cleaningType)} — Fast food / QSR (
                      {(formData.truckStopFastFoodSquareFootage || 0).toLocaleString()} sq ft)
                    </Text>
                  </>
                ) : (
                  <Text>
                    {getCleaningTypeDisplay(formData.cleaningType)} - {formData.squareFootage.toLocaleString()} sq ft
                  </Text>
                )}
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                {truckStopSplit ? (
                  <>
                    <Text>{formatCurrency(truckStopSplit.facility)}</Text>
                    <Text style={{ marginTop: 6 }}>{formatCurrency(truckStopSplit.fastFood)}</Text>
                  </>
                ) : (
                  <Text>{formatCurrency(subtotalForPrimaryService)}</Text>
                )}
              </View>
            </View>

            {windowQuoteShare > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text style={{ fontWeight: 'bold' }}>Window cleaning services</Text>
                  <Text style={{ fontSize: 9, marginTop: 4 }}>
                    {(formData.numberOfWindows || 0).toLocaleString()} standard,{' '}
                    {(formData.numberOfLargeWindows || 0).toLocaleString()} large,{' '}
                    {(formData.numberOfHighAccessWindows || 0).toLocaleString()} high-access
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatCurrency(windowQuoteShare)}</Text>
                </View>
              </View>
            )}
            </>
            )}
          </View>
        </View>

        {/* Totals and payment stay together so a short leftover gap cannot strand the payment block. */}
        <View wrap={false}>
          <View style={styles.totalsTable}>
            <View style={[styles.tableRow, { borderTop: '1px solid #ddd' }]}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={{ fontWeight: 'bold' }}>Subtotal</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency(subtotal)}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={{ fontWeight: 'bold' }}>Sales Tax ({formatSalesTaxPercent(taxRate)})</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency(salesTax)}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>TOTAL</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{formatCurrency(finalTotal)}</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              flex: 1,
              marginRight: 12,
              padding: 8,
              backgroundColor: '#f8fafc',
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 }}>Payment Information</Text>
              <Text style={{ fontSize: 10 }}>Please make checks payable to: {companyInfo.name}</Text>
              <Text style={{ fontSize: 10, marginTop: 2 }}>{companyInfo.address}, {companyInfo.city}</Text>
              <Text style={{ fontSize: 10, marginTop: 2 }}>Questions: {companyInfo.email} · {companyInfo.phone}</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e40af', marginTop: 8, marginBottom: 3 }}>Payment Terms</Text>
              <Text style={{ fontSize: 10 }}>{invoiceInfo.paymentTerms}</Text>
            </View>
            <View style={{
              backgroundColor: '#f0f0f0',
              padding: 8,
              width: 180,
              borderRadius: 5,
              border: '1px solid #d0d0d0'
            }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Balance Due:</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{companyInfo.name} | {companyInfo.phone} | {companyInfo.email}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 