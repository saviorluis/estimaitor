import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import { SCOPE_OF_WORK } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';

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
    marginBottom: 20,
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
  poInfo: {
    width: '50%',
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  poTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 5,
  },
  poDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2563eb',
    textAlign: 'center',
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
  projectInfo: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 5,
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 15,
  },
  handwrittenField: {
    borderBottom: '1pt solid #000',
    minWidth: 200,
    height: 18,
    marginVertical: 3,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 2,
  },
  amountSection: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 4,
  },
  dollarSign: {
    marginRight: 5,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottom: '1pt solid #000',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
  },
  dateField: {
    marginTop: 5,
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
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  scopeOfWork: {
    marginTop: 10,
  },
  bulletPoint: {
    marginBottom: 8,
    paddingLeft: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoColumn: {
    width: '50%',
  },
  cleanerInfo: {
    fontSize: 10,
    marginBottom: 3,
    color: '#4b5563',
  },
});

interface PurchaseOrderPDFProps {
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
    projectName: string;
    projectAddress: string;
    notes: string;
  };
}

const PurchaseOrderPDF: React.FC<PurchaseOrderPDFProps> = ({
  estimateData,
  formData,
  companyInfo,
  quoteInfo,
}) => {
  const logoPath = '/assets/logo.png';

  // Early return for undefined data
  if (!estimateData || !formData) {
    return null;
  }

  // Get scope of work based on project type and split into array
  const scopeOfWorkText = SCOPE_OF_WORK[formData.projectType] || '';
  const scopeOfWork = scopeOfWorkText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace('• ', '').trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          <View style={styles.poInfo}>
            <Text style={styles.poTitle}>Purchase Order</Text>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
          </View>
        </View>

        {/* Project and Cleaner Information Grid */}
        <View style={styles.infoGrid}>
          {/* Project Information */}
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <Text style={styles.infoText}>Project Name: {quoteInfo.projectName}</Text>
            <Text style={styles.infoText}>Location: {quoteInfo.projectAddress}</Text>
            <Text style={styles.infoText}>Project Type: {formData.projectType.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
          </View>

          {/* Cleaner Information */}
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Cleaner Information</Text>
            <Text style={styles.cleanerInfo}>Name: _____________________________</Text>
            <Text style={styles.cleanerInfo}>Phone: _____________________________</Text>
            <Text style={styles.cleanerInfo}>Email: _____________________________</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Description</Text>
          <View style={styles.scopeOfWork}>
            {scopeOfWork.map((item: string, index: number) => (
              <View key={index} style={styles.bulletPoint}>
                <Text>• {item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase Amount</Text>
          <View style={styles.amountSection}>
            <Text style={styles.dollarSign}>$</Text>
            <View style={styles.handwrittenField} />
          </View>
        </View>

        {/* Notes */}
        {quoteInfo.notes && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.infoText}>{quoteInfo.notes}</Text>
            </View>
          </>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>Owner Approval</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature</Text>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Date:</Text>
              <View style={styles.handwrittenField} />
            </View>
          </View>
          
          <View style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>Supervisor Approval</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature</Text>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Date:</Text>
              <View style={styles.handwrittenField} />
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

export default PurchaseOrderPDF; 