import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { documentsAPI } from '../services/api';
import PaymentSelectionScreen from './PaymentSelectionScreen';

const statusStyles = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'PENDING' },
  approved: { bg: '#ECFDF5', text: '#065F46', label: 'APPROVED' },
  released: { bg: '#DBEAFE', text: '#1E3A8A', label: 'RELEASED' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'REJECTED' },
};

const DocumentRequestsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await documentsAPI.getMyRequests();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleRequestPress = (item) => {
    if (item.status === 'approved') {
      setSelectedRequest(item);
      setShowPaymentModal(true);
    }
  };

  const handleSelectPayment = (method) => {
    setShowPaymentModal(false);
    navigation.navigate('Payment', {
      request: selectedRequest,
      paymentMethod: method,
    });
  };

  const renderItem = ({ item }) => {
    const stylesFor = statusStyles[item.status] || statusStyles.pending;
    const isClickable = item.status === 'approved';
    
    return (
      <TouchableOpacity
        style={[styles.card, isClickable && styles.clickableCard]}
        onPress={() => handleRequestPress(item)}
        disabled={!isClickable}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.document_type?.name || item.document_type || 'Document'}</Text>
          <View style={[styles.statusPill, { backgroundColor: stylesFor.bg }]}>
            <Text style={[styles.statusText, { color: stylesFor.text }]}>{stylesFor.label}</Text>
          </View>
        </View>
        {item.purpose ? <Text style={styles.meta} numberOfLines={2}>{item.purpose}</Text> : null}
        <View style={styles.rowBetween}>
          <Text style={styles.secondary}>Ref: {item.reference || item.id}</Text>
          {item.created_at ? <Text style={styles.secondary}>{new Date(item.created_at).toLocaleDateString()}</Text> : null}
        </View>
        {isClickable && (
          <View style={styles.paymentHint}>
            <Text style={styles.paymentHintText}>Tap to choose payment method</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backIconContainer}><View style={styles.backIconArrow} /></View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Requests</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('DocumentRequest')}> 
            <Text style={styles.primaryBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <PaymentSelectionScreen
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectPayment={handleSelectPayment}
        request={selectedRequest}
      />
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', letterSpacing: 0.3 },
  primaryBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  listContent: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  clickableCard: { borderWidth: 2, borderColor: '#3B82F6' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  meta: { fontSize: 14, color: '#374151', marginBottom: 8 },
  secondary: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  paymentHint: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  paymentHintText: { fontSize: 12, color: '#3B82F6', fontWeight: '600', textAlign: 'center' },
});

export default DocumentRequestsScreen;


