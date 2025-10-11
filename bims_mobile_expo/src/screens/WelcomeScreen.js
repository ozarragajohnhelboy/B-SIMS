import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsAPI } from '../services/settingsAPI';

const WelcomeScreen = ({ onGetStarted }) => {
  const [customLogo, setCustomLogo] = useState(null);
  const [sidebarColor, setSidebarColor] = useState('#3b82f6');
  const [barangayName, setBarangayName] = useState('B-SIMS');

  useEffect(() => {
    const loadCustomSettings = async () => {
      try {
        const savedLogo = await AsyncStorage.getItem('customLogo');
        const savedColor = await AsyncStorage.getItem('sidebarColor');
        const savedBarangayName = await AsyncStorage.getItem('barangayName');
        
        if (savedLogo) {
          setCustomLogo(savedLogo);
        } else {
          try {
            const settings = await settingsAPI.getSettings();
            if (settings.customLogo) {
              setCustomLogo(settings.customLogo);
              await AsyncStorage.setItem('customLogo', settings.customLogo);
            }
          } catch (error) {
            console.error('Error fetching settings:', error);
          }
        }
        
        if (savedColor) {
          setSidebarColor(savedColor);
        } else {
          try {
            const settings = await settingsAPI.getSettings();
            if (settings.sidebarColor) {
              setSidebarColor(settings.sidebarColor);
              await AsyncStorage.setItem('sidebarColor', settings.sidebarColor);
            }
          } catch (error) {
            console.error('Error fetching settings:', error);
          }
        }
        
        if (savedBarangayName) {
          setBarangayName(savedBarangayName);
        } else {
          try {
            const settings = await settingsAPI.getSettings();
            const name = settings.barangayName || settings.barangay_name;
            if (name) {
              setBarangayName(name);
              await AsyncStorage.setItem('barangayName', name);
            }
          } catch (error) {
            console.error('Error fetching settings:', error);
          }
        }
      } catch (error) {
        console.error('Error loading custom settings:', error);
      }
    };
    loadCustomSettings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {customLogo ? (
            <Image source={{ uri: customLogo }} style={styles.logoImage} />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: sidebarColor }]}>
              <Text style={styles.logoText}>B-SIMS</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.barangayTitle}>{barangayName}</Text>
        <Text style={styles.subtitle}>Barangay Information Management System</Text>
        
        <Text style={styles.description}>
          Your gateway to barangay services and community information. 
          Access documents, announcements, and stay connected with your barangay.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.documentIcon}>
              <View style={styles.documentLine1} />
              <View style={styles.documentLine2} />
              <View style={styles.documentLine3} />
            </View>
            <Text style={styles.featureTitle}>Document Requests</Text>
            <Text style={styles.featureDescription}>Request barangay certificates and clearances</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.announcementIcon}>
              <View style={styles.announcementWave1} />
              <View style={styles.announcementWave2} />
              <View style={styles.announcementWave3} />
            </View>
            <Text style={styles.featureTitle}>Announcements</Text>
            <Text style={styles.featureDescription}>Stay updated with community news</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.financialIcon}>
              <View style={styles.chartBar1} />
              <View style={styles.chartBar2} />
              <View style={styles.chartBar3} />
            </View>
            <Text style={styles.featureTitle}>Financial Transparency</Text>
            <Text style={styles.featureDescription}>View barangay financial reports</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: sidebarColor }]} onPress={onGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  welcomeText: {
    fontSize: 20,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  barangayTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
  documentIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentLine1: {
    position: 'absolute',
    width: 12,
    height: 1,
    backgroundColor: 'white',
    top: 8,
  },
  documentLine2: {
    position: 'absolute',
    width: 10,
    height: 1,
    backgroundColor: 'white',
    top: 12,
  },
  documentLine3: {
    position: 'absolute',
    width: 8,
    height: 1,
    backgroundColor: 'white',
    top: 16,
  },
  announcementIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementWave1: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    top: 4,
    left: 4,
  },
  announcementWave2: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
    top: 9,
    left: 9,
  },
  announcementWave3: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
    top: 14,
    left: 10,
  },
  financialIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 2,
  },
  chartBar1: {
    width: 3,
    height: 8,
    backgroundColor: 'white',
    marginHorizontal: 1,
  },
  chartBar2: {
    width: 3,
    height: 12,
    backgroundColor: 'white',
    marginHorizontal: 1,
  },
  chartBar3: {
    width: 3,
    height: 6,
    backgroundColor: 'white',
    marginHorizontal: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
