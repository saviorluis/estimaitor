import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { EstimateData, FormData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
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
  },
  totalRow: {
    backgroundColor: '#E6F0FF',
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
});

// Get cleaning type display name
const getCleaningTypeDisplay = (type: string): string => {
  switch (type) {
    case 'rough': return 'Rough Clean (First Stage)';
    case 'final': return 'Final Clean (Second Stage)';
    case 'powder_puff': return 'Powder Puff Clean (Third Stage)';
    case 'complete': return 'Complete Package (All Three Stages)';
    default: return type;
  }
};

// Get project type display name
const getProjectTypeDisplay = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

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
}

const QuotePDF: React.FC<QuotePDFProps> = ({ 
  estimateData, 
  formData, 
  companyInfo, 
  clientInfo, 
  quoteInfo 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyInfo.name}</Text>
          <Text style={styles.companyDetails}>{companyInfo.address}</Text>
          <Text style={styles.companyDetails}>{companyInfo.city}</Text>
          <Text style={styles.companyDetails}>{companyInfo.phone}</Text>
          <Text style={styles.companyDetails}>{companyInfo.email}</Text>
          <Text style={styles.companyDetails}>{companyInfo.website}</Text>
        </View>
        <View style={styles.quoteInfo}>
          <Text style={styles.quoteTitle}>QUOTE</Text>
          <Text style={styles.quoteDetails}>Quote #: {quoteInfo.quoteNumber}</Text>
          <Text style={styles.quoteDetails}>Date: {quoteInfo.date}</Text>
          <Text style={styles.quoteDetails}>Valid Until: {quoteInfo.validUntil}</Text>
        </View>
      </View>

      {/* Client and Project Information */}
      <View style={styles.infoGrid}>
        <View style={styles.infoColumn}>
          <Text style={styles.subtitle}>Client Information</Text>
          <Text style={styles.infoValue}>{clientInfo.name}</Text>
          <Text style={styles.infoValue}>{clientInfo.company}</Text>
          <Text style={styles.infoValue}>{clientInfo.address}</Text>
          <Text style={styles.infoValue}>{clientInfo.email}</Text>
          <Text style={styles.infoValue}>{clientInfo.phone}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.subtitle}>Project Information</Text>
          <Text style={styles.infoValue}>{quoteInfo.projectName}</Text>
          <Text style={styles.infoValue}>{quoteInfo.projectAddress}</Text>
          <Text style={styles.infoValue}>Project Type: {getProjectTypeDisplay(formData.projectType)}</Text>
          <Text style={styles.infoValue}>Square Footage: {formData.squareFootage.toLocaleString()} sq ft</Text>
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
            <Text style={styles.bold}>{getCleaningTypeDisplay(formData.cleaningType)} - {formData.squareFootage.toLocaleString()} sq ft</Text>
            <Text>Base Price: {formatCurrency(estimateData.basePrice)}</Text>
            <Text>Project Type Multiplier: {(estimateData.projectTypeMultiplier).toFixed(2)}x</Text>
            <Text>Cleaning Type Multiplier: {(estimateData.cleaningTypeMultiplier).toFixed(2)}x</Text>
          </View>
          <View style={[styles.tableCell, styles.amountCell]}>
            <Text>{formatCurrency(estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier)}</Text>
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
              <Text>{formatCurrency(estimateData.vctCost)}</Text>
            </View>
          </View>
        )}

        {/* Pressure Washing if applicable */}
        {formData.needsPressureWashing && (
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.descriptionCell]}>
              <Text style={styles.bold}>Pressure Washing Services</Text>
              <Text>{formData.pressureWashingArea.toLocaleString()} sq ft of exterior/concrete surfaces</Text>
              <Text>Includes equipment rental and materials</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>{formatCurrency(estimateData.pressureWashingCost)}</Text>
            </View>
          </View>
        )}

        {/* Travel Expenses */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.descriptionCell]}>
            <Text style={styles.bold}>Travel Expenses</Text>
            <Text>{formData.distanceFromOffice} miles at current gas price (${(formData.gasPrice || 0).toFixed(2)}/gallon)</Text>
          </View>
          <View style={[styles.tableCell, styles.amountCell]}>
            <Text>{formatCurrency(estimateData.travelCost)}</Text>
          </View>
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
              <Text>{formatCurrency(estimateData.overnightCost)}</Text>
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
                  ((estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier) +
                  estimateData.vctCost + estimateData.travelCost + estimateData.overnightCost + estimateData.pressureWashingCost) * 
                  (estimateData.urgencyMultiplier - 1)
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Subtotal */}
        <View style={[styles.tableRow, styles.subtotalRow]}>
          <View style={[styles.tableCell, styles.descriptionCell]}>
            <Text style={styles.bold}>Subtotal</Text>
          </View>
          <View style={[styles.tableCell, styles.amountCell]}>
            <Text style={styles.bold}>{formatCurrency(estimateData.totalBeforeMarkup)}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <View style={[styles.tableCell, styles.descriptionCell]}>
            <Text style={styles.bold}>TOTAL</Text>
          </View>
          <View style={[styles.tableCell, styles.amountCell]}>
            <Text style={styles.bold}>{formatCurrency(estimateData.totalPrice)}</Text>
          </View>
        </View>
      </View>

      {/* Add markup note if applyMarkup is true */}
      {formData.applyMarkup && (
        <View style={{marginTop: 5, marginBottom: 10}}>
          <Text style={{fontSize: 9, fontStyle: 'italic', color: '#666666'}}>
            Note: This quote includes a 50% markup for {formData.cleaningType === 'complete' 
              ? "additional cleaning stages and multiple site visits" 
              : "additional supplies, equipment, and specialized cleaning materials"}.
          </Text>
        </View>
      )}

      {/* Project Timeline */}
      <View style={styles.infoGrid}>
        <View style={styles.infoColumn}>
          <Text style={styles.subtitle}>Project Timeline</Text>
          <Text style={styles.infoValue}>Estimated Hours: {estimateData.estimatedHours} hours</Text>
          <Text style={styles.infoValue}>Team Size: {formData.numberOfCleaners} cleaners</Text>
          <Text style={styles.infoValue}>Hours Per Cleaner: {(estimateData.estimatedHours / formData.numberOfCleaners).toFixed(1)} hours</Text>
          <Text style={styles.infoValue}>Estimated Completion: {Math.ceil(estimateData.estimatedHours / (8 * formData.numberOfCleaners))} day(s)</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.subtitle}>Additional Information</Text>
          <Text style={styles.notes}>{quoteInfo.notes}</Text>
        </View>
      </View>

      {/* Terms & Conditions */}
      <Text style={styles.subtitle}>Terms & Conditions</Text>
      <Text style={styles.terms}>{quoteInfo.terms}</Text>

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
        <Text>Thank you for your business! | {companyInfo.name} | {companyInfo.phone} | {companyInfo.email}</Text>
        <Text style={{marginTop: 5, fontStyle: 'italic'}}>
          All prices include our standard supplies, equipment, labor, and service fees for professional-grade cleaning.
        </Text>
      </View>
    </Page>
  </Document>
);

export default QuotePDF; 