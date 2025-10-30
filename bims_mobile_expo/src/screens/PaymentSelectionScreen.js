import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

const PaymentSelectionScreen = ({ visible, onClose, onSelectPayment, request }) => {
  if (!request) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Payment Method</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <View style={styles.closeIcon}>
                <View style={styles.closeLine1} />
                <View style={styles.closeLine2} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Request Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Request Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Document:</Text>
              <Text style={styles.infoValue}>{request.document_type?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reference:</Text>
              <Text style={styles.infoValue}>#{request.id}</Text>
            </View>
          </View>

          {/* Payment Options */}
          <View style={styles.optionsContainer}>
            {/* Direct Payment */}
            <TouchableOpacity
              style={[styles.paymentOption, styles.directOption]}
              onPress={() => onSelectPayment('direct')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <View style={styles.buildingContainer}>
                  <View style={styles.buildingBase} />
                  <View style={styles.buildingTop} />
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Pay at Barangay Hall</Text>
                <Text style={styles.optionDescription}>Pay in person during office hours</Text>
              </View>
              <View style={styles.arrowContainer}>
                <View style={styles.arrowIcon} />
              </View>
            </TouchableOpacity>

            {/* E-Payment */}
            <TouchableOpacity
              style={[styles.paymentOption, styles.ePaymentOption]}
              onPress={() => onSelectPayment('online')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <View style={styles.phoneContainer}>
                  <View style={styles.phoneBody} />
                  <View style={styles.phoneScreen} />
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Pay Online</Text>
                <Text style={styles.optionDescription}>GCash or Bank Transfer via QR</Text>
              </View>
              <View style={styles.arrowContainer}>
                <View style={styles.arrowIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  closeLine1: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: '#6B7280',
    top: 11,
    left: 3,
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: '#6B7280',
    top: 11,
    left: 3,
    transform: [{ rotate: '-45deg' }],
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  optionsContainer: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  directOption: {
    backgroundColor: '#FFFAF0',
    borderColor: '#FEF3C7',
  },
  ePaymentOption: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BFDBFE',
  },
  optionIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buildingContainer: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  buildingBase: {
    width: 40,
    height: 30,
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  buildingTop: {
    position: 'absolute',
    top: -10,
    width: 16,
    height: 16,
    backgroundColor: '#F59E0B',
    alignSelf: 'center',
    borderRadius: 8,
  },
  phoneContainer: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  phoneBody: {
    width: 40,
    height: 36,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  phoneScreen: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    height: 24,
    backgroundColor: '#1E40AF',
    borderRadius: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#6B7280',
    transform: [{ rotate: '45deg' }],
  },
});

export default PaymentSelectionScreen;
