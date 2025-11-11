import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ProjectType } from '@/lib/types';

// Register fonts
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#7c3aed',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
    color: '#374151',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoColumn: {
    width: '50%',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 8,
    color: '#111827',
  },
  table: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 10,
    paddingHorizontal: 5,
  },
  tableCellLeft: {
    width: '70%',
  },
  tableCellRight: {
    width: '30%',
    textAlign: 'right',
  },
  pricingBox: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 4,
    marginTop: 15,
    marginBottom: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  pricingValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#7c3aed',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  serviceScopeList: {
    marginLeft: 10,
    marginTop: 5,
  },
  serviceScopeItem: {
    fontSize: 9,
    marginBottom: 3,
    color: '#4b5563',
  },
  termsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  termsText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 5,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '45%',
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 25,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  companyDetails: {
    fontSize: 9,
    marginBottom: 2,
    color: '#6b7280',
  },
});

// Helper functions
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getProjectTypeDisplay = (type: ProjectType): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getFrequencyDisplay = (frequency: string): string => {
  return frequency
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};

const getDaysDisplay = (days: string[]): string => {
  return days
    .map(day => day.charAt(0).toUpperCase() + day.slice(1))
    .join(', ');
};

interface ContractPDFProps {
  contractData: {
    monthlyRate: number;
    annualRate: number;
    pricePerSqFt?: number;
    pricePerRoom?: number;
    serviceScope: {
      daily: string[];
      weekly: string[];
      monthly: string[];
      quarterly: string[];
    };
    schedule: {
      frequency: string;
      days: string[];
      time: string;
      estimatedHours: number;
    };
    contractTerms: {
      length: number;
      startDate: string;
      monthlyRate: number;
      annualDiscount: number;
      escalationClause: string;
    };
  };
  formData: {
    facilityName: string;
    facilityAddress: string;
    city: string;
    state: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    buildingType: ProjectType;
    measurementType: 'square_footage' | 'room_count';
    squareFootage?: number;
    roomCount?: number;
    bathroomCount: number;
    floorType: 'carpet' | 'hard_floor' | 'mixed';
    serviceFrequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
    serviceDays: string[];
    serviceTime: 'morning' | 'afternoon' | 'evening' | 'overnight';
    contractLength: 6 | 12 | 24 | 36;
    startDate: string;
    specialRequirements?: string;
  };
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
  };
  contractNumber?: string;
}

