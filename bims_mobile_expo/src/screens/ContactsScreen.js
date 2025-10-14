import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContactsScreen = ({ navigation }) => {
  const [barangayName, setBarangayName] = useState('Barangay');
  const [sidebarColor, setSidebarColor] = useState('#3b82f6');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedName = await AsyncStorage.getItem('barangayName');
        const savedColor = await AsyncStorage.getItem('sidebarColor');
        
        if (savedName) setBarangayName(savedName);
        if (savedColor) setSidebarColor(savedColor);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleCall = (number) => {
    const phoneUrl = `tel:${number}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Unable to make a call from this device');
        }
      })
      .catch((err) => console.error('Error making call:', err));
  };

  const emergencyContacts = [
    {
      title: 'Emergency Hotline',
      number: '911',
      description: 'For immediate emergencies',
      color: '#ef4444',
    },
    {
      title: 'Barangay Hall',
      number: '(02) 8123-4567',
      description: 'Main office contact',
      color: '#3b82f6',
    },
    {
      title: 'Barangay Health Center',
      number: '(02) 8234-5678',
      description: 'Medical assistance',
      color: '#10b981',
    },
    {
      title: 'Police Assistance',
      number: '(02) 8345-6789',
      description: 'Security and safety',
      color: '#f59e0b',
    },
  ];

  const officials = [
    {
      position: 'Barangay Captain',
      name: 'Hon. Juan Dela Cruz',
      contact: '(02) 8456-7890',
    },
    {
      position: 'Barangay Secretary',
      name: 'Maria Santos',
      contact: '(02) 8567-8901',
    },
    {
      position: 'Barangay Treasurer',
      name: 'Pedro Reyes',
      contact: '(02) 8678-9012',
    },
    {
      position: 'SK Chairman',
      name: 'Ana Garcia',
      contact: '(02) 8789-0123',
    },
  ];

  const services = [
    {
      service: 'Fire Station',
      contact: '(02) 8890-1234',
    },
    {
      service: 'Water District',
      contact: '(02) 8901-2345',
    },
    {
      service: 'Electric Company',
      contact: '(02) 9012-3456',
    },
    {
      service: 'Waste Management',
      contact: '(02) 9123-4567',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backIconContainer}>
              <View style={styles.backIconArrow} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>{barangayName} Directory</Text>
          <Text style={styles.welcomeText}>
            Important contacts and emergency numbers for your convenience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.contactContent}>
                <View style={[styles.contactIcon, { backgroundColor: contact.color }]} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{contact.title}</Text>
                  <Text style={styles.contactDescription}>{contact.description}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
              </View>
              <View style={styles.callButton}>
                <Text style={[styles.callButtonText, { color: contact.color }]}>Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barangay Officials</Text>
          {officials.map((official, index) => (
            <TouchableOpacity
              key={index}
              style={styles.officialCard}
              onPress={() => handleCall(official.contact)}
            >
              <View style={styles.officialInfo}>
                <View style={styles.officialAvatar}>
                  <Text style={styles.officialAvatarText}>{official.name[0]}</Text>
                </View>
                <View style={styles.officialDetails}>
                  <Text style={styles.officialPosition}>{official.position}</Text>
                  <Text style={styles.officialName}>{official.name}</Text>
                  <Text style={styles.officialContact}>{official.contact}</Text>
                </View>
              </View>
              <View style={[styles.callButton, { backgroundColor: sidebarColor }]}>
                <Text style={styles.callButtonTextWhite}>Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Services</Text>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceCard}
              onPress={() => handleCall(service.contact)}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.service}</Text>
                <Text style={styles.serviceContact}>{service.contact}</Text>
              </View>
              <View style={styles.callIconContainer}>
                <View style={styles.phoneIconWrapper}>
                  <View style={styles.phoneIconBody} />
                  <View style={styles.phoneIconHandle} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note:</Text>
          <Text style={styles.noteText}>
            These contact numbers are for emergency and official purposes only. Please use them responsibly.
          </Text>
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
  content: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#3b82f6',
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  callButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  callButtonTextWhite: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  officialCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  officialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  officialAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  officialAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
  },
  officialDetails: {
    flex: 1,
  },
  officialPosition: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  officialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  officialContact: {
    fontSize: 14,
    color: '#3b82f6',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceContact: {
    fontSize: 14,
    color: '#64748b',
  },
  callIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIconWrapper: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIconBody: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 3,
    transform: [{ rotate: '-25deg' }],
  },
  phoneIconHandle: {
    width: 4,
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    position: 'absolute',
    bottom: 1,
    right: 1,
  },
  noteCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});

export default ContactsScreen;

