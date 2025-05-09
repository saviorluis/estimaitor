import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Rect, G, Path } from '@react-pdf/renderer';
import { EstimateData, FormData, PressureWashingServiceType } from '@/lib/types';
import { formatCurrency, getQuoteCounter } from '@/lib/utils';
import { PROJECT_SCOPES, PRESSURE_WASHING_RATES, PRESSURE_WASHING_PAYMENT_TERMS, SCOPE_OF_WORK, PRESSURE_WASHING_SCOPE_OF_WORK } from '@/lib/constants';

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
    width: 150,
    height: 75,
    marginRight: 12,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    objectPosition: 'left top'
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start'
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
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    fontSize: 10,
  },
  subRowContent: {
    width: '70%',
  },
});

// Get cleaning type display name
const getCleaningTypeDisplay = (type: string): string => {
  switch (type) {
    case 'rough':
      return 'Rough Clean';
    case 'final':
      return 'Final Clean';
    case 'rough_final':
      return 'Rough & Final Clean';
    case 'rough_final_touchup':
      return 'Rough, Final & Touch-up Clean';
    case 'pressure_washing_only':
      return 'Pressure Washing Services';
    case 'window_cleaning_only':
      return 'Window Cleaning Services';
    default:
      return type;
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
    case 'residential': return 'Residential';
    default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  }
};

// Add a safe formatter to prevent errors in the PDF generation
const formatValue = (value: string | number | undefined | null, defaultValue: string = ''): string => {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
};

// Calculate the total pressure washing area
const calculateTotalPressureWashingArea = (formData: FormData): number => {
  if (!formData.pressureWashingServices || !formData.pressureWashingServiceAreas) return 0;
  
  let totalArea = 0;
  formData.pressureWashingServices.forEach(service => {
    totalArea += formData.pressureWashingServiceAreas?.[service] || 0;
  });
  
  return totalArea;
};

