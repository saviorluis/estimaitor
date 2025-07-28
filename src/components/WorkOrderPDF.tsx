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
  scopeOfWork: {
    marginTop: 10,
  },
  bulletPoint: {
    marginBottom: 8,
    paddingLeft: 15,
  },
  infoText: {
    marginBottom: 5,
    fontSize: 10,
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 15,
  },
  feesSection: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  feeItem: {
    marginBottom: 8,
    paddingLeft: 15,
  },
  feeTitle: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  feeDescription: {
    fontSize: 10,
    color: '#4b5563',
  },
  warningText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
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
  cleanerInfoSection: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
  },
  amountSection: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 4,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 20,
  },
  startDateField: {
    flex: 1,
    flexDirection: 'column',
  },
  dateLabel: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 5,
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
  workOrderInfo: {
    width: '50%',
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  workOrderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 5,
  },
  workOrderDetails: {
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
  cleanerInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
});

interface WorkOrderPDFProps {
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

const WorkOrderPDF: React.FC<WorkOrderPDFProps> = ({
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
  const totalWindows = (formData.numberOfWindows || 0) + (formData.numberOfLargeWindows || 0) + (formData.numberOfHighAccessWindows || 0);
  const scopeOfWork = scopeOfWorkText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace('• ', '').trim())
    .map(line => line.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} Sq Ft`))
    .map(line => line.replace('___PROJECT_NAME___', quoteInfo.projectName))
    .map(line => {
      if (line.includes('___WINDOW_COUNT___')) {
        return totalWindows > 0 ? line.replace('___WINDOW_COUNT___', totalWindows.toString()) : '';
      }
      return line;
    })
    .filter(line => line); // Remove empty lines

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
          <View style={styles.workOrderInfo}>
            <Text style={styles.workOrderTitle}>Work Order</Text>
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
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          <View style={styles.scopeOfWork}>
            {scopeOfWork.map((item: string, index: number) => (
              <Text key={index} style={styles.bulletPoint}>• {item}</Text>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Notes */}
        {quoteInfo.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.infoText}>{quoteInfo.notes}</Text>
          </View>
        )}

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountSection}>
            <View style={styles.amountField}>
              <Text style={styles.dollarSign}>$</Text>
              <View style={styles.handwrittenField} />
            </View>
            <View style={styles.startDateField}>
              <Text style={styles.dateLabel}>Start Date:</Text>
              <View style={styles.handwrittenField} />
            </View>
          </View>
        </View>

        {/* Fees Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Fee Information</Text>
          <View style={styles.feesSection}>
            {/* Late Arrival Fee */}
            <View style={styles.feeItem}>
              <Text style={styles.feeTitle}>Late Arrival Fee</Text>
              <Text style={styles.feeDescription}>
                • If crew arrives more than 30 minutes late to the jobsite: $75/hour deduction from total invoice
              </Text>
              <Text style={styles.feeDescription}>
                • If crew arrives more than 1 hour late: $100/hour deduction from total invoice
              </Text>
              <Text style={styles.warningText}>
                Note: Crew must notify supervisor immediately of any potential delays
              </Text>
            </View>

            {/* Involvement Fee */}
            <View style={styles.feeItem}>
              <Text style={styles.feeTitle}>Supervisor Involvement Fee</Text>
              <Text style={styles.feeDescription}>
                • If supervisor's presence is required on-site due to crew performance issues: $150/hour charge to responsible crew members
              </Text>
              <Text style={styles.feeDescription}>
                • This fee covers travel time and on-site supervision time
              </Text>
              <Text style={styles.warningText}>
                Note: This fee will be deducted from crew payment if supervisor intervention is necessary
              </Text>
            </View>

            {/* Materials Fee */}
            <View style={styles.feeItem}>
              <Text style={styles.feeTitle}>Materials Fee</Text>
              <Text style={styles.feeDescription}>
                • Additional charges will apply if supervisor needs to provide cleaning materials or equipment
              </Text>
              <Text style={styles.feeDescription}>
                • Material fees are determined case by case based on type and quantity needed
              </Text>
              <Text style={styles.warningText}>
                Note: Material fees will be discussed and agreed upon before the start of work
              </Text>
            </View>

            {/* Overnight Accommodations - Only show if staying overnight */}
            {formData.stayingOvernight && (
              <View style={styles.feeItem}>
                <Text style={styles.feeTitle}>Overnight Accommodations & Payment</Text>
                <Text style={styles.feeDescription}>
                  • Hotel accommodations provided: 2 cleaners per room arrangement
                </Text>
                <Text style={styles.feeDescription}>
                  • Per diem allowance: $90 per person per day (covers meals and incidentals)
                </Text>
                <Text style={styles.feeDescription}>
                  • Per diem is paid upfront before travel departure
                </Text>
                <Text style={styles.feeDescription}>
                  • Hotel bills are paid directly by company - no out-of-pocket expenses for crew
                </Text>
                <Text style={styles.feeDescription}>
                  • Overnight duration: {formData.numberOfNights} night(s) for {formData.numberOfCleaners} crew member(s)
                </Text>
                <Text style={styles.warningText}>
                  Note: Per diem is for approved business expenses only. Receipts may be required for reimbursement verification.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>Supervisor</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature</Text>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Date:</Text>
              <View style={styles.handwrittenField} />
            </View>
          </View>
          
          <View style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>Cleaner</Text>
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

export default WorkOrderPDF; 