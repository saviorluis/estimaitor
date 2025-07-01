import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Rect, G, Path } from '@react-pdf/renderer';
import { EstimateData, FormData, PressureWashingServiceType, CompanyInfo } from '@/lib/types';
import { formatCurrency, getQuoteCounter } from '@/lib/utils';
import { PROJECT_SCOPES, PRESSURE_WASHING_RATES, PRESSURE_WASHING_PAYMENT_TERMS, SCOPE_OF_WORK, PRESSURE_WASHING_SCOPE_OF_WORK } from '@/lib/constants';
import { fonts } from '@/lib/fonts';

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 10,
  },
  signatureBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
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
    case 'light_touchup':
      return 'Light Touch-up Clean';
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

type DocumentType = 'QUOTE' | 'WORK_ORDER' | 'PURCHASE_ORDER' | 'CHANGE_ORDER' | 'INVOICE';

interface QuotePDFProps {
  estimateData: EstimateData;
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
  documentType?: DocumentType;
}

const getDocumentTitle = (type: DocumentType = 'QUOTE'): string => {
  switch (type) {
    case 'WORK_ORDER':
      return 'WORK ORDER';
    case 'PURCHASE_ORDER':
      return 'PURCHASE ORDER';
    case 'CHANGE_ORDER':
      return 'CHANGE ORDER';
    case 'INVOICE':
      return 'INVOICE';
    default:
      return 'QUOTE';
  }
};

const shouldShowPricing = (type: DocumentType = 'QUOTE'): boolean => {
  switch (type) {
    case 'WORK_ORDER':
    case 'PURCHASE_ORDER':
      return false;
    case 'QUOTE':
    case 'CHANGE_ORDER':
    case 'INVOICE':
      return true;
    default:
      return true;
  }
};

const getDocumentNotes = (
  type: DocumentType = 'QUOTE',
  defaultNotes: string,
  companyInfo: CompanyInfo
): string => {
  switch (type) {
    case 'WORK_ORDER':
      return 'This work order outlines the scope of work to be performed. No pricing information is included as this document is for operational purposes only.';
    case 'PURCHASE_ORDER':
      return 'This purchase order confirms the agreement to perform the specified scope of work. Please refer to the original quote for pricing details.';
    case 'INVOICE':
      return `${defaultNotes}\n\nPayment Information:\nCheck is the preferred method of payment.\nPlease make checks payable to: ${companyInfo.name}\nMail to: ${companyInfo.address}, ${companyInfo.city}`;
    default:
      return defaultNotes;
  }
};

const getDocumentContent = (type: DocumentType = 'QUOTE'): {
  showPricing: boolean;
  showTeamSection: boolean;
  showCompletionSection: boolean;
  showPaymentInstructions: boolean;
} => {
  switch (type) {
    case 'WORK_ORDER':
      return {
        showPricing: false,
        showTeamSection: true,
        showCompletionSection: true,
        showPaymentInstructions: false
      };
    case 'PURCHASE_ORDER':
      return {
        showPricing: false,
        showTeamSection: false,
        showCompletionSection: false,
        showPaymentInstructions: false
      };
    case 'INVOICE':
      return {
        showPricing: true,
        showTeamSection: false,
        showCompletionSection: false,
        showPaymentInstructions: true
      };
    default:
      return {
        showPricing: true,
        showTeamSection: false,
        showCompletionSection: false,
        showPaymentInstructions: false
      };
  }
};

const renderLogo = (containerStyle: any = {}, imageStyle: any = {}, name: string) => {
  try {
    return (
      <View style={[styles.logoContainer, containerStyle]}>
        <Svg viewBox="0 0 200 100" style={[styles.logo, imageStyle]}>
          <G>
            <Path d="M0 8 H200 V92 H0 Z" fill="#2563eb" />
            <Text
              x="100"
              y="50"
              style={{
                fontFamily: 'Roboto',
                fontSize: 16,
                textAnchor: 'middle',
                fill: 'white'
              }}
            >
              {name}
            </Text>
          </G>
        </Svg>
      </View>
    );
  } catch (error) {
    console.error('Error rendering logo:', error);
    return (
      <View style={[styles.logoContainer, containerStyle]}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{name}</Text>
      </View>
    );
  }
};

