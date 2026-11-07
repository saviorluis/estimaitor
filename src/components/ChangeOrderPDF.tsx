import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { FormData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { isUsableImageSrc } from '@/lib/companySettings';
import type { ChangeOrderDocument } from '@/lib/proposals';

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
  changeOrderInfo: {
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
  changeOrderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  changeOrderDetails: {
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
  descriptionSection: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 10,
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 20,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: 'bold',
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
  pendingStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9A3412',
    marginTop: 8,
    textAlign: 'right',
  },
  authorizationBox: {
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: '#9A3412',
    backgroundColor: '#FFF7ED',
    padding: 12,
  },
  authorizationHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 6,
  },
  authorizationText: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  windowSignatureLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  windowSignatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginTop: 26,
    marginBottom: 8,
    width: '100%',
  },
});

interface ChangeOrderPDFProps {
  formData: FormData;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    logoSrc?: string;
  };
  clientInfo: {
    name: string;
    company: string;
    address: string;
    email: string;
    phone: string;
  };
  changeOrderInfo: {
    orderNumber: string;
    date: string;
    projectName: string;
    projectAddress: string;
  };
  /** Window Cleaning proposal change. Omitted for the legacy blank form. */
  changeOrder?: ChangeOrderDocument | null;
}

function moneyOrBlank(label: string, amount: number | null): string {
  return amount === null ? `${label}:` : `${label}: ${formatCurrency(amount)}`;
}

function WindowChangeOrderPDF({
  companyInfo,
  changeOrder,
}: {
  companyInfo: ChangeOrderPDFProps['companyInfo'];
  changeOrder: ChangeOrderDocument;
}) {
  const logoSrc = isUsableImageSrc(companyInfo.logoSrc) ? companyInfo.logoSrc : '/assets/logo.png';
  const detail = (label: string, value: string) => (value ? `${label}: ${value}` : `${label}:`);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Image src={logoSrc} style={{ width: 64, height: 64, objectFit: 'contain' }} />
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>{companyInfo.city}</Text>
            <Text style={styles.companyDetails}>{companyInfo.phone} | {companyInfo.email}</Text>
          </View>
          <View style={styles.changeOrderInfo}>
            <Text style={styles.changeOrderTitle}>CHANGE ORDER</Text>
            <Text style={styles.pendingStatus}>{changeOrder.statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Original proposal</Text>
        <Text style={styles.infoValue}>{detail('Proposal', changeOrder.quoteNumber)}</Text>
        <Text style={styles.infoValue}>{detail('Date', changeOrder.date)}</Text>
        <Text style={styles.infoValue}>{detail('Client', changeOrder.clientName)}</Text>
        <Text style={styles.infoValue}>{detail('Company', changeOrder.clientCompany)}</Text>
        <Text style={styles.infoValue}>{detail('Phone', changeOrder.clientPhone)}</Text>
        <Text style={styles.infoValue}>{detail('Email', changeOrder.clientEmail)}</Text>
        <Text style={styles.infoValue}>{detail('Property', changeOrder.projectName)}</Text>
        <Text style={styles.infoValue}>{detail('Property address', changeOrder.projectAddress)}</Text>
        <Text style={styles.infoValue}>{detail('Sides cleaned', changeOrder.sides)}</Text>
        <Text style={styles.infoValue}>{detail('Windows', changeOrder.windowCount)}</Text>
        <Text style={styles.infoValue}>{`Original proposal total: ${formatCurrency(changeOrder.originalTotal)}`}</Text>

        <Text style={[styles.subtitle, { marginTop: 16 }]}>Proposed changes</Text>
        <Text style={styles.infoValue}>Addition, Removal, and Scope change are listed separately.</Text>
        {changeOrder.lines.length === 0 ? (
          <Text style={[styles.infoValue, { marginTop: 6 }]}>No changes entered.</Text>
        ) : (
          changeOrder.lines.map((line) => (
            <View key={line.id} style={{ marginTop: 8 }} wrap={false}>
              <Text style={styles.descriptionTitle}>{line.label}</Text>
              <Text style={styles.infoValue}>{detail('Description', line.description)}</Text>
              <Text style={styles.infoValue}>{detail('Reason', line.reason)}</Text>
              <Text style={styles.infoValue}>{moneyOrBlank('Amount', line.amount)}</Text>
            </View>
          ))
        )}

        <View style={{ marginTop: 16 }} wrap={false}>
          <Text style={styles.infoValue}>{moneyOrBlank('Price adjustment', changeOrder.adjustment)}</Text>
          <Text style={styles.infoValue}>{moneyOrBlank('Revised total', changeOrder.revisedTotal)}</Text>
        </View>

        <View style={styles.authorizationBox} wrap={false}>
          <Text style={styles.authorizationHeading}>Customer authorization</Text>
          <Text style={styles.authorizationText}>{changeOrder.authorization}</Text>
          <View style={styles.signatureSection}>
            <View style={styles.signatureColumn}>
              <Text style={styles.windowSignatureLabel}>Customer signature</Text>
              <View style={styles.windowSignatureLine} />
              <Text style={styles.windowSignatureLabel}>Date</Text>
              <View style={styles.windowSignatureLine} />
            </View>
            <View style={styles.signatureColumn}>
              <Text style={styles.windowSignatureLabel}>Company representative</Text>
              <View style={styles.windowSignatureLine} />
              <Text style={styles.windowSignatureLabel}>Date</Text>
              <View style={styles.windowSignatureLine} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const ChangeOrderPDF: React.FC<ChangeOrderPDFProps> = ({
  companyInfo,
  clientInfo,
  changeOrderInfo,
  changeOrder,
}) => {
  if (changeOrder) {
    return <WindowChangeOrderPDF companyInfo={companyInfo} changeOrder={changeOrder} />;
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Image src={isUsableImageSrc(companyInfo.logoSrc) ? companyInfo.logoSrc : '/assets/logo.png'} style={styles.logo} />
              </View>
            </View>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>{companyInfo.city}</Text>
            <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
            <Text style={styles.companyDetails}>{companyInfo.website}</Text>
          </View>
          <View style={styles.changeOrderInfo}>
            <Text style={styles.changeOrderTitle}>CHANGE ORDER</Text>
            <Text style={styles.changeOrderDetails}>Order #: {changeOrderInfo.orderNumber}</Text>
            <Text style={styles.changeOrderDetails}>Date: {changeOrderInfo.date}</Text>
          </View>
        </View>

        {/* Client and Project Information */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Client Information</Text>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{clientInfo.name}</Text>
            <Text style={styles.infoLabel}>Company:</Text>
            <Text style={styles.infoValue}>{clientInfo.company}</Text>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{clientInfo.address}</Text>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{clientInfo.email}</Text>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{clientInfo.phone}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.subtitle}>Project Information</Text>
            <Text style={styles.infoLabel}>Project Name:</Text>
            <Text style={styles.infoValue}>{changeOrderInfo.projectName}</Text>
            <Text style={styles.infoLabel}>Project Address:</Text>
            <Text style={styles.infoValue}>{changeOrderInfo.projectAddress}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Change Order Description</Text>
          {/* Empty description section as requested */}
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Change Order Amount:</Text>
          <View style={[styles.priceValue, { borderBottomWidth: 1, borderBottomColor: '#000000', width: 150 }]}>
            <Text> </Text>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureLabel}>Client Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureLabel}>Company Representative</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This change order becomes part of and is subject to all terms and conditions of the original agreement.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ChangeOrderPDF; 