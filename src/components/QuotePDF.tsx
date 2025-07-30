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
  container: {
    flex: 1,
    padding: 20,
  },
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
  leftSide: {
    width: '50%',
  },
  rightSide: {
    width: '50%',
    alignItems: 'flex-end',
  },
  logoAndCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quoteInfoBelow: {
    alignItems: 'flex-end',
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
  serviceDescription: {
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serviceInfo: {
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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
  signatureBox: {
    width: '45%',
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 5,
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
    width: 120,
    height: 120,
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
  companyContactText: {
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: 'center',
  },
  contactNote: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
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
  summaryBox: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 4,
    padding: 12,
    marginHorizontal: 20,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 9,
    color: '#34495e',
    lineHeight: 1.4,
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
    baseScope += `\n\nVCT Flooring Services: Professional stripping, waxing, and buffing of ${(formData.vctSquareFootage || 0).toLocaleString()} sq ft of vinyl composition tile flooring.`;
  }

  if (formData.needsPressureWashing && formData.pressureWashingArea > 0) {
    baseScope += '\n\nPressure Washing Services: Professional-grade cleaning solutions and equipment for exterior/concrete surfaces.';
  }

  if (formData.stayingOvernight) {
    baseScope += '\n\nOvernight Accommodations: Hotel accommodations and per diem expenses for staff.';
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
            <Image src="https://raw.githubusercontent.com/saviorluis/estimaitor/main/public/assets/logo.png" style={styles.logo} />
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
          
          <Text style={[styles.quoteNumber, { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }]}>
            Quote #: {quoteInfo.quoteNumber}
          </Text>

          {/* Cleaning Type Title */}
          <Text style={[styles.title, { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, marginTop: 60 }]}>
            {formData.cleaningType === 'final' ? 'Post Construction Cleaning Proposal' :
             formData.cleaningType === 'vct_only' ? 'VCT Stripping & Waxing Proposal' :
             formData.cleaningType === 'window_cleaning_only' ? 'Window Cleaning Services Proposal' :
             formData.cleaningType === 'pressure_washing' ? 'Pressure Washing Services Proposal' :
             'Professional Cleaning Services Proposal'}
          </Text>

          <Text style={[styles.subtitle, { fontSize: 16, textAlign: 'center', marginBottom: 60, color: '#4A5568' }]}>
            Prepared for {clientInfo.name}
          </Text>
          
          {/* Company info moved to bottom */}
          <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' }}>
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
        </View>
      </Page>

      {/* Capability Statement Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.container}>
          {/* Header with Logo and Company Name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottom: 1, borderColor: '#E2E8F0', paddingBottom: 15 }}>
            <Image src="https://raw.githubusercontent.com/saviorluis/estimaitor/main/public/assets/logo.png" style={{ width: 60, height: 60 }} />
            <View style={{ marginLeft: 15 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                Big Brother{'\n'}
                Property Solutions
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={{ flex: 1 }}>
            {/* Company History */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>COMPANY HISTORY</Text>
              <Text style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.5 }}>
                BBPS is a Latino owned and operated commercial cleaning company, proudly serving the Southeast since 2023. 
                Known for our reliability and expertise, We deliver safe, efficient cleaning solutions across residential, 
                commercial, and industrial projects. Even in challenging environments like medical/healthcare centers, tight 
                urban spaces, and environmentally sensitive areas.
              </Text>
            </View>

            {/* Core Services */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>CORE SERVICES</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <View style={{ width: '50%', marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Post Construction Cleaning</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Commercial Cleaning</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• VCT Stripping & Waxing</Text>
                </View>
                <View style={{ width: '50%', marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Window Cleaning</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Pressure Washing</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Janitorial Services</Text>
                </View>
              </View>
            </View>

            {/* Certifications & Insurance */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>CERTIFICATIONS & INSURANCE</Text>
              <Text style={{ fontSize: 11, color: '#4A5568', marginBottom: 5 }}>• Licensed & Insured with comprehensive liability coverage</Text>
              <Text style={{ fontSize: 11, color: '#4A5568', marginBottom: 5 }}>• OSHA certified technicians</Text>
              <Text style={{ fontSize: 11, color: '#4A5568', marginBottom: 5 }}>• Specialized equipment and training</Text>
              <Text style={{ fontSize: 11, color: '#4A5568', marginBottom: 5 }}>• Safety-first approach</Text>
            </View>

            {/* Industry Experience */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>INDUSTRY EXPERIENCE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <View style={{ width: '50%', marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Retail Stores</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Medical Facilities</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Restaurants</Text>
                </View>
                <View style={{ width: '50%', marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Office Buildings</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Churches</Text>
                  <Text style={{ fontSize: 11, color: '#4A5568' }}>• Industrial Spaces</Text>
                </View>
              </View>
            </View>

            {/* Quality Commitment */}
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>QUALITY COMMITMENT</Text>
              <Text style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.5 }}>
                We are committed to delivering exceptional results through meticulous attention to detail, 
                professional staff, and state-of-the-art equipment. Our quality assurance process ensures 
                consistent, high-standard cleaning services that meet and exceed client expectations.
              </Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.leftSide}>
            <View style={styles.logoAndCompany}>
              <Image src="https://raw.githubusercontent.com/saviorluis/estimaitor/main/public/assets/logo.png" style={styles.logo} />
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.companyName}>{companyInfo.name}</Text>
                <Text style={styles.companyDetails}>{companyInfo.address}</Text>
                <Text style={styles.companyDetails}>{companyInfo.city}</Text>
                <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
                <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
                <Text style={styles.companyDetails}>Website: {companyInfo.website}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rightSide}>
            <View style={styles.quoteInfoBelow}>
              <Text style={styles.quoteTitle}>QUOTE #{quoteInfo.quoteNumber}</Text>
              <Text style={styles.quoteDate}>Date: {quoteInfo.date}</Text>
              <Text style={styles.quoteDetails}>Valid Until: {quoteInfo.validUntil}</Text>
            </View>
          </View>
        </View>

        {/* Client and Project Information on same horizontal line */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <Text style={styles.clientText}>{clientInfo.name}</Text>
          <Text style={styles.clientText}>{clientInfo.company}</Text>
          <Text style={styles.clientText}>{clientInfo.address}</Text>
          <Text style={styles.clientText}>{clientInfo.email}</Text>
          <Text style={styles.clientText}>{clientInfo.phone}</Text>
        </View>
          <View style={styles.infoColumn}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <Text style={styles.projectText}>Project: {quoteInfo.projectName}</Text>
          <Text style={styles.projectText}>Address: {quoteInfo.projectAddress}</Text>
          <Text style={styles.projectText}>Type: {getProjectTypeDisplay(formData.projectType)}</Text>
          <Text style={styles.projectText}>Square Footage: {(formData.squareFootage || 0).toLocaleString()} sq ft</Text>
          <Text style={styles.projectText}>Cleaning Type: {getCleaningTypeDisplay(formData.cleaningType)}</Text>
          </View>
        </View>

        {/* Service Details Table */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Description</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right', alignSelf: 'flex-start' }]}>Amount</Text>
              </View>
          </View>

            {/* Main Cleaning Service Row */}
            <View style={styles.tableRow}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{getCleaningTypeDisplay(formData.cleaningType)} - {formData.squareFootage.toLocaleString()} sq ft</Text>
                <Text style={styles.tableCell}>
                  {getScopeOfWork(formData)}
                </Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                {formatCurrency(
                    (estimateData.adjustedLineItems?.basePrice !== undefined
                      ? estimateData.adjustedLineItems.basePrice
                      : estimateData.basePrice) + 
                    (estimateData.adjustedLineItems?.vctCost !== undefined
                      ? estimateData.adjustedLineItems.vctCost
                      : estimateData.vctCost)
                )}
              </Text>
            </View>
            </View>



            {/* Window Cleaning Services Row */}
            {formData.needsWindowCleaning && formData.numberOfWindows > 0 && (
              <View style={styles.tableRow}>
                <View style={styles.descriptionCell}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Window Cleaning Services</Text>
                  <Text style={styles.tableCell}>
                    {(() => {
                      const windowTypes = [];
                      if (formData.numberOfWindows > 0) windowTypes.push(`${formData.numberOfWindows} standard windows`);
                      if (formData.numberOfLargeWindows > 0) windowTypes.push(`${formData.numberOfLargeWindows} large windows`);
                      if (formData.numberOfHighAccessWindows > 0) windowTypes.push(`${formData.numberOfHighAccessWindows} high-access windows`);
                      return windowTypes.join(', ');
                    })()}
                </Text>
                  <Text style={styles.tableCell}>Includes all necessary equipment, cleaning solutions, and labor</Text>
                </View>
                                <View style={styles.amountCell}>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                    {formatCurrency(
                      estimateData.adjustedLineItems?.windowCleaningCost !== undefined
                        ? estimateData.adjustedLineItems.windowCleaningCost
                        : estimateData.windowCleaningCost
                    )}
                  </Text>
                </View>
              </View>
            )}

            {/* Overnight Accommodations Row */}
            {formData.stayingOvernight && (
              <View style={styles.tableRow}>
                <View style={styles.descriptionCell}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Overnight Accommodations</Text>
                  <Text style={styles.tableCell}>
                    {formData.numberOfNights} night(s) for {formData.numberOfCleaners} staff members
                  </Text>
                  <Text style={styles.tableCell}>Includes hotel accommodations, meals & incidentals, and coordination</Text>
                </View>
                                <View style={styles.amountCell}>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                    {formatCurrency(
                      estimateData.adjustedLineItems?.overnightCost !== undefined
                        ? estimateData.adjustedLineItems.overnightCost
                        : estimateData.overnightCost
                    )}
                  </Text>
                </View>
            </View>
          )}

            {/* Pressure Washing Services Row */}
          {formData.needsPressureWashing && formData.pressureWashingArea > 0 && (
              <View style={styles.tableRow}>
                <View style={styles.descriptionCell}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Pressure Washing Services</Text>
                  <Text style={styles.tableCell}>
                  {formData.pressureWashingArea.toLocaleString()} sq ft of pressure washing
                </Text>
                  <Text style={styles.tableCell}>Includes equipment rental and cleaning solutions</Text>
              </View>
                                <View style={styles.amountCell}>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                    {formatCurrency(
                      estimateData.adjustedLineItems?.pressureWashingCost !== undefined
                        ? estimateData.adjustedLineItems.pressureWashingCost
                        : estimateData.pressureWashingCost
                    )}
                  </Text>
                </View>
            </View>
          )}

            {/* Display Case Cleaning Row */}
          {formData.projectType === 'jewelry_store' && formData.numberOfDisplayCases > 0 && (
              <View style={styles.tableRow}>
                <View style={styles.descriptionCell}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Display Case Cleaning</Text>
                  <Text style={styles.tableCell}>
                  {formData.numberOfDisplayCases} display cases with specialized cleaning
                </Text>
              </View>
                                <View style={styles.amountCell}>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                    {formatCurrency(
                      estimateData.adjustedLineItems?.displayCaseCost !== undefined
                        ? estimateData.adjustedLineItems.displayCaseCost
                        : estimateData.displayCaseCost
                    )}
                  </Text>
                </View>
            </View>
          )}

            {/* Travel Expenses Row - positioned right above subtotal */}
            <View style={styles.tableRow}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Travel Expenses</Text>
                <Text style={styles.tableCell}>{formData.distanceFromOffice || 0} miles</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                  {formatCurrency(
                    estimateData.adjustedLineItems?.travelCost !== undefined
                      ? estimateData.adjustedLineItems.travelCost
                      : estimateData.travelCost
                  )}
                </Text>
              </View>
            </View>

            {/* Subtotal Row */}
            <View style={styles.tableRow}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Subtotal</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                  {formatCurrency(estimateData.totalBeforeMarkup)}
                </Text>
              </View>
            </View>

            {/* Sales Tax Row */}
            <View style={styles.tableRow}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Sales Tax (7%)</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', alignSelf: 'flex-start' }]}>
                  {formatCurrency(estimateData.salesTax)}
                </Text>
              </View>
            </View>

            {/* Total Row */}
            <View style={styles.tableRow}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, { fontWeight: 'bold', fontSize: 12 }]}>TOTAL</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', fontSize: 12, alignSelf: 'flex-start' }]}>
                  {formatCurrency(estimateData.totalPrice)}
                </Text>
              </View>
            </View>
          </View>
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
              <Text style={styles.summaryLabel}>Business Overhead (30%):</Text>
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





        {/* Terms and Conditions */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            1. Payment Terms: Net 15 - Payment due within 15 days of completion.{'\n'}
            2. Cancellation Policy: 48-hour notice required for cancellation or rescheduling.{'\n'}
            3. Scope: This quote covers only the services explicitly described.{'\n'}
            4. Additional Services: Any services not specified will be quoted separately.{'\n'}
            5. Access: Client must provide necessary access to the property.{'\n'}
            6. Utilities: Working electricity and water must be available on-site.{'\n'}
            7. Quote Validity: This quote is valid for 30 days from the date issued.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Acceptance</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Client Signature</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Provider</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 50, alignItems: 'center' }}>
          <Text style={{ fontSize: 10, textAlign: 'center', marginBottom: 5 }}>
            Thank you for your business! | {companyInfo.name} | {companyInfo.phone} | {companyInfo.email}
          </Text>
          <Text style={{ fontSize: 9, textAlign: 'center', fontStyle: 'italic', color: '#666666' }}>
            All prices include our standard supplies, equipment, labor, and service fees for professional-grade cleaning.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDF;
