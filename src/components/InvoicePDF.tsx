import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { SCOPE_OF_WORK } from '@/lib/constants';

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
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
    width: 150,
    height: 75,
    marginRight: 12,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 10,
  },
  invoiceDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoColumn: {
    width: '50%',
    paddingRight: 15,
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
    padding: 8,
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
    bottom: 30,
    left: 30,
    right: 30,
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
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({
  estimateData,
  formData,
  companyInfo,
  quoteInfo,
  invoiceInfo,
}) => {
  const logoPath = '/assets/logo.png';

  // Get cleaning type display
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
      case 'pressure_washing':
        return 'Pressure Washing Services';
      default:
        return type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  // Get scope of work based on project type and split into array
  const scopeOfWorkText = SCOPE_OF_WORK[formData.projectType] || '';
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
                <Text style={styles.companyDetails}>{companyInfo.address}, Ste. 203</Text>
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
            <Text style={styles.infoValue}>{companyInfo.name}</Text>
            <Text style={styles.infoValue}>{companyInfo.address}, Ste. 203</Text>
            <Text style={styles.infoValue}>{companyInfo.city}</Text>
            <Text style={styles.infoValue}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.infoValue}>Email: {companyInfo.email}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Project Location</Text>
            <Text style={styles.infoValue}>{quoteInfo.projectName}</Text>
            <Text style={styles.infoValue}>{quoteInfo.projectAddress}</Text>
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

            {/* Main Cleaning Service */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text>{getCleaningTypeDisplay(formData.cleaningType)} - {formData.squareFootage.toLocaleString()} sq ft</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{formatCurrency(
                  (estimateData.basePrice + 
                  (estimateData.vctCost || 0) +
                  (estimateData.travelCost || 0)) * 1.30
                )}</Text>
              </View>
            </View>

            {/* Window Cleaning Services */}
            {formData.needsWindowCleaning && formData.numberOfWindows > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text>Window Cleaning Services</Text>
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatCurrency((estimateData.windowCleaningCost || 0) * 1.30)}</Text>
                </View>
              </View>
            )}

            {/* Overnight Accommodations */}
            {formData.stayingOvernight && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text>Overnight Accommodations</Text>
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatCurrency((estimateData.overnightCost || 0) * 1.30)}</Text>
                </View>
              </View>
            )}

            {/* Pressure Washing Services */}
            {formData.needsPressureWashing && formData.pressureWashingArea > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text>Pressure Washing Services</Text>
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatCurrency((estimateData.pressureWashingCost || 0) * 1.30)}</Text>
                </View>
              </View>
            )}

            {/* Display Case Cleaning */}
            {formData.projectType === 'jewelry_store' && formData.numberOfDisplayCases > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.descriptionCell]}>
                  <Text>Display Case Cleaning</Text>
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatCurrency((estimateData.displayCaseCost || 0) * 1.30)}</Text>
                </View>
              </View>
            )}

            {/* Subtotal */}
            <View style={[styles.tableRow, { borderTop: '1px solid #ddd', marginTop: 10 }]}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={{ fontWeight: 'bold' }}>Subtotal</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency(estimateData.totalBeforeMarkup * 1.30)}</Text>
              </View>
            </View>

            {/* Sales Tax */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={{ fontWeight: 'bold' }}>Sales Tax (7%)</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency((estimateData.totalBeforeMarkup * 1.30) * 0.07)}</Text>
              </View>
            </View>

            {/* Total */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>TOTAL</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{formatCurrency((estimateData.totalBeforeMarkup * 1.30) * 1.07)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Information Section */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={{ width: '100%' }}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <Text>Please make checks payable to: {companyInfo.name}</Text>
            <Text style={{ marginTop: 5 }}>{companyInfo.address}, Ste 203</Text>
            <Text>{companyInfo.city}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={{ marginTop: 10 }}>For questions regarding this invoice:</Text>
          <Text>{companyInfo.email}</Text>
          <Text>{companyInfo.phone}</Text>
        </View>

        {/* Balance Due Box */}
        <View style={{
          position: 'absolute',
          bottom: 40,
          right: 0,
          backgroundColor: '#f0f0f0',
          padding: 10,
          width: 200,
          borderRadius: 5,
          border: '1px solid #d0d0d0'
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Balance Due:</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 5 }}>{formatCurrency((estimateData.totalBeforeMarkup * 1.30) * 1.07)}</Text>
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