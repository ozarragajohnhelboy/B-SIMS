import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { residentsAPI } from '../services/api';

const BarangayIDScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [sidebarColor, setSidebarColor] = useState('#3b82f6');
  const [barangayName, setBarangayName] = useState('Barangay');
  const [customLogo, setCustomLogo] = useState(null);
  const [residentDetails, setResidentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadResidentData();
  }, []);

  const loadSettings = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('sidebarColor');
      const savedName = await AsyncStorage.getItem('barangayName');
      const savedLogo = await AsyncStorage.getItem('customLogo');
      
      if (savedColor) setSidebarColor(savedColor);
      if (savedName) setBarangayName(savedName);
      if (savedLogo) setCustomLogo(savedLogo);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadResidentData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const data = await residentsAPI.getResident(user.id);
        setResidentDetails(data);
      }
    } catch (error) {
      console.log('Error loading resident data for ID (non-fatal):', error?.message || error);
      if (!error?.message?.includes('Network Error')) {
        Alert.alert('Error', 'Failed to load ID information');
      }
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>Digital ID</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading your ID...</Text>
          </View>
        ) : (
          <>
            <View style={styles.idCard}>
              <View style={[styles.idHeader, { backgroundColor: sidebarColor }]}>
                <View style={styles.headerPattern} />
                <View style={styles.idHeaderContent}>
                  {customLogo ? (
                    <Image source={{ uri: customLogo }} style={styles.idLogo} />
                  ) : (
                    <View style={styles.idLogoPlaceholder}>
                      <Text style={styles.idLogoText}>{barangayName[0]}</Text>
                    </View>
                  )}
                  <Text style={styles.idBarangayName}>{barangayName}</Text>
                  <Text style={styles.idSubtitle}>BARANGAY ID CARD</Text>
                </View>
              </View>

              <View style={styles.idBody}>
                <View style={styles.profileSection}>
                  <View style={styles.photoContainer}>
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoText}>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.nameSection}>
                    <Text style={styles.idName}>
                      {residentDetails?.full_name || `${user?.first_name} ${user?.last_name}`}
                    </Text>
                    <View style={styles.idBadgeContainer}>
                      <Text style={styles.idBadge}>{residentDetails?.barangay_id || 'N/A'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.idDetailRow}>
                    <Text style={styles.idLabel}>Birth Date</Text>
                    <Text style={styles.idValue}>{residentDetails?.birth_date || 'N/A'}</Text>
                  </View>

                  <View style={styles.idDetailRow}>
                    <Text style={styles.idLabel}>Age</Text>
                    <Text style={styles.idValue}>{residentDetails?.age || 'N/A'} years</Text>
                  </View>

                  <View style={styles.idDetailRow}>
                    <Text style={styles.idLabel}>Purok</Text>
                    <Text style={styles.idValue}>{residentDetails?.purok_name || 'N/A'}</Text>
                  </View>

                  <View style={styles.idDetailRow}>
                    <Text style={styles.idLabel}>Household</Text>
                    <Text style={styles.idValue}>{residentDetails?.household_number || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    {residentDetails?.qr_code ? (
                      <Image 
                        source={{ uri: residentDetails.qr_code }} 
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.qrPlaceholder}>
                        <View style={styles.qrGrid}>
                          <View style={styles.qrBlock} />
                          <View style={styles.qrBlock} />
                          <View style={styles.qrBlock} />
                          <View style={styles.qrBlock} />
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={styles.qrInfo}>
                    <Text style={styles.qrLabel}>SCAN TO VERIFY</Text>
                    <Text style={styles.qrId}>{residentDetails?.barangay_id || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.idFooter}>
                  <Text style={styles.footerLabel}>Emergency Contact</Text>
                  <Text style={styles.footerValue}>
                    {residentDetails?.emergency_contact_name || 'Not provided'}
                  </Text>
                  {residentDetails?.emergency_contact_number ? (
                    <Text style={styles.footerSubValue}>{residentDetails.emergency_contact_number}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Digital ID Information</Text>
              <Text style={styles.infoText}>
                Present this ID when accessing barangay services. The QR code provides instant verification at the Barangay Hall.
              </Text>
            </View>
          </>
        )}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  idCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 24,
  },
  idHeader: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ translateX: 40 }, { translateY: -40 }],
  },
  idHeaderContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  idLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  idLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  idLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  idBarangayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  idSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  idBody: {
    padding: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  photoContainer: {
    marginRight: 16,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  photoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  nameSection: {
    flex: 1,
  },
  idName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 26,
  },
  idBadgeContainer: {
    flexDirection: 'row',
  },
  idBadge: {
    fontSize: 13,
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 20,
  },
  idDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  idLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  idValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  qrContainer: {
    marginRight: 16,
  },
  qrPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  qrImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  qrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    height: 60,
  },
  qrBlock: {
    width: 14,
    height: 14,
    backgroundColor: '#111827',
    margin: 1,
  },
  qrInfo: {
    flex: 1,
  },
  qrLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  qrId: {
    fontSize: 16,
    color: '#111827',
    fontWeight: 'bold',
  },
  idFooter: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  footerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  footerSubValue: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
});

export default BarangayIDScreen;

