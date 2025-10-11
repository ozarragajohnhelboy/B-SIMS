import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const BarangayIDScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [sidebarColor, setSidebarColor] = useState('#3b82f6');
  const [barangayName, setBarangayName] = useState('Barangay');
  const [customLogo, setCustomLogo] = useState(null);

  useEffect(() => {
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
    loadSettings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barangay ID</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.idCard}>
          <View style={[styles.idHeader, { backgroundColor: sidebarColor }]}>
            <View style={styles.idHeaderContent}>
              {customLogo ? (
                <Image source={{ uri: customLogo }} style={styles.idLogo} />
              ) : (
                <View style={styles.idLogoPlaceholder}>
                  <Text style={styles.idLogoText}>{barangayName[0]}</Text>
                </View>
              )}
              <Text style={styles.idBarangayName}>{barangayName}</Text>
              <Text style={styles.idSubtitle}>BARANGAY IDENTIFICATION CARD</Text>
            </View>
          </View>

          <View style={styles.idBody}>
            <View style={styles.photoContainer}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.idName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.idResidentId}>ID: RES-{user?.id}</Text>

              <View style={styles.idDetailRow}>
                <Text style={styles.idLabel}>Date of Birth:</Text>
                <Text style={styles.idValue}>January 1, 1990</Text>
              </View>

              <View style={styles.idDetailRow}>
                <Text style={styles.idLabel}>Address:</Text>
                <Text style={styles.idValue}>Purok 1, {barangayName}</Text>
              </View>

              <View style={styles.idDetailRow}>
                <Text style={styles.idLabel}>Contact:</Text>
                <Text style={styles.idValue}>{user?.contact_number || 'Not set'}</Text>
              </View>

              <View style={styles.idDetailRow}>
                <Text style={styles.idLabel}>Emergency Contact:</Text>
                <Text style={styles.idValue}>Not set</Text>
              </View>
            </View>
          </View>

          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <View style={styles.qrGrid}>
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                  <View style={styles.qrBlock} />
                </View>
              </View>
              <Text style={styles.qrText}>Scan to verify identity</Text>
              <Text style={styles.qrId}>QR-{user?.id}-2025</Text>
            </View>
          </View>

          <View style={styles.idFooter}>
            <Text style={styles.footerText}>
              This card is the property of {barangayName}
            </Text>
            <Text style={styles.footerText}>
              If found, please return to Barangay Hall
            </Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Important Notes:</Text>
          <Text style={styles.noteText}>
            This is your official Barangay ID. Please keep it safe and present when requesting barangay services.
          </Text>
          <Text style={styles.noteText}>
            The QR code can be scanned at the Barangay Hall for quick verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  idCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  idHeader: {
    padding: 20,
    alignItems: 'center',
  },
  idHeaderContent: {
    alignItems: 'center',
  },
  idLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  idLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  idLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  idBarangayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  idSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  idBody: {
    padding: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#64748b',
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  idName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  idResidentId: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  idDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  idLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  idValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  qrSection: {
    padding: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  qrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 90,
    height: 90,
  },
  qrBlock: {
    width: 28,
    height: 28,
    backgroundColor: '#1e293b',
    margin: 1,
  },
  qrText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  qrId: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  idFooter: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  noteCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default BarangayIDScreen;