// Add a new function to display pressure washing services
const renderPressureWashingServices = (
  formData: FormData, 
  estimateData: any, 
  styles: any
) => {
  const services = formData.pressureWashingServices || [];
  const serviceAreas = formData.pressureWashingServiceAreas || {};
  const serviceDetails = estimateData.pressureWashingServiceDetails || {};
  
  // For pressure washing only quotes, we want to specifically format differently
  const isPressureWashingOnly = formData.cleaningType === 'pressure_washing_only';
  
  if (services.length === 0) {
    // Traditional pressure washing display
    return (
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, styles.descriptionCell]}>
          <Text style={styles.bold}>{isPressureWashingOnly ? 'Exterior Pressure Washing Services' : 'Pressure Washing Services'}</Text>
          <Text>{(formData.pressureWashingArea || 0).toLocaleString()} sq ft of exterior/concrete surfaces</Text>
          <Text style={{fontSize: 9, marginTop: 3}}>
            Service includes professional-grade equipment, cleaning solutions, and labor.
          </Text>
          <Text style={{fontSize: 9, marginTop: 2}}>
            Standard rates applied:
            {'\n'}• Soft Wash: ${PRESSURE_WASHING_RATES.SOFT_WASH.rate}/sq ft
            {'\n'}• Commercial: ${PRESSURE_WASHING_RATES.COMMERCIAL.rate}/sq ft
            {'\n'}• Driveway: ${PRESSURE_WASHING_RATES.DRIVEWAY.rate}/sq ft
          </Text>
          {isPressureWashingOnly && formData.distanceFromOffice <= 100 && formData.distanceFromOffice > 0 && (
            <Text style={{fontSize: 8, marginTop: 3, fontStyle: 'italic', color: '#666666'}}>
              Note: Price includes travel ({formData.distanceFromOffice} miles)
            </Text>
          )}
          <Text style={{fontSize: 9, marginTop: 5, fontStyle: 'italic'}}>
            Scope of Work: Professional pressure washing of exterior surfaces with appropriate cleaning solutions, removal of dirt, algae, mildew, and light staining.
          </Text>
          <Text style={{fontSize: 9, marginTop: 3, fontStyle: 'italic'}}>
            Payment Terms: {formData.projectType === 'warehouse' ? PRESSURE_WASHING_PAYMENT_TERMS.INDUSTRIAL : 
              ['restaurant', 'medical', 'office', 'retail', 'educational', 'hotel', 'jewelry_store'].includes(formData.projectType) ? PRESSURE_WASHING_PAYMENT_TERMS.COMMERCIAL : 
              PRESSURE_WASHING_PAYMENT_TERMS.RESIDENTIAL}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.amountCell]}>
          <Text>{formatCurrency(
            isPressureWashingOnly ? 
              estimateData.basePrice : 
              (estimateData.adjustedLineItems?.pressureWashingCost !== undefined 
                ? estimateData.adjustedLineItems.pressureWashingCost 
                : estimateData.pressureWashingCost)
          )}</Text>
        </View>
      </View>
    );
  }
  
  // Detailed pressure washing services display
  return (
    <>
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, styles.descriptionCell]}>
          <Text style={styles.bold}>{isPressureWashingOnly ? 'Exterior Pressure Washing Services' : 'Pressure Washing Services'}</Text>
          <Text>{isPressureWashingOnly ? 'Comprehensive exterior cleaning for the following surfaces:' : 'Professional exterior cleaning services for the following areas:'}</Text>
          <Text style={{fontSize: 8, marginTop: 3, color: '#444444'}}>
            Total area: {calculateTotalPressureWashingArea(formData).toLocaleString()} sq ft
          </Text>
          {isPressureWashingOnly && formData.distanceFromOffice <= 100 && formData.distanceFromOffice > 0 && (
            <Text style={{fontSize: 8, marginTop: 3, fontStyle: 'italic', color: '#666666'}}>
              Note: Price includes travel ({formData.distanceFromOffice} miles)
            </Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.amountCell]}>
          <Text>{isPressureWashingOnly ? 
            formatCurrency(estimateData.basePrice) : 
            formatCurrency(
              estimateData.adjustedLineItems?.pressureWashingCost !== undefined 
                ? estimateData.adjustedLineItems.pressureWashingCost 
                : estimateData.pressureWashingCost
            )}
          </Text>
          {isPressureWashingOnly && (
            <Text style={{fontSize: 8, marginTop: 3, color: '#666666'}}>
              {services.length > 1 ? '(See breakdown below)' : ''}
            </Text>
          )}
        </View>
      </View>
      
      {/* Individual pressure washing services */}
      {services.map((service: PressureWashingServiceType) => {
        const area = serviceAreas[service] || 0;
        const details = serviceDetails[service] || { area: 0, cost: 0 };
        
        if (area <= 0) return null;
        
        // Service-specific scope content
        let serviceDescription = '';
        let serviceRate = '';
        
        switch(service) {
          case 'soft_wash':
            serviceDescription = 'Soft Wash (House/Building)';
            serviceRate = `$${PRESSURE_WASHING_RATES.SOFT_WASH.rate}/sq ft`;
            break;
          case 'roof_wash':
            serviceDescription = 'Roof Washing';
            serviceRate = `$${PRESSURE_WASHING_RATES.ROOF_WASH.rate}/sq ft`;
            break;
          case 'driveway':
            serviceDescription = 'Driveway Cleaning';
            serviceRate = `$${PRESSURE_WASHING_RATES.DRIVEWAY.rate}/sq ft`;
            break;
          case 'deck':
            serviceDescription = 'Wooden Deck Cleaning';
            serviceRate = `$${PRESSURE_WASHING_RATES.DECK.rate}/sq ft`;
            break;
          case 'trex_deck':
            serviceDescription = 'Trex/Composite Deck Cleaning';
            serviceRate = `$${PRESSURE_WASHING_RATES.TREX.rate}/sq ft`;
            break;
          case 'dumpster_corral':
            serviceDescription = 'Dumpster Corral Cleaning';
            serviceRate = `$${PRESSURE_WASHING_RATES.DUMPSTER_CORRAL.rate}/sq ft`;
            break;
          case 'commercial':
            serviceDescription = 'Commercial Surface Cleaning';
            serviceRate = `$${PRESSURE_WASHING_RATES.COMMERCIAL.rate}/sq ft`;
            break;
          default:
            serviceDescription = 'Custom Pressure Washing Service';
            serviceRate = `Daily rate: $${PRESSURE_WASHING_RATES.DAILY_RATE}`;
        }
        
        // Get scope of work for this service
        const scopeKey = service.toUpperCase() as keyof typeof PRESSURE_WASHING_SCOPE_OF_WORK;
        const scopeOfWork = PRESSURE_WASHING_SCOPE_OF_WORK[scopeKey] || '';
        
        return (
          <View style={styles.subRow} key={service}>
            <View style={styles.subRowContent}>
              <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 2}}>{serviceDescription}</Text>
              <Text style={{fontSize: 9}}>{area.toLocaleString()} sq ft @ {serviceRate}</Text>
              <Text style={{fontSize: 8, marginTop: 3, color: '#666666'}}>{scopeOfWork.split('\n')[0]}</Text>
              
              {/* Display full scope of work in collapsible section */}
              <View style={{marginTop: 3, paddingLeft: 4}}>
                {scopeOfWork.split('\n').slice(1).map((line, index) => (
                  <Text key={index} style={{fontSize: 7, color: '#666666', marginBottom: 1}}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
            {/* Only show service cost in detailed view for pressure_washing_only type */}
            {isPressureWashingOnly && (
              <Text style={{fontSize: 9, textAlign: 'right'}}>{formatCurrency(details.cost)}</Text>
            )}
          </View>
        );
      })}
      
      {/* Add equipment rental note */}
      {isPressureWashingOnly && (
        <View style={{marginTop: 8, marginBottom: 4, marginLeft: 6}}>
          <Text style={{fontSize: 8, fontStyle: 'italic', color: '#444444'}}>
            Note: Price includes all necessary equipment rental and cleaning supplies.
            {formData.distanceFromOffice > 0 && ` Travel (${formData.distanceFromOffice} miles) ${formData.distanceFromOffice <= 100 ? 'is included in the price.' : 'is charged separately.'}`}
          </Text>
        </View>
      )}
      
      <Text style={{fontSize: 9, marginTop: 5, marginLeft: 10, fontStyle: 'italic'}}>
        Payment Terms: {formData.projectType === 'warehouse' ? PRESSURE_WASHING_PAYMENT_TERMS.INDUSTRIAL : 
          ['restaurant', 'medical', 'office', 'retail', 'educational', 'hotel', 'jewelry_store'].includes(formData.projectType) ? PRESSURE_WASHING_PAYMENT_TERMS.COMMERCIAL : 
          PRESSURE_WASHING_PAYMENT_TERMS.RESIDENTIAL}
      </Text>
    </>
  );
};

