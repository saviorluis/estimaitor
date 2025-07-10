import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
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
    padding: 8,
    fontSize: 10,
  },
  descriptionCell: {
    width: '40%',
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
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    bottom: 100,
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
  const total = estimateData.basePrice;
  
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Image src="/assets/logo.png" style={styles.logo} />
              </View>
            </View>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>{companyInfo.city}</Text>
            <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
            <Text style={styles.companyDetails}>Website: {companyInfo.website}</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetails}>Invoice #: {invoiceInfo.invoiceNumber}</Text>
            <Text style={styles.invoiceDetails}>Date: {invoiceInfo.date}</Text>
            <Text style={styles.invoiceDetails}>Due Date: {invoiceInfo.dueDate}</Text>
            <Text style={styles.invoiceDetails}>Terms: {invoiceInfo.paymentTerms}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoValue}>{quoteInfo.projectName}</Text>
              <Text style={styles.infoValue}>{quoteInfo.projectAddress}</Text>
              <Text style={styles.infoValue}>Quote Reference: #{quoteInfo.quoteNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.descriptionCell}>
                <Text style={styles.tableCell}>Description</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              <View style={styles.rateCell}>
                <Text style={styles.tableCell}>Rate</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.descriptionCell}>
                <Text style={styles.tableCell}>Professional Cleaning Services</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text style={styles.tableCell}>1</Text>
              </View>
              <View style={styles.rateCell}>
                <Text style={styles.tableCell}>{formatCurrency(total)}</Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={styles.tableCell}>{formatCurrency(total)}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.subtotalRow]}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, styles.bold]}>Subtotal</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={styles.rateCell}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, styles.bold]}>{formatCurrency(total)}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={styles.descriptionCell}>
                <Text style={[styles.tableCell, styles.bold]}>Total</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={styles.rateCell}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={styles.amountCell}>
                <Text style={[styles.tableCell, styles.bold]}>{formatCurrency(total)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Instructions</Text>
          <Text style={styles.paymentPreferred}>Preferred Payment Method: Check by Mail</Text>
          <Text style={styles.paymentDetails}>Please make checks payable to: {companyInfo.name}</Text>
          <Text style={styles.paymentDetails}>Mail to: {companyInfo.address}, {companyInfo.city}</Text>
          <Text style={styles.paymentDetails}>Include invoice number ({invoiceInfo.invoiceNumber}) with payment</Text>
          <Text style={styles.paymentDetails}>Payment Terms: {invoiceInfo.paymentTerms}</Text>
        </View>

        <View style={styles.balanceDueBox}>
          <Text style={styles.balanceDueText}>BALANCE DUE</Text>
          <Text style={styles.balanceDueAmount}>{formatCurrency(total)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>{companyInfo.name} | {companyInfo.address}, {companyInfo.city} | {companyInfo.phone}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 