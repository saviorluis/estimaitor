import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import { SCOPE_OF_WORK } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 75,
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
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 15,
  }
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
    quoteNumber: string;
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
  const scopeOfWork = scopeOfWorkText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace('• ', '').trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image src={logoPath} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>WORK ORDER</Text>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.projectInfo}>
            <Text style={styles.infoText}>Work Order #: {quoteInfo.quoteNumber}</Text>
            <Text style={styles.infoText}>Date: {formatDate(new Date())}</Text>
            <Text style={styles.infoText}>Project Name: {quoteInfo.projectName}</Text>
            <Text style={styles.infoText}>Location: {quoteInfo.projectAddress}</Text>
            <Text style={styles.infoText}>Project Type: {formData.projectType.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          <View style={styles.scopeOfWork}>
            {scopeOfWork.map((item: string, index: number) => (
              <View key={index} style={styles.bulletPoint}>
                <Text>• {item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notes */}
        {quoteInfo.notes && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text>{quoteInfo.notes}</Text>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

export default WorkOrderPDF; 