import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { request, paymentMethod } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backIconContainer}><View style={styles.backIconArrow} /></View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Request Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Request Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Document:</Text>
            <Text style={styles.detailValue}>{request.document_type?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number:</Text>
            <Text style={styles.detailValue}>#{request.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purpose:</Text>
            <Text style={styles.detailValue}>{request.purpose || 'N/A'}</Text>
          </View>
        </View>

        {/* Payment Method Badge */}
        {paymentMethod === 'online' ? (
          <>
            {/* QR Code Card */}
            <View style={styles.qrCard}>
              <Text style={styles.cardTitle}>Scan to Pay</Text>
              <Text style={styles.cardSubtitle}>Use GCash or any QR-enabled app</Text>
              
              {/* QR Code Placeholder */}
              <View style={styles.qrContainer}>
                <View style={styles.qrBox}>
                  <View style={styles.qrPattern}>
                    {/* Top-left corner */}
                    <View style={styles.qrCorner} />
                    <View style={styles.qrCorner2} />
                    <View style={styles.qrCorner3} />
                    
                    {/* Center pattern */}
                    <View style={[styles.qrDot, { top: 80, left: 80 }]} />
                    <View style={[styles.qrDot, { top: 100, left: 80 }]} />
                    <View style={[styles.qrDot, { top: 120, left: 80 }]} />
                    <View style={[styles.qrDot, { top: 80, left: 100 }]} />
                    <View style={[styles.qrDot, { top: 120, left: 100 }]} />
                    <View style={[styles.qrDot, { top: 80, left: 120 }]} />
                    <View style={[styles.qrDot, { top: 100, left: 120 }]} />
                    <View style={[styles.qrDot, { top: 120, left: 120 }]} />
                    
                    {/* Bottom-right corner */}
                    <View style={[styles.qrCorner4, { top: 130, left: 130 }]} />
                    <View style={[styles.qrCorner5, { top: 150, left: 130 }]} />
                    <View style={[styles.qrCorner6, { top: 170, left: 130 }]} />
                    
                    {/* Random dots */}
                    <View style={[styles.qrDot, { top: 50, left: 50 }]} />
                    <View style={[styles.qrDot, { top: 50, left: 130 }]} />
                    <View style={[styles.qrDot, { top: 130, left: 50 }]} />
                    <View style={[styles.qrDot, { top: 170, left: 50 }]} />
                    <View style={[styles.qrDot, { top: 50, left: 170 }]} />
                    <View style={[styles.qrDot, { top: 170, left: 170 }]} />
                  </View>
                </View>
              </View>

              <Text style={styles.qrHint}>Scan this QR code with GCash app</Text>
            </View>

            {/* Payment Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.cardTitle}>Payment Instructions</Text>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>1</Text>
                </View>
                <Text style={styles.instructionText}>Scan the QR code above using GCash app</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>2</Text>
                </View>
                <Text style={styles.instructionText}>Enter the exact amount: <Text style={styles.bold}>₱100.00</Text></Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={styles.instructionText}>Add reference number in remarks: <Text style={styles.bold}>#{request.id}</Text></Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>4</Text>
                </View>
                <Text style={styles.instructionText}>Complete the payment</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>5</Text>
                </View>
                <Text style={styles.instructionText}>Wait for admin verification (1-2 hours)</Text>
              </View>
            </View>

            {/* Bank Transfer Option */}
            <View style={styles.bankCard}>
              <Text style={styles.cardTitle}>Or Transfer via Bank</Text>
              <View style={styles.bankDetails}>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account Name:</Text>
                  <Text style={styles.bankValue}>Barangay XYZ</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Bank:</Text>
                  <Text style={styles.bankValue}>BPI</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account Number:</Text>
                  <Text style={styles.bankValue}>1234 5678 9012</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Amount:</Text>
                  <Text style={styles.bankValue}>₱100.00</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Reference:</Text>
                  <Text style={styles.bankValue}>#{request.id}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          // Direct Payment Instructions
          <View style={styles.instructionsCard}>
            <Text style={styles.cardTitle}>Pay at Barangay Hall</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                Visit Barangay Hall during office hours (8:00 AM - 5:00 PM, Monday - Friday)
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                Bring a valid ID and present your reference number: <Text style={styles.bold}>#{request.id}</Text>
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                Pay the required fee and wait for document processing (1-2 hours)
              </Text>
            </View>
          </View>
        )}

        {/* Success Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('DocumentRequests')}
          >
            <Text style={styles.primaryButtonText}>I've Paid</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerContainer: { backgroundColor: 'white', paddingTop: 60, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIconContainer: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  backIconArrow: { width: 12, height: 12, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#6B7280', transform: [{ rotate: '45deg' }] },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827', letterSpacing: 0.3 },
  content: { flex: 1, padding: 16 },
  infoCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16, letterSpacing: 0.3 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '600', flex: 1, textAlign: 'right' },
  qrCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  qrContainer: { marginVertical: 20 },
  qrBox: { width: 220, height: 220, backgroundColor: 'white', borderRadius: 16, borderWidth: 8, borderColor: '#E5E7EB', position: 'relative', overflow: 'hidden' },
  qrPattern: { flex: 1, position: 'relative' },
  qrCorner: { position: 'absolute', width: 50, height: 50, borderTopWidth: 6, borderLeftWidth: 6, borderColor: '#000', top: 10, left: 10 },
  qrCorner2: { position: 'absolute', width: 50, height: 50, borderTopWidth: 6, borderRightWidth: 6, borderColor: '#000', top: 10, right: 10 },
  qrCorner3: { position: 'absolute', width: 50, height: 50, borderBottomWidth: 6, borderLeftWidth: 6, borderColor: '#000', bottom: 10, left: 10 },
  qrCorner4: { position: 'absolute', width: 50, height: 50, borderTopWidth: 6, borderLeftWidth: 6, borderColor: '#000' },
  qrCorner5: { position: 'absolute', width: 50, height: 50, borderTopWidth: 6, borderRightWidth: 6, borderColor: '#000' },
  qrCorner6: { position: 'absolute', width: 50, height: 50, borderBottomWidth: 6, borderRightWidth: 6, borderColor: '#000' },
  qrDot: { position: 'absolute', width: 12, height: 12, backgroundColor: '#000', borderRadius: 6 },
  qrHint: { fontSize: 13, color: '#6B7280', marginTop: 12 },
  instructionsCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  stepText: { fontSize: 12, fontWeight: '700', color: 'white' },
  instructionText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  bold: { fontWeight: '700', color: '#111827' },
  bankCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  bankDetails: { marginTop: 8 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  bankLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  bankValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  buttonContainer: { marginTop: 8, marginBottom: 24 },
  primaryButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

export default PaymentScreen;
