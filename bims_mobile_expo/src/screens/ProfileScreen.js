import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { residentsAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    contact_number: '',
    email: '',
  });
  const [residentDetails, setResidentDetails] = useState(null);

  useEffect(() => {
    loadResidentData();
  }, []);

  const loadResidentData = async () => {
    try {
      if (user?.resident_id) {
        const data = await residentsAPI.getResident(user.resident_id);
        setResidentDetails(data);
        setProfileData({
          contact_number: data.emergency_contact_number || user.contact_number || '',
          email: user.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading resident data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleSave = async () => {
    try {
      if (user?.resident_id) {
        await residentsAPI.updateProfile(user.resident_id, profileData);
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
        loadResidentData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={[styles.actionButton, editing && styles.cancelButton]} 
            onPress={() => setEditing(!editing)}
          >
            <Text style={[styles.actionButtonText, editing && styles.cancelButtonText]}>
              {editing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Text>
            </View>
            <View style={styles.avatarBadge} />
          </View>
          <Text style={styles.nameText}>{user?.first_name} {user?.last_name}</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.roleText}>Verified Resident</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>ID: {residentDetails?.barangay_id || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{user?.first_name} {user?.last_name}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{residentDetails?.birth_date || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{residentDetails?.age || 'N/A'} years old</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{residentDetails?.gender || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Civil Status</Text>
              <Text style={styles.value}>{residentDetails?.civil_status || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {editing ? (
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.contact_number}
                  onChangeText={(value) => setProfileData({ ...profileData, contact_number: value })}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.email}
                  onChangeText={(value) => setProfileData({ ...profileData, email: value })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Contact Number</Text>
                <Text style={styles.value}>{profileData.contact_number || 'Not provided'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{user?.email || 'Not provided'}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Street Address</Text>
              <Text style={styles.value}>{residentDetails?.household?.address || 'Not provided'}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Purok</Text>
              <Text style={styles.value}>{residentDetails?.purok_name || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Household Number</Text>
              <Text style={styles.value}>{residentDetails?.household_number || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household Details</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Relationship to Head</Text>
              <Text style={styles.value}>
                {residentDetails?.relationship_to_head ? residentDetails.relationship_to_head.charAt(0).toUpperCase() + residentDetails.relationship_to_head.slice(1) : 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Occupation</Text>
              <Text style={styles.value}>{residentDetails?.occupation || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Voter Status</Text>
              <Text style={styles.value}>
                {residentDetails?.is_voter ? 'Registered Voter' : 'Not Registered'}
              </Text>
            </View>

            {(residentDetails?.is_pwd || residentDetails?.is_senior_citizen) && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Special Status</Text>
                  <View style={styles.badgeContainer}>
                    {residentDetails?.is_pwd && (
                      <View style={[styles.badge, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.badgeText}>PWD</Text>
                      </View>
                    )}
                    {residentDetails?.is_senior_citizen && (
                      <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.badgeText}>Senior Citizen</Text>
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Contact Person</Text>
              <Text style={styles.value}>{residentDetails?.emergency_contact_name || 'Not provided'}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Contact Number</Text>
              <Text style={styles.value}>{residentDetails?.emergency_contact_number || 'Not provided'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#6B7280',
    transform: [{ rotate: '45deg' }],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.3,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  roleText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  idBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  idBadgeText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoItem: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;

