import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { documentsAPI } from '../services/api';

const DocumentRequestScreen = ({ navigation }) => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const data = await documentsAPI.getDocumentTypes();
        setTypes(Array.isArray(data) ? data : []);
      } catch (e) {
        setTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  const submit = async () => {
    if (!selectedType) {
      Alert.alert('Missing', 'Please select a document type');
      return;
    }
    if (!purpose.trim()) {
      Alert.alert('Missing', 'Please enter a purpose');
      return;
    }
    try {
      setSubmitting(true);
      await documentsAPI.createDocumentRequest({ document_type: selectedType.id || selectedType, purpose, remarks });
      Alert.alert('Request Sent', 'Your request has been submitted.', [
        { text: 'OK', onPress: () => navigation.replace('DocumentRequests') },
      ]);
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || 'Failed to submit request');
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backIconContainer}><View style={styles.backIconArrow} /></View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Document Request</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Document Type</Text>
        <TouchableOpacity style={styles.selectBox} activeOpacity={0.7} onPress={() => setShowTypeDropdown(s => !s)}>
          <Text style={[styles.selectText, !selectedType && { color: '#9CA3AF' }]}>
            {selectedType ? selectedType.name : 'Select document type'}
          </Text>
          <View style={[styles.chevron, showTypeDropdown && styles.chevronUp]} />
        </TouchableOpacity>
        {showTypeDropdown && (
          <View style={styles.dropdown}>
            {loadingTypes ? (
              <View style={styles.dropdownLoading}><ActivityIndicator color="#3B82F6" /></View>
            ) : types.length === 0 ? (
              <View style={styles.dropdownEmpty}><Text style={styles.dropdownEmptyText}>No types available</Text></View>
            ) : (
              <ScrollView style={{ maxHeight: 200 }}>
                {types.map(t => (
                  <TouchableOpacity key={t.id} style={styles.dropdownItem} onPress={() => { setSelectedType(t); setShowTypeDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <Text style={styles.label}>Purpose</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Employment requirement"
          value={purpose}
          onChangeText={setPurpose}
        />

        <Text style={styles.label}>Remarks (optional)</Text>
        <TextInput
          style={[styles.input, { height: 100 }]} multiline
          placeholder="Any additional notes"
          value={remarks}
          onChangeText={setRemarks}
        />

        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>Payment: You will receive pickup/payment instructions after approval. We can add a GCash link here next.</Text>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', letterSpacing: 0.3 },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8, marginTop: 14 },
  selectBox: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: '#111827', fontWeight: '600' },
  chevron: { width: 10, height: 10, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#9CA3AF', transform: [{ rotate: '-45deg' }] },
  chevronUp: { transform: [{ rotate: '135deg' }] },
  dropdown: { backgroundColor: 'white', borderRadius: 12, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  dropdownLoading: { padding: 16, alignItems: 'center' },
  dropdownEmpty: { padding: 16 },
  dropdownEmptyText: { color: '#6B7280' },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14 },
  dropdownItemText: { color: '#374151', fontWeight: '600' },
  input: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#111827' },
  submitBtn: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  submitText: { color: 'white', fontWeight: '700' },
  noteBox: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, marginTop: 12 },
  noteText: { color: '#374151', fontSize: 12 },
});

export default DocumentRequestScreen;