// Add a function to render window cleaning services for window_cleaning_only option
const renderWindowCleaningServices = (
  formData: FormData,
  estimateData: any,
  styles: any
) => {
  const isWindowCleaningOnly = formData.cleaningType === 'window_cleaning_only';
  
  return (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, styles.descriptionCell]}>
        <Text style={styles.bold}>{isWindowCleaningOnly ? 'Professional Window Cleaning Services' : 'Window Cleaning Services'}</Text>
        <Text>{(formData.numberOfWindows || 0)} standard windows, {(formData.numberOfLargeWindows || 0)} {formData.projectType === 'yoga_studio' ? 'mirrors/large windows' : formData.projectType === 'kids_fitness' ? 'wall mirrors/large windows' : 'large windows'}, {(formData.numberOfHighAccessWindows || 0)} high-access windows</Text>
        <Text>Includes all necessary equipment, cleaning solutions, and labor</Text>
        {(formData.projectType === 'yoga_studio' || formData.projectType === 'kids_fitness') && (
          <Text style={{fontSize: 9, marginTop: 3}}>Note: For {formData.projectType === 'yoga_studio' ? 'yoga studios' : 'children\'s fitness centers'}, large windows category includes studio wall mirrors</Text>
        )}
        {isWindowCleaningOnly && formData.distanceFromOffice <= 100 && formData.distanceFromOffice > 0 && (
          <Text style={{fontSize: 8, marginTop: 3, fontStyle: 'italic', color: '#666666'}}>
            Note: Price includes travel ({formData.distanceFromOffice} miles)
          </Text>
        )}
        {!formData.chargeForWindowCleaning && !isWindowCleaningOnly && (
          <Text style={{fontStyle: 'italic', color: '#666666'}}>Window cleaning will be quoted separately</Text>
        )}
      </View>
      <View style={[styles.tableCell, styles.amountCell]}>
        <Text>{isWindowCleaningOnly ? 
          formatCurrency(estimateData.basePrice) : 
          (formData.chargeForWindowCleaning ? 
            formatCurrency(
              estimateData.adjustedLineItems?.windowCleaningCost !== undefined
                ? estimateData.adjustedLineItems.windowCleaningCost
                : estimateData.windowCleaningCost
            ) : 'Separate Quote'
          )
        }</Text>
      </View>
    </View>
  );
};

