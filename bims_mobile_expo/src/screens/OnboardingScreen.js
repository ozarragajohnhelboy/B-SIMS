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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { residentsAPI } from '../services/api';

const OnboardingScreen = ({ navigation }) => {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    contact_number: '',
    address: '',
    purok: '',
    household_number: '',
    occupation: '',
    is_voter: false,
    is_pwd: false,
    is_senior_citizen: false,
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
  });

  const [puroks, setPuroks] = useState([]);
  const [households, setHouseholds] = useState([]);

  useEffect(() => {
    loadPuroks();
  }, []);

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

  const steps = [
    {
      title: 'Personal Information',
      fields: ['first_name', 'last_name', 'middle_name', 'birth_date', 'gender', 'marital_status'],
    },
    {
      title: 'Contact & Address',
      fields: ['contact_number', 'address', 'purok', 'household_number', 'occupation'],
    },
    {
      title: 'Additional Information',
      fields: ['is_voter', 'is_pwd', 'is_senior_citizen', 'emergency_contact_name', 'emergency_contact_number', 'emergency_contact_relationship'],
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'purok') {
      loadHouseholds(value);
      setFormData(prev => ({ ...prev, household_number: '' }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, birth_date: formattedDate }));
    }
  };

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    const requiredFields = step.fields.filter(field => 
      field !== 'middle_name' && 
      field !== 'is_voter' && 
      field !== 'is_pwd' && 
      field !== 'is_senior_citizen' &&
      field !== 'emergency_contact_name' &&
      field !== 'emergency_contact_number' &&
      field !== 'emergency_contact_relationship'
    );
    
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || value.toString().trim() === '' || value === 'Purok') {
        Alert.alert('Missing Information', `Please fill in all required fields in ${step.title}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const relationshipMap = {
        Mother: 'parent',
        Father: 'parent',
        Spouse: 'spouse',
        Son: 'child',
        Daughter: 'child',
        Brother: 'sibling',
        Sister: 'sibling',
        Other: 'other',
      };

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        birth_date: formData.birth_date,
        gender: formData.gender,
        marital_status: formData.marital_status,
        occupation: formData.occupation,
        household: formData.household_number ? parseInt(formData.household_number, 10) : null,
        relationship_to_head: relationshipMap[formData.emergency_contact_relationship] || 'other',
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        is_voter: !!formData.is_voter,
        is_pwd: !!formData.is_pwd,
        is_senior_citizen: !!formData.is_senior_citizen,
      };

      await residentsAPI.createResident(payload);
      await completeOnboarding();
      
      Alert.alert(
        'Profile Complete!',
        'Your profile has been successfully created. You can now access all features.',
        [{ text: 'Continue', onPress: () => navigation.replace('Dashboard') }]
      );
    } catch (error) {
      console.error('Error creating resident profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    switch (field) {
      case 'birth_date':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Birth Date *</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !formData.birth_date && styles.datePlaceholder]}>
                {formData.birth_date || 'Select birth date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={formData.birth_date ? new Date(formData.birth_date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );

      case 'gender':
        return (
          <View style={styles.radioGroup}>
            <Text style={styles.label}>Gender *</Text>
            {['male', 'female', 'other'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.radioOption, formData.gender === option && styles.radioSelected]}
                onPress={() => handleInputChange('gender', option)}
              >
                <View style={[styles.radioCircle, formData.gender === option && styles.radioCircleSelected]} />
                <Text style={[styles.radioText, formData.gender === option && styles.radioTextSelected]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'marital_status':
        return (
          <View style={styles.radioGroup}>
            <Text style={styles.label}>Marital Status *</Text>
            {['single', 'married', 'widowed', 'divorced'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.radioOption, formData.marital_status === option && styles.radioSelected]}
                onPress={() => handleInputChange('marital_status', option)}
              >
                <View style={[styles.radioCircle, formData.marital_status === option && styles.radioCircleSelected]} />
                <Text style={[styles.radioText, formData.marital_status === option && styles.radioTextSelected]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'purok':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Purok *</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger}
              onPress={() => {}}
            >
              <Text style={[styles.dropdownTriggerText, !formData.purok && styles.dropdownPlaceholder]}>
                {formData.purok ? puroks.find(p => p.id.toString() === formData.purok)?.name : 'Select Purok'}
              </Text>
            </TouchableOpacity>
            <ScrollView 
              style={styles.dropdownContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {puroks.map((purok) => (
                <TouchableOpacity
                  key={purok.id}
                  style={[styles.dropdownOption, formData.purok === purok.id.toString() && styles.dropdownSelected]}
                  onPress={() => handleInputChange('purok', purok.id.toString())}
                >
                  <Text style={[styles.dropdownText, formData.purok === purok.id.toString() && styles.dropdownTextSelected]}>
                    {purok.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'household_number':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Household Number *</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger}
              onPress={() => {}}
            >
              <Text style={[styles.dropdownTriggerText, !formData.household_number && styles.dropdownPlaceholder]}>
                {formData.household_number ? households.find(h => h.id.toString() === formData.household_number)?.household_number : 'Select Household'}
              </Text>
            </TouchableOpacity>
            <ScrollView 
              style={styles.dropdownContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {households.map((household) => (
                <TouchableOpacity
                  key={household.id}
                  style={[styles.dropdownOption, formData.household_number === household.id.toString() && styles.dropdownSelected]}
                  onPress={() => handleInputChange('household_number', household.id.toString())}
                >
                  <Text style={[styles.dropdownText, formData.household_number === household.id.toString() && styles.dropdownTextSelected]}>
                    {household.household_number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'is_voter':
      case 'is_pwd':
      case 'is_senior_citizen':
        return (
          <TouchableOpacity
            style={[styles.checkboxContainer, formData[field] && styles.checkboxSelected]}
            onPress={() => handleInputChange(field, !formData[field])}
          >
            <View style={[styles.checkbox, formData[field] && styles.checkboxChecked]} />
            <Text style={[styles.checkboxText, formData[field] && styles.checkboxTextSelected]}>
              {field === 'is_voter' ? 'Registered Voter (Optional)' : field === 'is_pwd' ? 'Person with Disability (Optional)' : 'Senior Citizen (Optional)'}
            </Text>
          </TouchableOpacity>
        );

      case 'emergency_contact_relationship':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emergency Contact Relationship</Text>
            <ScrollView 
              style={styles.dropdownContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {['Mother', 'Father', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'].map((relationship) => (
                <TouchableOpacity
                  key={relationship}
                  style={[styles.dropdownOption, formData.emergency_contact_relationship === relationship && styles.dropdownSelected]}
                  onPress={() => handleInputChange('emergency_contact_relationship', relationship)}
                >
                  <Text style={[styles.dropdownText, formData.emergency_contact_relationship === relationship && styles.dropdownTextSelected]}>
                    {relationship}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      default:
        const isOptional = ['emergency_contact_name', 'emergency_contact_number'].includes(field);
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {!isOptional && '*'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData[field]}
              onChangeText={(value) => handleInputChange(field, value)}
              placeholder={`Enter ${field.replace(/_/g, ' ')}`}
              keyboardType={field.includes('number') ? 'numeric' : 'default'}
            />
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>{steps[currentStep].title}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {steps[currentStep].fields.map((field) => (
            <View key={field}>
              {renderField(field)}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.nextButton, loading && styles.nextButtonDisabled]} 
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Creating...' : currentStep === steps.length - 1 ? 'Complete Profile' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
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
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  datePlaceholder: {
    color: '#9ca3af',
  },
  datePickerContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  doneButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  radioSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  radioTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    maxHeight: 200,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownSelected: {
    backgroundColor: '#eff6ff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkboxSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
  },
  checkboxTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default OnboardingScreen;