const validatePDFData = (props: QuotePDFProps): void => {
  const { estimateData, formData, companyInfo, clientInfo, quoteInfo } = props;

  // Validate estimate data
  if (!estimateData) throw new Error('Estimate data is required for PDF generation');
  if (typeof estimateData.basePrice !== 'number') throw new Error('Base price is required for PDF generation');

  // Validate form data
  if (!formData) throw new Error('Form data is required for PDF generation');
  if (!formData.cleaningType) throw new Error('Cleaning type is required for PDF generation');
  if (!formData.projectType) throw new Error('Project type is required for PDF generation');
  if (!formData.squareFootage || formData.squareFootage <= 0) throw new Error('Please enter a valid square footage greater than 0');

  // Validate company info
  if (!companyInfo) throw new Error('Company information is required for PDF generation');
  if (!companyInfo.name) throw new Error('Company name is required for PDF generation');
  if (!companyInfo.address) throw new Error('Company address is required for PDF generation');
  if (!companyInfo.phone) throw new Error('Company phone is required for PDF generation');

  // Validate client info
  if (!clientInfo) throw new Error('Client information is required for PDF generation');
  if (!clientInfo.name) throw new Error('Client name is required for PDF generation');
  if (!clientInfo.company) throw new Error('Client company is required for PDF generation');
  if (!clientInfo.address) throw new Error('Client address is required for PDF generation');

  // Validate quote info
  if (!quoteInfo) throw new Error('Quote information is required for PDF generation');
  if (!quoteInfo.quoteNumber) throw new Error('Quote number is required for PDF generation');
  if (!quoteInfo.projectName) throw new Error('Project name is required for PDF generation');
  if (!quoteInfo.projectAddress) throw new Error('Project address is required for PDF generation');
};

