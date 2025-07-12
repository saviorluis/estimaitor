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
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    width: 150,
    height: 75,
    marginRight: 12,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
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

const WorkOrderPDFSpanish: React.FC<WorkOrderPDFProps> = ({
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
  const scopeOfWorkText = "La Limpieza Final incluye:\n" +
    "• Barrer/trapear todos los pisos de superficie dura y aspirar áreas alfombradas\n" +
    "• Limpiar ventanas interiores/exteriores (___WINDOW_COUNT___ ventanas)\n" +
    "• Limpiar y desinfectar todos los baños\n" +
    "• Limpiar accesorios de iluminación y realizar limpieza de polvo en altura\n" +
    "• Limpiar y desinfectar salas de descanso y áreas de cocina\n" +
    "• Limpieza detallada de salas de conferencias y áreas de recepción\n" +
    "• Limpiar estaciones de trabajo y áreas comunes\n" +
    "• Desempolvar y limpiar todos los muebles y equipos de oficina\n" +
    "• Limpiar y desinfectar manijas de puertas e interruptores de luz\n" +
    "• Vaciar y limpiar todos los contenedores de basura\n" +
    "• Limpiar particiones y puertas de vidrio interiores\n" +
    "• Aspirar todos los muebles tapizados";

  const totalWindows = (formData.numberOfWindows || 0) + (formData.numberOfLargeWindows || 0) + (formData.numberOfHighAccessWindows || 0);
  const scopeOfWork = scopeOfWorkText
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace('• ', '').trim())
    .map(line => line.replace('___ Sq Ft ___', `${(formData.squareFootage || 0).toLocaleString()} pies cuadrados`))
    .map(line => line.replace('___PROJECT_NAME___', quoteInfo.projectName))
    .map(line => line.replace('___WINDOW_COUNT___', totalWindows.toString()));

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
                <Text style={styles.companyDetails}>Teléfono: {companyInfo.phone}</Text>
                <Text style={styles.companyDetails}>{companyInfo.email}</Text>
              </View>
            </View>
          </View>
          <View style={styles.workOrderInfo}>
            <Text style={styles.workOrderTitle}>Orden de Trabajo</Text>
          </View>
        </View>

        {/* Project and Cleaner Information Grid */}
        <View style={styles.infoGrid}>
          {/* Project Information */}
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Detalles del Proyecto</Text>
            <Text style={styles.infoText}>Nombre del Proyecto: {quoteInfo.projectName}</Text>
            <Text style={styles.infoText}>Ubicación: {quoteInfo.projectAddress}</Text>
            <Text style={styles.infoText}>Tipo de Proyecto: {formData.projectType.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
            <Text style={styles.infoText}>Área Total: {formData.squareFootage} pies cuadrados</Text>
          </View>

          {/* Cleaner Information */}
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Información del Limpiador</Text>
            <Text style={styles.cleanerInfo}>Nombre: _____________________________</Text>
            <Text style={styles.cleanerInfo}>Teléfono: _____________________________</Text>
            <Text style={styles.cleanerInfo}>Correo: _____________________________</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alcance del Trabajo</Text>
          <View style={styles.scopeOfWork}>
            {scopeOfWork.map((item: string, index: number) => (
              <Text key={index} style={styles.bulletPoint}>• {item}</Text>
            ))}
            {(formData.numberOfWindows + formData.numberOfLargeWindows + formData.numberOfHighAccessWindows) > 0 && (
              <Text style={styles.bulletPoint}>• Limpiar {formData.numberOfWindows + formData.numberOfLargeWindows + formData.numberOfHighAccessWindows} ventanas</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Notes */}
        {quoteInfo.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas Adicionales</Text>
            <Text style={styles.infoText}>{quoteInfo.notes}</Text>
          </View>
        )}

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto</Text>
          <View style={styles.amountSection}>
            <View style={styles.amountField}>
              <Text style={styles.dollarSign}>$</Text>
              <View style={styles.handwrittenField} />
            </View>
            <View style={styles.startDateField}>
              <Text style={styles.dateLabel}>Fecha de Inicio:</Text>
              <View style={styles.handwrittenField} />
            </View>
          </View>
        </View>

        {/* Fees Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Importante sobre Tarifas</Text>
          <View style={styles.feesSection}>
            {/* Late Arrival Fee */}
            <View style={styles.feeItem}>
              <Text style={styles.feeTitle}>Cargo por Llegada Tardía</Text>
              <Text style={styles.feeDescription}>
                • Si el equipo llega más de 30 minutos tarde al sitio de trabajo: $75/hora de deducción de la factura total
              </Text>
              <Text style={styles.feeDescription}>
                • Si el equipo llega más de 1 hora tarde: $100/hora de deducción de la factura total
              </Text>
              <Text style={styles.warningText}>
                Nota: El equipo debe notificar al supervisor inmediatamente de cualquier retraso potencial
              </Text>
            </View>

            {/* Involvement Fee */}
            <View style={styles.feeItem}>
              <Text style={styles.feeTitle}>Cargo por Intervención del Supervisor</Text>
              <Text style={styles.feeDescription}>
                • Si se requiere la presencia del supervisor en el sitio debido a problemas de desempeño del equipo: $150/hora cargo a los miembros del equipo responsables
              </Text>
              <Text style={styles.feeDescription}>
                • Esta tarifa cubre el tiempo de viaje y el tiempo de supervisión en el sitio
              </Text>
              <Text style={styles.warningText}>
                Nota: Esta tarifa se deducirá del pago del equipo si es necesaria la intervención del supervisor
              </Text>
            </View>

            {/* Materials Fee */}
            <View style={styles.feeItem}>
              <Text style={styles.feeTitle}>Cargo por Materiales</Text>
              <Text style={styles.feeDescription}>
                • Se aplicarán cargos adicionales si el supervisor necesita proporcionar materiales o equipos de limpieza
              </Text>
              <Text style={styles.feeDescription}>
                • Los cargos por materiales se determinan caso por caso según el tipo y la cantidad necesaria
              </Text>
              <Text style={styles.warningText}>
                Nota: Los cargos por materiales se discutirán y acordarán antes del inicio del trabajo
              </Text>
            </View>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>Supervisor</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma</Text>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Fecha:</Text>
              <View style={styles.handwrittenField} />
            </View>
          </View>
          
          <View style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>Limpiador</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Firma</Text>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Fecha:</Text>
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

export default WorkOrderPDFSpanish; 