// Add a helper for the cover page title
const getCoverPageTitle = (cleaningType: string): string => {
  switch (cleaningType) {
    case 'pressure_washing_only':
      return 'PRESSURE WASHING SERVICES';
    case 'window_cleaning_only':
      return 'WINDOW CLEANING SERVICES';
    default:
      return 'POST CONSTRUCTION CLEANING';
  }
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
  showCoverPage?: boolean;
}

const QuotePDF: React.FC<QuotePDFProps> = ({ 
  estimateData, 
  formData, 
  companyInfo, 
  clientInfo, 
  quoteInfo,
  showCoverPage = false
}) => {
  console.log('QuotePDF - Received adjustedLineItems:', estimateData.adjustedLineItems);
  console.log('QuotePDF - Received estimateData:', estimateData);
  
  // Get the current quote counter value
  const quoteCounter = getQuoteCounter();
  
  // Use a static path in the assets directory
  const logoPath = '/assets/logo.png';  // This will always look in the public/assets directory
  const coverPagePath = '/assets/cover-page-placeholder.jpg'; // Placeholder for the cover page
  const capabilityStatementPath = '/BBPS Capability copy.png'; // Capability statement image
  
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

  // Calculate totals for display in PDF
  const adjustedLineItems = estimateData.adjustedLineItems || {};
  const subtotal = Object.keys(adjustedLineItems).length > 0 
    ? Object.values(adjustedLineItems).reduce((sum, price) => sum + price, 0)
    : estimateData.totalBeforeMarkup;
  
  console.log('QuotePDF - Calculated subtotal:', subtotal);
  console.log('QuotePDF - Using adjustedLineItems?', Object.keys(adjustedLineItems).length > 0);
  
  const salesTax = subtotal * 0.07;
  const total = subtotal + salesTax;
  
  console.log('QuotePDF - Final values - Subtotal:', subtotal, 'Tax:', salesTax, 'Total:', total);

  return (
    <Document>
      {/* First Cover Page - Proposal Details */}
      {showCoverPage && (
        <Page size="A4" style={styles.page}>
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
          }}>
            {/* Company Logo - Large size for cover */}
            <View style={{
              width: 350,
              height: 175,
              marginBottom: 40,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image src={logoPath} style={{
                width: '100%',
                objectFit: 'contain'
              }} />
            </View>
            
            {/* Cover Title */}
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              marginBottom: 24,
              color: '#2563eb',
              textAlign: 'center'
            }}>
              {getCoverPageTitle(formData.cleaningType)}
            </Text>
            
            <Text style={{
              fontSize: 26,
              fontWeight: 'bold',
              marginBottom: 24,
              color: '#2563eb',
              textAlign: 'center'
            }}>
              PROPOSAL
            </Text>
            
            <Text style={{
              fontSize: 18,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Prepared for:
            </Text>
            
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              marginBottom: 40,
              textAlign: 'center'
            }}>
              {safeClientInfo.company || safeClientInfo.name}
            </Text>
            
            {/* Project information */}
            <View style={{
              padding: 20,
              backgroundColor: '#f0f9ff',
              borderRadius: 5,
              marginBottom: 40,
              width: '80%',
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 14,
                marginBottom: 8,
                textAlign: 'center'
              }}>
                Project: {safeQuoteInfo.projectName}
              </Text>
              <Text style={{
                fontSize: 14,
                marginBottom: 8,
                textAlign: 'center'
              }}>
                Location: {safeQuoteInfo.projectAddress}
              </Text>
              <Text style={{
                fontSize: 14,
                textAlign: 'center'
              }}>
                Quote #: {safeQuoteInfo.quoteNumber}
              </Text>
            </View>
            
            {/* Contact Information */}
            <View style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              textAlign: 'center'
            }}>
              <Text style={{
                fontSize: 12,
                color: '#333333',
                fontWeight: 'bold',
                marginBottom: 8
              }}>
                {safeCompanyInfo.name}
              </Text>
              <Text style={{
                fontSize: 10,
                color: '#666666'
              }}>
                {safeCompanyInfo.phone} | {safeCompanyInfo.email}
              </Text>
              <Text style={{
                fontSize: 10,
                color: '#666666'
              }}>
                {safeCompanyInfo.address}, {safeCompanyInfo.city}
              </Text>
              <Text style={{
                fontSize: 10,
                color: '#666666',
                marginTop: 4
              }}>
                {safeCompanyInfo.website}
              </Text>
            </View>
          </View>
        </Page>
      )}

      {/* Second Cover Page - Capability Statement */}
      {showCoverPage && (
        <Page size="A4" style={styles.page}>
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            position: 'relative'
          }}>
            {/* Full-page capability statement image */}
            <Image 
              src={capabilityStatementPath} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }} 
            />
          </View>
        </Page>
      )}

      {/* Main Quote Page (existing page) */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Image src={logoPath} style={styles.logo} />
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
            {formData.cleaningType === 'pressure_washing_only' ? (
              <>
                <Text style={styles.infoValue}>Service Type: {getCleaningTypeDisplay(formData.cleaningType)}</Text>
                {formData.pressureWashingServices && formData.pressureWashingServices.length > 0 ? (
                  <Text style={styles.infoValue}>Total Area: {calculateTotalPressureWashingArea(formData).toLocaleString()} sq ft</Text>
                ) : (
                  <Text style={styles.infoValue}>Area: {(formData.pressureWashingArea || 0).toLocaleString()} sq ft</Text>
                )}
              </>
            ) : formData.cleaningType === 'window_cleaning_only' ? (
              <>
                <Text style={styles.infoValue}>Service Type: {getCleaningTypeDisplay(formData.cleaningType)}</Text>
                <Text style={styles.infoValue}>Windows: {(formData.numberOfWindows || 0)} standard, {(formData.numberOfLargeWindows || 0)} large, {(formData.numberOfHighAccessWindows || 0)} high-access</Text>
              </>
            ) : (
              <>
                <Text style={styles.infoValue}>Square Footage: {(formData.squareFootage || 0).toLocaleString()} sq ft</Text>
                <Text style={styles.infoValue}>Cleaning Type: {getCleaningTypeDisplay(formData.cleaningType)}</Text>
              </>
            )}
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
          {formData.cleaningType !== 'pressure_washing_only' && (
            <>
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text style={styles.bold}>{getCleaningTypeDisplay(formData.cleaningType)} - {(formData.squareFootage || 0).toLocaleString()} sq ft</Text>
                  <Text style={{fontSize: 9, marginTop: 5}}>
                    {PROJECT_SCOPES[formData.projectType]?.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`) || `Final Cleaning of ${(formData.squareFootage || 0).toLocaleString()} Sq Ft includes standard cleaning services`}
                  </Text>
                  {formData.distanceFromOffice <= 100 && formData.distanceFromOffice > 0 && (
                    <Text style={{fontSize: 8, marginTop: 3, fontStyle: 'italic', color: '#666666'}}>
                      Note: Price includes travel ({formData.distanceFromOffice} miles)
                    </Text>
                  )}
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatCurrency(
                    estimateData.adjustedLineItems?.basePrice !== undefined 
                      ? estimateData.adjustedLineItems.basePrice 
                      : estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier
                  )}</Text>
                </View>
              </View>
              {/* Special room/area breakdown for church quotes */}
              {formData.projectType === 'church' && (
                <View style={{padding: 8, paddingLeft: 18, paddingBottom: 0}}>
                  <Text style={{fontSize: 9, fontWeight: 'bold', marginBottom: 2}}>Areas Included:</Text>
                  <Text style={{fontSize: 9}}>• Green Room</Text>
                  <Text style={{fontSize: 9}}>• Religious Ed (6 split by age group: 4th, 5th, 3rd grade, 2nd grade, 2 nurseries, K-1)</Text>
                  <Text style={{fontSize: 9}}>• Auditorium</Text>
                  <Text style={{fontSize: 9}}>• Platform</Text>
                  <Text style={{fontSize: 9}}>• Storage (5)</Text>
                  <Text style={{fontSize: 9}}>• Kitchen</Text>
                  <Text style={{fontSize: 9}}>• AV Control Room</Text>
                  <Text style={{fontSize: 9}}>• Cafe</Text>
                  <Text style={{fontSize: 9}}>• Restrooms (4)</Text>
                  <Text style={{fontSize: 9}}>• 2 Assembly Areas</Text>
                  <Text style={{fontSize: 9}}>• Broadcast</Text>
                  <Text style={{fontSize: 9}}>• 4 Offices</Text>
                </View>
              )}
            </>
          )}

          {/* VCT Flooring if applicable */}
          {formData.hasVCT && formData.cleaningType !== 'pressure_washing_only' && (
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
          {(formData.needsPressureWashing || formData.cleaningType === 'pressure_washing_only') && 
            renderPressureWashingServices(formData, estimateData, styles)
          }

          {/* Travel Expenses - only show for jobs over 100 miles */}
          {formData.distanceFromOffice > 100 && (
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
          )}

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
          {(formData.needsWindowCleaning || formData.cleaningType === 'window_cleaning_only') && 
            renderWindowCleaningServices(formData, estimateData, styles)
          }

          {/* Display case cleaning for jewelry stores */}
          {formData.projectType === 'jewelry_store' && estimateData.displayCaseCost > 0 && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.bold}>Display Case Cleaning</Text>
                <Text>{(formData.numberOfDisplayCases || 0)} display case{formData.numberOfDisplayCases !== 1 ? 's' : ''}</Text>
                <Text style={{fontSize: 9, marginTop: 3}}>
                  Professional interior and exterior cleaning with specialized glass cleaners
                </Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>Included</Text>
              </View>
            </View>
          )}

          {/* Subtotal - Use the adjusted subtotal that's calculated in handlePDFDownload */}
          <View style={[styles.row, styles.subtotalRow]}>
            <Text style={styles.subtotalText}>Subtotal</Text>
            <Text style={styles.subtotalText}>{formatCurrency(estimateData.totalBeforeMarkup)}</Text>
          </View>

          {/* Breakdown of all costs for debugging */}
          {formData.cleaningType === 'pressure_washing_only' && (
            <View style={{padding: 5, marginTop: 2, borderTop: '1pt solid #CCCCCC'}}>
              <Text style={{fontSize: 8, color: '#666666', fontStyle: 'italic'}}>
                Note: All pressure washing services, equipment, and travel costs are included in the total price.
              </Text>
            </View>
          )}

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

        {/* Project Timeline */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Project Timeline</Text>
            {formData.cleaningType === 'rough_final_touchup' ? (
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