const QuotePDF: React.FC<QuotePDFProps> = ({
  estimateData,
  formData,
  companyInfo,
  clientInfo,
  quoteInfo,
  showCoverPage = false,
  documentType = 'QUOTE'
}) => {
  try {
    // Validate all required data
    validatePDFData({ estimateData, formData, companyInfo, clientInfo, quoteInfo });

    // Get document content configuration
    const docContent = getDocumentContent(documentType);
    const docTitle = getDocumentTitle(documentType);
    const docNotes = getDocumentNotes(documentType, quoteInfo.notes, companyInfo);

    // Calculate totals
    const subtotal = estimateData.totalBeforeMarkup || 0;
    const salesTax = subtotal * 0.07;
    const total = subtotal + salesTax;

    return (
      <Document>
        {showCoverPage && (
          <Page size="LETTER" style={styles.page}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {renderLogo({ width: 300, height: 150 }, { maxWidth: 300, maxHeight: 150 }, companyInfo.name)}
              <Text style={[styles.title, { marginTop: 40, fontSize: 36, textAlign: 'center' }]}>
                {docTitle}
              </Text>
              <Text style={[styles.subtitle, { marginTop: 20, textAlign: 'center', borderBottom: 'none' }]}>
                {getCoverPageTitle(formData.cleaningType)}
              </Text>
              <Text style={{ fontSize: 14, marginTop: 40, textAlign: 'center' }}>
                Prepared for:
              </Text>
              <Text style={[styles.companyName, { marginTop: 10, textAlign: 'center' }]}>
                {clientInfo.company || clientInfo.name}
              </Text>
              <Text style={{ fontSize: 12, marginTop: 5, textAlign: 'center' }}>
                {quoteInfo.projectName}
              </Text>
              <Text style={{ fontSize: 12, marginTop: 5, textAlign: 'center' }}>
                {quoteInfo.projectAddress}
              </Text>
            </View>
          </Page>
        )}

        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.companyHeader}>
              {renderLogo({}, {}, companyInfo.name)}
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{companyInfo.name}</Text>
                <Text style={styles.companyDetails}>{companyInfo.address}</Text>
                <Text style={styles.companyDetails}>{companyInfo.city}</Text>
                <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
                <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
                {companyInfo.website && (
                  <Text style={styles.companyDetails}>Website: {companyInfo.website}</Text>
                )}
              </View>
            </View>

            <View style={styles.quoteInfo}>
              <Text style={styles.quoteTitle}>{docTitle}</Text>
              <Text style={styles.quoteDetails}>#{quoteInfo.quoteNumber}</Text>
              <Text style={styles.quoteDate}>Date: {quoteInfo.date}</Text>
              {documentType === 'QUOTE' && (
                <Text style={styles.quoteDetails}>Valid Until: {quoteInfo.validUntil}</Text>
              )}
            </View>
          </View>

          {/* Client Information */}
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.subtitle}>Client Information</Text>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{clientInfo.name}</Text>
              {clientInfo.company && (
                <>
                  <Text style={styles.infoLabel}>Company:</Text>
                  <Text style={styles.infoValue}>{clientInfo.company}</Text>
                </>
              )}
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{clientInfo.address}</Text>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{clientInfo.phone}</Text>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{clientInfo.email}</Text>
            </View>

            <View style={styles.infoColumn}>
              <Text style={styles.subtitle}>Project Information</Text>
              <Text style={styles.infoLabel}>Project Name:</Text>
              <Text style={styles.infoValue}>{quoteInfo.projectName}</Text>
              <Text style={styles.infoLabel}>Project Address:</Text>
              <Text style={styles.infoValue}>{quoteInfo.projectAddress}</Text>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>Services</Text>
            {formData.cleaningType === 'pressure_washing_only' && renderPressureWashingServices(formData, estimateData, styles)}
            {formData.cleaningType === 'window_cleaning_only' && renderWindowCleaningServices(formData, estimateData, styles)}
            {formData.needsPressureWashing && formData.needsWindowCleaning && (
              <>
                {renderPressureWashingServices(formData, estimateData, styles)}
                {renderWindowCleaningServices(formData, estimateData, styles)}
              </>
            )}
          </View>

          {/* Pricing Section - Only show if document type allows */}
          {docContent.showPricing && (
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.subtotalRow]}>
                  <View style={[styles.tableCell, styles.descriptionCell]}>
                    <Text style={styles.subtotalText}>Subtotal</Text>
                  </View>
                  <View style={[styles.tableCell, styles.amountCell]}>
                    <Text style={styles.subtotalText}>{formatCurrency(subtotal)}</Text>
                  </View>
                </View>
                <View style={[styles.tableRow, styles.subtotalRow]}>
                  <View style={[styles.tableCell, styles.descriptionCell]}>
                    <Text style={styles.subtotalText}>Tax (7%)</Text>
                  </View>
                  <View style={[styles.tableCell, styles.amountCell]}>
                    <Text style={styles.subtotalText}>{formatCurrency(salesTax)}</Text>
                  </View>
                </View>
                <View style={[styles.tableRow, styles.totalRow]}>
                  <View style={[styles.tableCell, styles.descriptionCell]}>
                    <Text style={styles.totalText}>Total</Text>
                  </View>
                  <View style={[styles.tableCell, styles.amountCell]}>
                    <Text style={styles.totalText}>{formatCurrency(total)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Notes Section */}
          {docNotes && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Notes</Text>
              <Text style={styles.notes}>{docNotes}</Text>
            </View>
          )}

          {/* Terms Section */}
          {quoteInfo.terms && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Terms & Conditions</Text>
              <Text style={styles.terms}>{quoteInfo.terms}</Text>
            </View>
          )}

          {/* Team Section - Only for Work Orders */}
          {docContent.showTeamSection && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Team Assignment</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={[styles.tableCell, { width: '40%' }]}>
                    <Text style={styles.bold}>Team Member</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '30%' }]}>
                    <Text style={styles.bold}>Role</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '30%' }]}>
                    <Text style={styles.bold}>Contact</Text>
                  </View>
                </View>
                {/* Add empty rows for manual team assignment */}
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '40%', height: 20 }]} />
                    <View style={[styles.tableCell, { width: '30%', height: 20 }]} />
                    <View style={[styles.tableCell, { width: '30%', height: 20 }]} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Completion Section - Only for Work Orders */}
          {docContent.showCompletionSection && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Completion Verification</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={[styles.tableCell, { width: '50%' }]}>
                    <Text style={styles.bold}>Task</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '25%' }]}>
                    <Text style={styles.bold}>Completed By</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '25%' }]}>
                    <Text style={styles.bold}>Date</Text>
                  </View>
                </View>
                {/* Add empty rows for completion tracking */}
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '50%', height: 20 }]} />
                    <View style={[styles.tableCell, { width: '25%', height: 20 }]} />
                    <View style={[styles.tableCell, { width: '25%', height: 20 }]} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Client Signature</Text>
              <Text style={styles.signatureLabel}>Date: _________________</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Company Representative</Text>
              <Text style={styles.signatureLabel}>Date: _________________</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>
              {companyInfo.name} | {companyInfo.address}, {companyInfo.city} | {companyInfo.phone} | {companyInfo.email}
            </Text>
          </View>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error('Error in QuotePDF component:', error);
    throw new Error(`Failed to generate PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default QuotePDF;
