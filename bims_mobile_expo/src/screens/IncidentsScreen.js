import React, { useState, useEffect } from 'react';
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
import * as Location from 'expo-location';
import { complaintsAPI } from '../services/api';

const IncidentsScreen = ({ navigation }) => {
  const [incidents, setIncidents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('other');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const incidentTypes = [
    { value: 'disturbance', label: 'Disturbance' },
    { value: 'missing_item', label: 'Missing Item' },
    { value: 'accident', label: 'Accident' },
    { value: 'property_damage', label: 'Property Damage' },
    { value: 'noise_complaint', label: 'Noise Complaint' },
    { value: 'health_concern', label: 'Health Concern' },
    { value: 'sanitation', label: 'Sanitation Issue' },
    { value: 'streetlight', label: 'Streetlight/Infrastructure' },
    { value: 'stray_animals', label: 'Stray Animals' },
    { value: 'other', label: 'Other' },
  ];

  const statusColors = {
    received: '#DBEAFE',
    acknowledged: '#E0E7FF',
    in_progress: '#DDD6FE',
    resolved: '#D1FAE5',
    closed: '#E5E7EB',
  };

  const statusTextColors = {
    received: '#1E40AF',
    acknowledged: '#4338CA',
    in_progress: '#6B21A8',
    resolved: '#065F46',
    closed: '#374151',
  };

  const statusSteps = ['received', 'acknowledged', 'in_progress', 'resolved'];

  useEffect(() => {
    loadIncidents();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report incidents');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const pickImageFromGallery = async () => {
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

  const takePhoto = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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
      formData.append('incident_type', incidentType);
      formData.append('details', details);
      
      if (location) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
      }
      
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

      await complaintsAPI.createComplaint(formData, images);
      Alert.alert('Success', 'Incident reported successfully');
      setTitle('');
      setIncidentType('other');
      setDetails('');
      setImages([]);
      setShowForm(false);
      loadIncidents();
    } catch (error) {
      console.error('Incident submit error:', error);
      Alert.alert('Error', 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  const loadIncidents = async () => {
    try {
      const data = await complaintsAPI.getMyComplaints();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      setIncidents([]);
    }
  };

  const getStatusProgress = (status) => {
    const index = statusSteps.indexOf(status);
    return index >= 0 ? ((index + 1) / statusSteps.length) * 100 : 0;
  };

  const getStatusLabel = (status) => {
    const labels = {
      received: 'Received',
      acknowledged: 'Acknowledged',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return labels[status] || status;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backIconContainer}>
              <View style={styles.backIconArrow} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incidents & Reports</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Text style={styles.addButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {incidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <View style={styles.incidentIcon} />
            </View>
            <Text style={styles.emptyTitle}>No Incidents Reported</Text>
            <Text style={styles.emptyText}>Report your first incident</Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <View key={incident.id} style={styles.incidentCard}>
              <View style={styles.incidentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.incidentTitle} numberOfLines={1}>{incident.title}</Text>
                  <Text style={styles.incidentType}>{incidentTypes.find(t => t.value === incident.incident_type)?.label || 'Other'}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusColors[incident.status] || statusColors.received }]}>
                  <Text style={[styles.statusText, { color: statusTextColors[incident.status] || statusTextColors.received }]}>
                    {getStatusLabel(incident.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${getStatusProgress(incident.status)}%` }]} />
                </View>
                <View style={styles.progressSteps}>
                  {statusSteps.map((step, index) => (
                    <View key={step} style={[
                      styles.progressStep,
                      statusSteps.indexOf(incident.status) >= index && styles.progressStepActive
                    ]} />
                  ))}
                </View>
              </View>

              <Text style={styles.incidentDetails} numberOfLines={3}>{incident.details}</Text>
              
              {incident.location_address && (
                <View style={styles.locationContainer}>
                  <View style={styles.locationIcon} />
                  <Text style={styles.locationText} numberOfLines={1}>{incident.location_address}</Text>
                </View>
              )}

              {incident.response && (
                <View style={styles.responseCard}>
                  <Text style={styles.responseLabel}>Barangay Response:</Text>
                  <Text style={styles.responseText}>{incident.response}</Text>
                </View>
              )}
              <Text style={styles.dateText}>{new Date(incident.created_at).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Incident</Text>
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
                  placeholder="Brief description"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Incident Type *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {incidentTypes.find(t => t.value === incidentType)?.label}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {showTypeDropdown && (
                  <View style={styles.dropdownList}>
                    {incidentTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setIncidentType(type.value);
                          setShowTypeDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          incidentType === type.value && styles.dropdownItemSelected
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Details *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Describe the incident..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                />
              </View>

              {location && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.locationBox}>
                    <View style={styles.locationIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationCoords}>
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </Text>
                      <Text style={styles.locationSubtext}>Auto-detected</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Photos (Optional, max 5)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity style={styles.addImageButton} onPress={showImagePickerOptions}>
                    <View style={styles.addImageIcon}>
                      <Text style={styles.addImageText}>+</Text>
                    </View>
                    <Text style={styles.addImageLabel}>Add</Text>
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
                  <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
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
  addButton: { backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: 'white', fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#FEE2E2', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  incidentIcon: { width: 60, height: 60, borderWidth: 3, borderColor: '#EF4444', borderRadius: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  incidentCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  incidentTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  incidentType: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },
  progressSteps: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStep: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  progressStepActive: { backgroundColor: '#3B82F6' },
  incidentDetails: { fontSize: 14, color: '#374151', marginBottom: 12 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, marginBottom: 12 },
  locationIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', marginRight: 8 },
  locationText: { flex: 1, fontSize: 12, color: '#6B7280' },
  responseCard: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#3B82F6' },
  responseLabel: { fontSize: 12, fontWeight: '600', color: '#1E40AF', marginBottom: 4 },
  responseText: { fontSize: 13, color: '#1E3A8A' },
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
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14 },
  dropdownText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  dropdownArrow: { fontSize: 10, color: '#6B7280' },
  dropdownList: { marginTop: 8, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', maxHeight: 200 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 15, color: '#374151' },
  dropdownItemSelected: { color: '#3B82F6', fontWeight: '600' },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 12, padding: 12 },
  locationCoords: { fontSize: 13, color: '#166534', fontWeight: '600' },
  locationSubtext: { fontSize: 11, color: '#16A34A', marginTop: 2 },
  addImageButton: { width: 80, height: 100, borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addImageIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  addImageText: { fontSize: 20, color: '#6B7280' },
  addImageLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  imageContainer: { marginRight: 12, position: 'relative' },
  selectedImage: { width: 80, height: 100, borderRadius: 12 },
  removeImage: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  removeText: { color: 'white', fontSize: 14, fontWeight: '700' },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 40 },
  cancelButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  submitButton: { flex: 1, backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});

export default IncidentsScreen;

