import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Rect, G, Path } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import { formatCurrency, getQuoteCounter } from '@/lib/utils';
import { PROJECT_SCOPES, PRESSURE_WASHING_RATES, PRESSURE_WASHING_PAYMENT_TERMS, SCOPE_OF_WORK } from '@/lib/constants';

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
    padding: 30,
    fontFamily: 'Roboto',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    width: '50%',
  },
  quoteInfo: {
    width: '50%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 5,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  quoteDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoColumn: {
    width: '50%',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: 20,
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
    width: '70%',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
  },
  amountCell: {
    width: '30%',
    textAlign: 'right',
  },
  subtotalRow: {
    backgroundColor: '#F0F0F0',
    marginTop: 5,
  },
  totalRow: {
    backgroundColor: '#E6F0FF',
    marginTop: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  notes: {
    fontSize: 10,
    marginBottom: 20,
  },
  terms: {
    fontSize: 10,
    marginBottom: 20,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureColumn: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 5,
    marginTop: 20,
    width: '100%',
  },
  signatureLabel: {
    fontSize: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    fontSize: 10,
  },
  subtotalText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  logoContainer: {
    width: 80,
    height: 40,
    marginRight: 10
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center'
  },
  quoteDate: {
    fontSize: 10,
    marginBottom: 3,
  },
  quoteExpiry: {
    fontSize: 10,
    marginBottom: 3,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    fontSize: 10,
  },
  lineItemContent: {
    width: '70%',
  },
  lineItemTitle: {
    fontWeight: 'bold',
  },
  lineItemDescription: {
    fontSize: 9,
  },
  lineItemAmount: {
    width: '30%',
    textAlign: 'right',
  },
});

// Get cleaning type display name
const getCleaningTypeDisplay = (type: string): string => {
  switch (type) {
    case 'rough': return 'Rough Clean (First Stage)';
    case 'final': return 'Final Clean (Second Stage)';
    case 'powder_puff': return 'Powder Puff Clean (Third Stage)';
    case 'complete': return 'Commercial Cleaning';
    default: return type;
  }
};

// Get project type display name
const getProjectTypeDisplay = (type: string): string => {
  switch (type) {
    case 'jewelry_store': return 'Jewelry Store';
    case 'grocery_store': return 'Grocery Store';
    default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  }
};

// Add a safe formatter to prevent errors in the PDF generation
const formatValue = (value: string | number | undefined | null, defaultValue: string = ''): string => {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
};

interface QuotePDFProps {
  estimateData: EstimateData & {
    // Add optional adjusted line item prices
    adjustedLineItems?: {
      [key: string]: number;
    };
  };
  formData: FormData;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
  };
  clientInfo: {
    name: string;
    company: string;
    address: string;
    email: string;
    phone: string;
  };
  quoteInfo: {
    quoteNumber: string;
    date: string;
    validUntil: string;
    projectName: string;
    projectAddress: string;
    notes: string;
    terms: string;
  };
}