const ContractPDF: React.FC<ContractPDFProps> = ({
  contractData,
  formData,
  companyInfo,
  contractNumber
}) => {
  const contractDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const endDate = new Date(formData.startDate);
  endDate.setMonth(endDate.getMonth() + contractData.contractTerms.length);
  const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src="/assets/logo.png" style={styles.logo} />
          <Text style={styles.title}>JANITORIAL SERVICE CONTRACT</Text>
          <Text style={styles.subtitle}>Professional Cleaning Services Agreement</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#4b5563' }}>
            Prepared For:
          </Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 }}>
            {formData.facilityName}
          </Text>
          
          {contractNumber && (
            <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#7c3aed' }}>
              Contract #: {contractNumber}
            </Text>
          )}
          <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 5 }}>
            Date: {contractDate}
          </Text>
        </View>

        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0 }}>
          <Text style={styles.companyName}>{companyInfo.name}</Text>
          <Text style={styles.companyDetails}>{companyInfo.phone} | {companyInfo.email}</Text>
          <Text style={styles.companyDetails}>{companyInfo.address}, {companyInfo.city}</Text>
          <Text style={styles.companyDetails}>{companyInfo.website}</Text>
        </View>
      </Page>

      {/* Main Contract Page */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#7c3aed' }}>
            JANITORIAL SERVICE CONTRACT
          </Text>
          {contractNumber && (
            <Text style={{ fontSize: 10, color: '#6b7280' }}>
              Contract #{contractNumber} | Date: {contractDate}
            </Text>
          )}
        </View>

        {/* Parties Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties to This Agreement</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Service Provider:</Text>
              <Text style={styles.infoValue}>{companyInfo.name}</Text>
              <Text style={styles.infoValue}>{companyInfo.address}</Text>
              <Text style={styles.infoValue}>{companyInfo.city}</Text>
              <Text style={styles.infoValue}>Phone: {companyInfo.phone}</Text>
              <Text style={styles.infoValue}>Email: {companyInfo.email}</Text>
            </View>
            
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Client:</Text>
              <Text style={styles.infoValue}>{formData.facilityName}</Text>
              <Text style={styles.infoValue}>{formData.facilityAddress}</Text>
              <Text style={styles.infoValue}>{formData.city}, {formData.state}</Text>
              <Text style={styles.infoValue}>Contact: {formData.contactName}</Text>
              <Text style={styles.infoValue}>Phone: {formData.contactPhone}</Text>
              <Text style={styles.infoValue}>Email: {formData.contactEmail}</Text>
            </View>
          </View>
        </View>

        {/* Facility Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facility Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Building Type:</Text>
              <Text style={styles.infoValue}>{getProjectTypeDisplay(formData.buildingType)}</Text>
              <Text style={styles.infoLabel}>Measurement:</Text>
              <Text style={styles.infoValue}>
                {formData.measurementType === 'square_footage' 
                  ? `${formData.squareFootage?.toLocaleString()} sq ft`
                  : `${formData.roomCount} rooms`}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Bathrooms:</Text>
              <Text style={styles.infoValue}>{formData.bathroomCount}</Text>
              <Text style={styles.infoLabel}>Floor Type:</Text>
              <Text style={styles.infoValue}>
                {formData.floorType === 'mixed' ? 'Mixed (Carpet & Hard)' : 
                 formData.floorType === 'carpet' ? 'Primarily Carpet' : 'Primarily Hard Floor'}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Schedule</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Frequency:</Text>
              <Text style={styles.infoValue}>{getFrequencyDisplay(contractData.schedule.frequency)}</Text>
              <Text style={styles.infoLabel}>Service Days:</Text>
              <Text style={styles.infoValue}>{getDaysDisplay(contractData.schedule.days)}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Service Time:</Text>
              <Text style={styles.infoValue}>
                {contractData.schedule.time.charAt(0).toUpperCase() + contractData.schedule.time.slice(1)}
              </Text>
              <Text style={styles.infoLabel}>Estimated Hours:</Text>
              <Text style={styles.infoValue}>
                {contractData.schedule.estimatedHours} hours per {formData.serviceFrequency === 'daily' ? 'week' : formData.serviceFrequency}
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Terms</Text>
          <View style={styles.pricingBox}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Monthly Rate:</Text>
              <Text style={styles.pricingValue}>{formatCurrency(contractData.monthlyRate)}</Text>
            </View>
            {contractData.pricePerSqFt && (
              <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 8 }}>
                ${contractData.pricePerSqFt.toFixed(2)} per square foot per month
              </Text>
            )}
            {contractData.pricePerRoom && (
              <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 8 }}>
                ${contractData.pricePerRoom.toFixed(2)} per room per month
              </Text>
            )}
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Annual Rate:</Text>
              <Text style={styles.pricingValue}>{formatCurrency(contractData.annualRate)}</Text>
            </View>
            {contractData.contractTerms.annualDiscount > 0 && (
              <Text style={{ fontSize: 9, color: '#059669', marginTop: 5 }}>
                {contractData.contractTerms.annualDiscount}% annual discount applied
              </Text>
            )}
            <View style={[styles.pricingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Contract Term:</Text>
              <Text style={styles.totalValue}>{contractData.contractTerms.length} Months</Text>
            </View>
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 5 }}>
              Start Date: {formatDate(formData.startDate)} | End Date: {formattedEndDate}
            </Text>
          </View>
        </View>

        {/* Service Scope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Services</Text>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#374151' }}>
              Daily Services:
            </Text>
            <View style={styles.serviceScopeList}>
              {contractData.serviceScope.daily.map((task, index) => (
                <Text key={index} style={styles.serviceScopeItem}>• {task}</Text>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#374151' }}>
              Weekly Services:
            </Text>
            <View style={styles.serviceScopeList}>
              {contractData.serviceScope.weekly.map((task, index) => (
                <Text key={index} style={styles.serviceScopeItem}>• {task}</Text>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#374151' }}>
              Monthly Services:
            </Text>
            <View style={styles.serviceScopeList}>
              {contractData.serviceScope.monthly.map((task, index) => (
                <Text key={index} style={styles.serviceScopeItem}>• {task}</Text>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#374151' }}>
              Quarterly Services:
            </Text>
            <View style={styles.serviceScopeList}>
              {contractData.serviceScope.quarterly.map((task, index) => (
                <Text key={index} style={styles.serviceScopeItem}>• {task}</Text>
              ))}
            </View>
          </View>

          {formData.specialRequirements && (
            <View style={{ marginTop: 15, padding: 10, backgroundColor: '#fef3c7', borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Special Requirements:</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{formData.specialRequirements}</Text>
            </View>
          )}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              1. <Text style={{ fontWeight: 'bold' }}>Payment Terms:</Text> Payment is due within 15 days of invoice date. 
              Monthly invoices will be issued on the 1st of each month for the upcoming month's services.
            </Text>
            <Text style={styles.termsText}>
              2. <Text style={{ fontWeight: 'bold' }}>Contract Term:</Text> This agreement is effective for {contractData.contractTerms.length} months, 
              beginning {formatDate(formData.startDate)} and ending {formattedEndDate}. 
              {contractData.contractTerms.annualDiscount > 0 && ` An annual discount of ${contractData.contractTerms.annualDiscount}% is applied.`}
            </Text>
            <Text style={styles.termsText}>
              3. <Text style={{ fontWeight: 'bold' }}>Price Escalation:</Text> {contractData.contractTerms.escalationClause}
            </Text>
            <Text style={styles.termsText}>
              4. <Text style={{ fontWeight: 'bold' }}>Cancellation:</Text> Either party may terminate this agreement with 30 days written notice. 
              Early termination fees may apply as outlined in the termination clause.
            </Text>
            <Text style={styles.termsText}>
              5. <Text style={{ fontWeight: 'bold' }}>Access:</Text> Client agrees to provide necessary access to the facility during agreed service times. 
              Failure to provide access may result in rescheduling fees.
            </Text>
            <Text style={styles.termsText}>
              6. <Text style={{ fontWeight: 'bold' }}>Quality Standards:</Text> All services will be performed in accordance with industry standards 
              and the specifications outlined in this contract. Client may request inspection within 24 hours of service completion.
            </Text>
            <Text style={styles.termsText}>
              7. <Text style={{ fontWeight: 'bold' }}>Liability:</Text> Service provider maintains general liability insurance. 
              Client is responsible for securing valuables and items that require special handling.
            </Text>
            <Text style={styles.termsText}>
              8. <Text style={{ fontWeight: 'bold' }}>Modifications:</Text> Any changes to this agreement must be made in writing and signed by both parties.
            </Text>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Client Acceptance</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Authorized Representative Signature</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Print Name</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Service Provider</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Print Name</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {companyInfo.name} | {companyInfo.phone} | {companyInfo.email} | {companyInfo.website}
          </Text>
          <Text style={{ marginTop: 5 }}>
            This contract is valid upon signature by both parties. All terms and conditions are subject to local laws and regulations.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ContractPDF;


