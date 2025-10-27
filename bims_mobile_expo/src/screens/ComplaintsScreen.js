import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { complaintsAPI } from '../services/api';

const ComplaintsScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    pending: '#FEF3C7',
    acknowledged: '#DBEAFE',
    in_progress: '#DDD6FE',
    resolved: '#D1FAE5',
    closed: '#E5E7EB',
  };

  const statusTextColors = {
    pending: '#92400E',
    acknowledged: '#1E3A8A',
    in_progress: '#6B21A8',
    resolved: '#065F46',
    closed: '#374151',
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll access to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !details.trim()) {
      Alert.alert('Required', 'Please fill in title and details');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('details', details);
      
      images.forEach((image, index) => {
        const uri = image.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri: uri,
          type: type,
          name: filename,
        });
      });

      const response = await complaintsAPI.createComplaint(formData, images);
      Alert.alert('Success', 'Complaint submitted successfully');
      setTitle('');
      setDetails('');
      setImages([]);
      setShowForm(false);
      loadComplaints();
    } catch (error) {
      console.error('Complaint submit error:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      const data = await complaintsAPI.getMyComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      setComplaints([]);
    }
  };

  React.useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backIconContainer}>
              <View style={styles.backIconArrow} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaints</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <View style={styles.complaintIcon} />
            </View>
            <Text style={styles.emptyTitle}>No Complaints Yet</Text>
            <Text style={styles.emptyText}>Submit your first complaint</Text>
          </View>
        ) : (
          complaints.map((complaint) => (
            <TouchableOpacity key={complaint.id} style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <Text style={styles.complaintTitle} numberOfLines={1}>{complaint.title}</Text>
                <View style={[styles.statusPill, { backgroundColor: statusColors[complaint.status] || statusColors.pending }]}>
                  <Text style={[styles.statusText, { color: statusTextColors[complaint.status] || statusTextColors.pending }]}>
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.complaintDetails} numberOfLines={3}>{complaint.details}</Text>
              {complaint.response && (
                <View style={styles.responseCard}>
                  <Text style={styles.responseLabel}>Admin Response:</Text>
                  <Text style={styles.responseText}>{complaint.response}</Text>
                </View>
              )}
              <Text style={styles.dateText}>{new Date(complaint.created_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Complaint</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter complaint title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Details *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Describe your complaint..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Images (Optional, max 5)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                    <View style={styles.addImageIcon}>
                      <Text style={styles.addImageText}>+</Text>
                    </View>
                  </TouchableOpacity>
                  {images.map((img, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: img.uri }} style={styles.selectedImage} />
                      <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(index)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: { backgroundColor: '#3B82F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: 'white', fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#E5E7EB', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  complaintIcon: { width: 60, height: 60, borderWidth: 3, borderColor: '#9CA3AF', borderRadius: 30, position: 'relative' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  complaintCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  complaintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  complaintTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '700' },
  complaintDetails: { fontSize: 14, color: '#374151', marginBottom: 12 },
  responseCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 12 },
  responseLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  responseText: { fontSize: 13, color: '#374151' },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  closeButton: { fontSize: 24, color: '#6B7280' },
  formContent: { padding: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827' },
  textArea: { height: 120, textAlignVertical: 'top' },
  addImageButton: { width: 80, height: 80, borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addImageIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  addImageText: { fontSize: 24, color: '#6B7280' },
  imageContainer: { marginRight: 12, position: 'relative' },
  selectedImage: { width: 80, height: 80, borderRadius: 12 },
  removeImage: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  removeText: { color: 'white', fontSize: 14, fontWeight: '700' },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  submitButton: { flex: 1, backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});

export default ComplaintsScreen;