const QuotePDF: React.FC<QuotePDFProps> = ({ 
  estimateData, 
  formData, 
  companyInfo, 
  clientInfo, 
  quoteInfo 
}) => {
  // Get the current quote counter value
  const quoteCounter = getQuoteCounter();
  
  // Base64 encoded blue rectangle with "BBPS" text (as a placeholder)
  const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABQCAYAAABcbTqwAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDEtMjNUMTU6MzA6MDMtMDU6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTAxLTIzVDE1OjMwOjAzLTA1OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTAxLTIzVDE1OjMwOjAzLTA1OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjVjMzBjODhmLTJiYjQt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";
  
  // Early return for undefined data
  if (!estimateData || !formData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ padding: 30 }}>
            <Text>Error: Quote data is not available.</Text>
          </View>
        </Page>
      </Document>
    );
  }
  
  // Ensure all objects have default values to prevent rendering errors
  const safeCompanyInfo = companyInfo || {
    name: '', address: '', city: '', phone: '', email: '', website: ''
  };
  
  const safeClientInfo = clientInfo || {
    name: '', company: '', address: '', email: '', phone: ''
  };
  
  const safeQuoteInfo = quoteInfo || {
    quoteNumber: '', date: '', validUntil: '', projectName: '', 
    projectAddress: '', notes: '', terms: ''
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Image src={logoBase64} style={styles.logo} />
              </View>
              <View>
                <Text style={styles.companyName}>{safeCompanyInfo.name}</Text>
                <Text style={styles.companyDetails}>{safeCompanyInfo.address}</Text>
                <Text style={styles.companyDetails}>{safeCompanyInfo.city}</Text>
                <Text style={styles.companyDetails}>Phone: {safeCompanyInfo.phone}</Text>
                <Text style={styles.companyDetails}>{safeCompanyInfo.email}</Text>
              </View>
            </View>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteTitle}>QUOTE #{quoteCounter}</Text>
            <Text style={styles.quoteDate}>Date: {safeQuoteInfo.date}</Text>
            <Text style={styles.quoteExpiry}>Valid Until: {safeQuoteInfo.validUntil}</Text>
          </View>
        </View>

        {/* Client and Project Information */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Client Information</Text>
            <Text style={styles.infoValue}>{safeClientInfo.name}</Text>
            <Text style={styles.infoValue}>{safeClientInfo.company}</Text>
            <Text style={styles.infoValue}>{safeClientInfo.address}</Text>
            <Text style={styles.infoValue}>{safeClientInfo.email}</Text>
            <Text style={styles.infoValue}>{safeClientInfo.phone}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Project Information</Text>
            <Text style={styles.infoValue}>{safeQuoteInfo.projectName}</Text>
            <Text style={styles.infoValue}>{safeQuoteInfo.projectAddress}</Text>
            <Text style={styles.infoValue}>Project Type: {getProjectTypeDisplay(formData.projectType)}</Text>
            <Text style={styles.infoValue}>Square Footage: {(formData.squareFootage || 0).toLocaleString()} sq ft</Text>
            <Text style={styles.infoValue}>Cleaning Type: {getCleaningTypeDisplay(formData.cleaningType)}</Text>
          </View>
        </View>

        {/* Service Details Table */}
        <Text style={styles.subtitle}>Service Details</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.descriptionCell]}>
              <Text style={styles.bold}>Description</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text style={styles.bold}>Amount</Text>
            </View>
          </View>

          {/* Base Cleaning Service */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.descriptionCell]}>
              <Text style={styles.bold}>{getCleaningTypeDisplay(formData.cleaningType)} - {(formData.squareFootage || 0).toLocaleString()} sq ft</Text>
              <Text style={{fontSize: 9, marginTop: 5}}>
                {PROJECT_SCOPES[formData.projectType]?.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`) || PROJECT_SCOPES.default.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`)}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>{formatCurrency(
                estimateData.adjustedLineItems?.basePrice !== undefined 
                  ? estimateData.adjustedLineItems.basePrice 
                  : estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier
              )}</Text>
            </View>
          </View>

          {/* VCT Flooring if applicable */}
          {formData.hasVCT && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>VCT Flooring Treatment</Text>
                <Text>Stripping, waxing, and buffing of vinyl composition tile</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formatCurrency(
                  estimateData.adjustedLineItems?.vctCost !== undefined 
                    ? estimateData.adjustedLineItems.vctCost 
                    : estimateData.vctCost
                )}</Text>
              </View>
            </View>
          )}

          {/* Pressure Washing if applicable */}
          {formData.needsPressureWashing && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>Pressure Washing Services</Text>
                <Text>{(formData.pressureWashingArea || 0).toLocaleString()} sq ft of exterior/concrete surfaces</Text>
                <Text style={{fontSize: 9, marginTop: 5}}>
                  Service includes professional-grade cleaning solutions and equipment. Standard rates:
                  {'\n'}• Soft Wash: ${PRESSURE_WASHING_RATES.SOFT_WASH.rate}/sq ft (min. ${PRESSURE_WASHING_RATES.SOFT_WASH.minimum})
                  {'\n'}• Roof Wash: ${PRESSURE_WASHING_RATES.ROOF_WASH.rate}/sq ft
                  {'\n'}• Driveway: ${PRESSURE_WASHING_RATES.DRIVEWAY.rate}/sq ft
                  {'\n'}• Decks/Trex: ${PRESSURE_WASHING_RATES.DECK.rate}/sq ft
                  {'\n'}• Custom jobs: Daily rate ${PRESSURE_WASHING_RATES.DAILY_RATE}
                </Text>
                <Text style={{fontSize: 9, marginTop: 5, fontStyle: 'italic'}}>
                  Payment Terms: {formData.projectType === 'warehouse' ? PRESSURE_WASHING_PAYMENT_TERMS.INDUSTRIAL : 
                    ['restaurant', 'medical', 'office', 'retail', 'educational', 'hotel', 'jewelry_store'].includes(formData.projectType) ? PRESSURE_WASHING_PAYMENT_TERMS.COMMERCIAL : 
                    PRESSURE_WASHING_PAYMENT_TERMS.RESIDENTIAL}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formatCurrency(
                  estimateData.adjustedLineItems?.pressureWashingCost !== undefined 
                    ? estimateData.adjustedLineItems.pressureWashingCost 
                    : estimateData.pressureWashingCost
                )}</Text>
              </View>
            </View>
          )}

          {/* Travel Expenses */}
          <View style={styles.lineItem}>
            <View style={styles.lineItemContent}>
              <Text style={styles.lineItemTitle}>Travel Expenses</Text>
              <Text style={styles.lineItemDescription}>{formData.distanceFromOffice || 0} miles</Text>
            </View>
            <Text style={styles.lineItemAmount}>
              {formatCurrency(
                estimateData.adjustedLineItems?.travelCost !== undefined 
                  ? estimateData.adjustedLineItems.travelCost 
                  : estimateData.travelCost
              )}
            </Text>
          </View>

          {/* Overnight Accommodations if applicable */}
          {formData.stayingOvernight && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>Overnight Accommodations</Text>
                <Text>{formData.numberOfNights} night(s) for {formData.numberOfCleaners} staff members</Text>
                <Text>Includes hotel and per diem expenses</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formatCurrency(
                  estimateData.adjustedLineItems?.overnightCost !== undefined 
                    ? estimateData.adjustedLineItems.overnightCost 
                    : estimateData.overnightCost
                )}</Text>
              </View>
            </View>
          )}

          {/* Urgency Adjustment if applicable */}
          {estimateData.urgencyMultiplier > 1 && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>Urgency Adjustment</Text>
                <Text>Priority scheduling (Level {formData.urgencyLevel}/10)</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>
                  {formatCurrency(
                    estimateData.adjustedLineItems?.urgencyCost !== undefined
                      ? estimateData.adjustedLineItems.urgencyCost
                      : ((estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier) +
                        estimateData.vctCost + estimateData.travelCost + estimateData.overnightCost + estimateData.pressureWashingCost) * 
                        (estimateData.urgencyMultiplier - 1)
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* Window Cleaning if applicable */}
          {formData.needsWindowCleaning && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>Window Cleaning Services</Text>
                <Text>{(formData.numberOfWindows || 0)} standard windows, {(formData.numberOfLargeWindows || 0)} large windows, {(formData.numberOfHighAccessWindows || 0)} high-access windows</Text>
                <Text>Includes all necessary equipment and cleaning solutions</Text>
                {!formData.chargeForWindowCleaning && (
                  <Text style={{fontStyle: 'italic', color: '#666666'}}>Window cleaning will be quoted separately</Text>
                )}
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formData.chargeForWindowCleaning ? formatCurrency(
                  estimateData.adjustedLineItems?.windowCleaningCost !== undefined
                    ? estimateData.adjustedLineItems.windowCleaningCost
                    : estimateData.windowCleaningCost
                ) : 'Separate Quote'}</Text>
              </View>
            </View>
          )}

          {/* Display case cleaning for jewelry stores */}
          {formData.projectType === 'jewelry_store' && estimateData.displayCaseCost > 0 && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>Display Case Cleaning</Text>
                <Text>{(formData.numberOfDisplayCases || 0)} display cases</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formatCurrency(
                  estimateData.adjustedLineItems?.displayCaseCost !== undefined
                    ? estimateData.adjustedLineItems.displayCaseCost
                    : estimateData.displayCaseCost
                )}</Text>
              </View>
            </View>
          )}

          {/* Subtotal - Use the adjusted subtotal that's calculated in handlePDFDownload */}
          <View style={[styles.row, styles.subtotalRow]}>
            <Text style={styles.subtotalText}>Subtotal</Text>
            <Text style={styles.subtotalText}>{formatCurrency(estimateData.totalBeforeMarkup)}</Text>
          </View>

          {/* Markup is now included in the line items, so we don't need to show it separately */}

          {/* Sales Tax */}
          <View style={styles.row}>
            <Text>Sales Tax (7%)</Text>
            <Text>{formatCurrency(estimateData.salesTax)}</Text>
          </View>

          {/* Total */}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalText}>TOTAL</Text>
            <Text style={styles.totalText}>{formatCurrency(estimateData.totalPrice)}</Text>
          </View>
        </View>

        {/* Replace markup note with general note */}
        <View style={{marginTop: 5, marginBottom: 10}}>
          <Text style={{fontSize: 9, fontStyle: 'italic', color: '#666666'}}>
            Note: All prices include professional-grade cleaning supplies, equipment, and labor costs.
          </Text>
        </View>

        {/* Project Timeline */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Project Timeline</Text>
            {formData.cleaningType === 'complete' ? (
              <>
                <Text style={{...styles.infoValue, fontWeight: 'bold', marginTop: 5}}>Three-Stage Cleaning Schedule:</Text>
                <Text style={styles.infoValue}>• Rough Clean: During construction</Text>
                <Text style={styles.infoValue}>• Final Clean: After construction completion</Text>
                <Text style={styles.infoValue}>• Touch-up Clean: Before client move-in/opening</Text>
                <Text style={{...styles.infoValue, fontStyle: 'italic', marginTop: 5, fontSize: 9}}>
                  Note: These cleaning phases are performed at different stages during the construction timeline.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoValue}>Team Size: {formData.numberOfCleaners} cleaners</Text>
              </>
            )}
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Additional Information</Text>
            <Text style={styles.notes}>{safeQuoteInfo.notes}</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <Text style={styles.subtitle}>Terms & Conditions</Text>
        <Text style={styles.terms}>{safeQuoteInfo.terms}</Text>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureColumn}>
            <Text style={styles.subtitle}>Acceptance</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Client Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
          <View style={styles.signatureColumn}>
            <Text style={styles.subtitle}>Provider</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business! | {safeCompanyInfo.name} | {safeCompanyInfo.phone} | {safeCompanyInfo.email}</Text>
          <Text style={{marginTop: 5, fontStyle: 'italic'}}>
            All prices include our standard supplies, equipment, labor, and service fees for professional-grade cleaning.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDF;
