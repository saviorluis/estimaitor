import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
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
    marginBottom: 30,  // Increased margin to create more space before logo
    textAlign: 'center'
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
    width: 200,
    height: 100,
    marginBottom: 30,  // Increased margin to create more space after logo
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  companyHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30  // Increased margin to create more space
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clientText: {
    fontSize: 10,
    marginBottom: 2,
  },
  projectText: {
    fontSize: 10,
    marginBottom: 2,
  },
  scopeText: {
    fontSize: 10,
    marginTop: 5,
  },
  termsText: {
    fontSize: 10,
    marginTop: 5,
  },
  contactText: {
    fontSize: 10,
    marginTop: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryAmount: {
    fontSize: 10,
  },
  totalRow: {
    backgroundColor: '#E6F0FF',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  projectInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 3,
  },
  quoteNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  contactLine: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 3,
  },
  addressLine: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 3,
  },
  websiteLine: {
    fontSize: 11,
    textAlign: 'center',
  },
});

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

// Get scope of work text
const getScopeOfWork = (formData: FormData): string => {
  const scope = PROJECT_SCOPES[formData.projectType];
  if (!scope) return 'No specific scope of work defined for this project type.';

  let baseScope = scope.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`);

  if (formData.cleaningType === 'rough_final_touchup') {
    baseScope += '\n\nThree-Stage Cleaning Schedule:\n• Rough Clean: During construction\n• Final Clean: After construction completion\n• Touch-up Clean: Before client move-in/opening';
  }

  if (formData.hasVCT) {
    baseScope += '\n\nVCT Flooring Treatment: Stripping, waxing, and buffing of vinyl composition tile.';
  }

  if (formData.needsPressureWashing && formData.pressureWashingArea > 0) {
    baseScope += '\n\nPressure Washing Services: Professional-grade cleaning solutions and equipment for exterior/concrete surfaces.';
  }

  if (formData.stayingOvernight) {
    baseScope += '\n\nOvernight Accommodations: Hotel accommodations and per diem expenses for staff.';
  }

  if (formData.needsWindowCleaning && (formData.numberOfWindows || formData.numberOfLargeWindows || formData.numberOfHighAccessWindows) > 0) {
    baseScope += '\n\nWindow Cleaning Services: Standard and high-access window cleaning, including equipment and solutions.';
  }

  if (formData.projectType === 'jewelry_store' && formData.numberOfDisplayCases > 0) {
    baseScope += '\n\nDisplay Case Cleaning: Cleaning and maintenance of display cases.';
  }

  if (formData.urgencyLevel > 5) {
    baseScope += '\n\nUrgency Adjustment: Priority scheduling (Level ' + formData.urgencyLevel + '/10) for expedited timeline.';
  }

  return baseScope;
};

// Add a safe formatter to prevent errors in the PDF generation
const formatValue = (value: string | number | undefined | null, defaultValue: string = ''): string => {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
};

interface QuotePDFProps {
  estimateData: EstimateData & {
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
  adjustedPrices: {[key: string]: number};
}

const QuotePDF: React.FC<QuotePDFProps> = ({
  estimateData,
  formData,
  companyInfo,
  clientInfo,
  quoteInfo,
  adjustedPrices
}) => {
  const totalAmount = Object.values(adjustedPrices).reduce((sum, price) => sum + price, 0);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Image src="/assets/logo.png" style={styles.logo} />
          </View>
          
          {formData.cleaningType === 'pressure_washing' ? (
            <>
              <Text style={[styles.title, { marginTop: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }]}>
                PRESSURE WASHING
              </Text>
              <Text style={[styles.title, { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }]}>
                SERVICES PROPOSAL
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.title, { marginTop: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }]}>
                POST CONSTRUCTION
              </Text>
              <Text style={[styles.title, { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }]}>
                CLEANING PROPOSAL
              </Text>
            </>
          )}
          
          <Text style={[styles.subtitle, { marginTop: 20, marginBottom: 10 }]}>Prepared for:</Text>
          <Text style={[styles.clientName, { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }]}>
            {clientInfo.company || clientInfo.name}
          </Text>
          
          <Text style={[styles.projectInfo, { fontSize: 12, textAlign: 'center', marginBottom: 3 }]}>
            Project: {quoteInfo.projectName}
          </Text>
          <Text style={[styles.projectInfo, { fontSize: 12, textAlign: 'center', marginBottom: 15 }]}>
            Location: {quoteInfo.projectAddress}
          </Text>
          
          <Text style={[styles.quoteNumber, { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 }]}>
            Quote #: {quoteInfo.quoteNumber}
          </Text>
          
          <Text style={[styles.companyName, { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }]}>
            {companyInfo.name}
          </Text>
          <Text style={[styles.contactLine, { fontSize: 11, textAlign: 'center', marginBottom: 3 }]}>
            {companyInfo.phone} | {companyInfo.email}
          </Text>
          <Text style={[styles.addressLine, { fontSize: 11, textAlign: 'center', marginBottom: 3 }]}>
            {companyInfo.address}, {companyInfo.city}
          </Text>
          <Text style={[styles.websiteLine, { fontSize: 11, textAlign: 'center' }]}>
            {companyInfo.website}
          </Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Image src="/assets/logo.png" style={styles.logo} />
              </View>
              <View>
                <Text style={styles.companyName}>{companyInfo.name}</Text>
                <Text style={styles.companyDetails}>{companyInfo.address}</Text>
                <Text style={styles.companyDetails}>{companyInfo.city}</Text>
                <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
                <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
                <Text style={styles.companyDetails}>Website: {companyInfo.website}</Text>
              </View>
            </View>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteTitle}>QUOTE #{quoteInfo.quoteNumber}</Text>
            <Text style={styles.quoteDate}>Date: {quoteInfo.date}</Text>
            <Text style={styles.quoteDetails}>Valid Until: {quoteInfo.validUntil}</Text>
          </View>
        </View>

        {/* Client and Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <Text style={styles.clientText}>{clientInfo.name}</Text>
          <Text style={styles.clientText}>{clientInfo.company}</Text>
          <Text style={styles.clientText}>{clientInfo.address}</Text>
          <Text style={styles.clientText}>{clientInfo.email}</Text>
          <Text style={styles.clientText}>{clientInfo.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <Text style={styles.projectText}>Project: {quoteInfo.projectName}</Text>
          <Text style={styles.projectText}>Address: {quoteInfo.projectAddress}</Text>
          <Text style={styles.projectText}>Type: {getProjectTypeDisplay(formData.projectType)}</Text>
          <Text style={styles.projectText}>Square Footage: {(formData.squareFootage || 0).toLocaleString()} sq ft</Text>
          <Text style={styles.projectText}>Cleaning Type: {getCleaningTypeDisplay(formData.cleaningType)}</Text>
        </View>

        {/* Service Details */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Service Details & Pricing</Text>

          {/* Base Cleaning Service */}
          <View style={styles.lineItem}>
            <View style={styles.lineItemContent}>
              <Text style={styles.lineItemTitle}>{getCleaningTypeDisplay(formData.cleaningType)}</Text>
              <Text style={styles.lineItemDescription}>
                {formData.squareFootage.toLocaleString()} sq ft
              </Text>
            </View>
            <Text style={styles.lineItemAmount}>
              {formatCurrency(
                estimateData.adjustedLineItems?.basePrice !== undefined
                  ? estimateData.adjustedLineItems.basePrice
                  : estimateData.basePrice
              )}
            </Text>
          </View>

          {/* VCT Flooring if applicable */}
          {formData.hasVCT && (
            <View style={styles.lineItem}>
              <View style={styles.lineItemContent}>
                <Text style={styles.lineItemTitle}>VCT Flooring Treatment</Text>
                <Text style={styles.lineItemDescription}>
                  {(formData.vctSquareFootage || 0).toLocaleString()} sq ft of VCT flooring
                </Text>
                <Text style={styles.lineItemDescription}>Vinyl Composition Tile floor cleaning and maintenance</Text>
              </View>
              <Text style={styles.lineItemAmount}>
                {formatCurrency(
                  estimateData.adjustedLineItems?.vctCost !== undefined
                    ? estimateData.adjustedLineItems.vctCost
                    : estimateData.vctCost
                )}
              </Text>
            </View>
          )}

          {/* Window Cleaning Services - MOVED BEFORE TRAVEL */}
          {formData.needsWindowCleaning && (
            <View style={styles.lineItem}>
              <View style={styles.lineItemContent}>
                <Text style={styles.lineItemTitle}>Window Cleaning Services</Text>
                <Text style={styles.lineItemDescription}>
                  {(formData.numberOfWindows || 0)} standard windows, {(formData.numberOfLargeWindows || 0)} large windows, {(formData.numberOfHighAccessWindows || 0)} high-access windows
                </Text>
                <Text style={styles.lineItemDescription}>
                  Includes all necessary equipment and cleaning solutions
                </Text>
                {!formData.chargeForWindowCleaning && (
                  <Text style={[styles.lineItemDescription, {fontStyle: 'italic', color: '#666666'}]}>
                    Window cleaning will be quoted separately
                  </Text>
                )}
              </View>
              <Text style={styles.lineItemAmount}>
                {formData.chargeForWindowCleaning ? formatCurrency(
                  estimateData.adjustedLineItems?.windowCleaningCost !== undefined
                    ? estimateData.adjustedLineItems.windowCleaningCost
                    : estimateData.windowCleaningCost
                ) : 'Separate Quote'}
              </Text>
            </View>
          )}

          {/* Travel Expenses - NOW AFTER WINDOW CLEANING */}
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
            <View style={styles.lineItem}>
              <View style={styles.lineItemContent}>
                <Text style={styles.lineItemTitle}>Overnight Accommodations</Text>
                <Text style={styles.lineItemDescription}>
                  {formData.numberOfNights} night(s) for {formData.numberOfCleaners} staff members
                </Text>
                <Text style={styles.lineItemDescription}>Includes hotel and per diem expenses</Text>
              </View>
              <Text style={styles.lineItemAmount}>
                {formatCurrency(
                  estimateData.adjustedLineItems?.overnightCost !== undefined
                    ? estimateData.adjustedLineItems.overnightCost
                    : estimateData.overnightCost
                )}
              </Text>
            </View>
          )}

          {/* Pressure Washing if applicable */}
          {formData.needsPressureWashing && formData.pressureWashingArea > 0 && (
            <View style={styles.lineItem}>
              <View style={styles.lineItemContent}>
                <Text style={styles.lineItemTitle}>Pressure Washing Services</Text>
                <Text style={styles.lineItemDescription}>
                  {formData.pressureWashingArea.toLocaleString()} sq ft of pressure washing
                </Text>
                <Text style={styles.lineItemDescription}>Includes equipment rental and cleaning solutions</Text>
              </View>
              <Text style={styles.lineItemAmount}>
                {formatCurrency(
                  estimateData.adjustedLineItems?.pressureWashingCost !== undefined
                    ? estimateData.adjustedLineItems.pressureWashingCost
                    : estimateData.pressureWashingCost
                )}
              </Text>
            </View>
          )}

          {/* Display case cleaning for jewelry stores */}
          {formData.projectType === 'jewelry_store' && formData.numberOfDisplayCases > 0 && (
            <View style={styles.lineItem}>
              <View style={styles.lineItemContent}>
                <Text style={styles.lineItemTitle}>Display Case Cleaning</Text>
                <Text style={styles.lineItemDescription}>
                  {formData.numberOfDisplayCases} display cases with specialized cleaning
                </Text>
              </View>
              <Text style={styles.lineItemAmount}>
                {formatCurrency(
                  estimateData.adjustedLineItems?.displayCaseCost !== undefined
                    ? estimateData.adjustedLineItems.displayCaseCost
                    : estimateData.displayCaseCost
                )}
              </Text>
            </View>
          )}

          {/* Urgency Adjustment if applicable */}
          {estimateData.urgencyMultiplier > 1 && (
            <View style={styles.lineItem}>
              <View style={styles.lineItemContent}>
                <Text style={styles.lineItemTitle}>Urgency Adjustment</Text>
                <Text style={styles.lineItemDescription}>
                  {((estimateData.urgencyMultiplier - 1) * 100).toFixed(0)}% adjustment for expedited timeline
                </Text>
              </View>
              <Text style={styles.lineItemAmount}>
                {formatCurrency(
                  (estimateData.basePrice + estimateData.vctCost + estimateData.travelCost + 
                   estimateData.overnightCost + estimateData.pressureWashingCost + 
                   estimateData.windowCleaningCost + estimateData.displayCaseCost) * 
                  (estimateData.urgencyMultiplier - 1)
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Pricing Summary */}
        <View style={[styles.section, { marginTop: 30 }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(estimateData.totalBeforeMarkup)}
            </Text>
          </View>

          {estimateData.markup > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Business Overhead (50%):</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(estimateData.markup)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sales Tax (7%):</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(estimateData.salesTax)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(estimateData.totalPrice)}
            </Text>
          </View>
        </View>

        {/* Scope of Work */}
        <View style={[styles.section, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          <Text style={styles.scopeText}>
            {getScopeOfWork(formData)}
          </Text>
        </View>

        {/* Terms and Conditions */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Payment is due within 30 days of completion{'\n'}
            • Additional services outside of scope will be billed separately{'\n'}
            • Quote valid for 30 days from issue date{'\n'}
            • All work performed to industry standards{'\n'}
            • Proof of insurance available upon request{'\n'}
            • If reschedule is required due to site not being ready or poor planning on client's end, a minimum fee of $250 will be charged for the return trip
          </Text>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.contactText}>
            For questions regarding this quote, please contact:{'\n'}
            {companyInfo.name}{'\n'}
            Phone: {companyInfo.phone}{'\n'}
            Email: {companyInfo.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDF;
