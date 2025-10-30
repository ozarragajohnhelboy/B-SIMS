import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { residentsAPI } from '../services/api';

const ProfileSettingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [residentData, setResidentData] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    contact_number: '',
    address: '',
    occupation: '',
    relationship_to_head: '',
    is_voter: false,
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
  });

  const [puroks, setPuroks] = useState([]);
  const [households, setHouseholds] = useState([]);

  useEffect(() => {
    loadResidentData();
    loadPuroks();
  }, []);

  const loadResidentData = async () => {
    try {
      const resident = await residentsAPI.getResident(user.id);
      setResidentData(resident);
      setFormData({
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        middle_name: resident.middle_name || '',
        birth_date: resident.birth_date || '',
        gender: resident.gender || '',
        marital_status: resident.marital_status || '',
        contact_number: resident.contact_number || '',
        address: resident.address || '',
        occupation: resident.occupation || '',
        relationship_to_head: resident.relationship_to_head || '',
        is_voter: !!resident.is_voter,
        emergency_contact_name: resident.emergency_contact_name || '',
        emergency_contact_number: resident.emergency_contact_number || '',
        emergency_contact_relationship: resident.emergency_contact_relationship || '',
      });
      
      if (resident.household?.purok?.id) {
        loadHouseholds(resident.household.purok.id);
      }
    } catch (error) {
      console.error('Error loading resident data:', error);
    }
  };

  const loadPuroks = async () => {
    try {
      const response = await residentsAPI.getPuroks();
      setPuroks(response);
    } catch (error) {
      console.error('Error loading puroks:', error);
    }
  };

  const loadHouseholds = async (purokId) => {
    try {
      const response = await residentsAPI.getHouseholds(purokId);
      setHouseholds(response);
    } catch (error) {
      console.error('Error loading households:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Alert.alert('Missing Information', 'First name and last name are required.');
      return;
    }

    setLoading(true);
    try {
      await residentsAPI.updateProfile(user.id, formData);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, label, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        keyboardType={field.includes('number') ? 'numeric' : 'default'}
      />
    </View>
  );

  const renderChoiceRow = (field, label, options) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.choicePill,
              formData[field] === opt.value && styles.choicePillActive,
            ]}
            onPress={() => handleInputChange(field, opt.value)}
          >
            <Text
              style={[
                styles.choiceText,
                formData[field] === opt.value && styles.choiceTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!residentData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIconContainer}>
            <View style={styles.backIconArrow} />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Profile Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {residentData.first_name?.charAt(0)}{residentData.last_name?.charAt(0)}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>
            {residentData.first_name} {residentData.last_name}
          </Text>
          <Text style={styles.profileId}>ID: {residentData.barangay_id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {renderField('first_name', 'First Name', true)}
          {renderField('last_name', 'Last Name', true)}
          {renderField('middle_name', 'Middle Name')}
          {renderField('birth_date', 'Date of Birth')}
          {renderChoiceRow('gender', 'Gender', [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ])}
          {renderChoiceRow('marital_status', 'Civil Status', [
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'widowed', label: 'Widowed' },
            { value: 'divorced', label: 'Divorced' },
          ])}
          {renderField('contact_number', 'Contact Number')}
          {renderField('occupation', 'Occupation')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          {renderField('address', 'Address')}
          {residentData?.purok_name || residentData?.household_number ? (
            <View style={styles.readOnlyGroup}>
              {residentData?.purok_name ? (
                <View style={styles.readOnlyRow}>
                  <Text style={styles.readOnlyLabel}>Purok</Text>
                  <Text style={styles.readOnlyValue}>{residentData.purok_name}</Text>
                </View>
              ) : null}
              {residentData?.household_number ? (
                <View style={styles.readOnlyRow}>
                  <Text style={styles.readOnlyLabel}>Household Number</Text>
                  <Text style={styles.readOnlyValue}>{residentData.household_number}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          {renderField('emergency_contact_name', 'Emergency Contact Name')}
          {renderField('emergency_contact_number', 'Emergency Contact Number')}
          {renderField('emergency_contact_relationship', 'Contact Relationship')}
          {renderChoiceRow('relationship_to_head', 'Relationship to Head', [
            { value: 'head', label: 'Head' },
            { value: 'spouse', label: 'Spouse' },
            { value: 'child', label: 'Child' },
            { value: 'parent', label: 'Parent' },
            { value: 'sibling', label: 'Sibling' },
            { value: 'other', label: 'Other' },
          ])}
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Voter Status</Text>
            <TouchableOpacity
              style={[styles.switchBox, formData.is_voter && styles.switchBoxOn]}
              onPress={() => handleInputChange('is_voter', !formData.is_voter)}
            >
              <View style={[styles.switchKnob, formData.is_voter && styles.switchKnobOn]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#374151',
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  choicePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginRight: 8,
    marginBottom: 8,
  },
  choicePillActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  choiceText: {
    color: '#374151',
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#4f46e5',
  },
  readOnlyGroup: {
    marginTop: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  readOnlyValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  switchBox: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    padding: 3,
  },
  switchBoxOn: {
    backgroundColor: '#4ade80',
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },
  switchKnobOn: {
    marginLeft: 20,
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ProfileSettingsScreen;
