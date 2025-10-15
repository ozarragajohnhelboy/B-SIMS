import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

const WelcomeScreen = ({ onGetStarted }) => {
  const { settings } = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {settings.customLogo ? (
            <Image source={{ uri: settings.customLogo }} style={styles.logoImage} />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: settings.sidebarColor }]}>
              <Text style={styles.logoText}>{settings.appName}</Text>
            </View>
          )}
        </View>

        <Text style={styles.welcomeText}>
          Welcome to {settings.barangayName}
        </Text>
        <Text style={styles.description}>
          Your digital gateway to barangay services and information
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: settings.sidebarColor }]}>
              <View style={styles.iconWrapper}>
                <View style={styles.phoneIcon} />
              </View>
            </View>
            <Text style={styles.featureText}>Easy Access</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: settings.sidebarColor }]}>
              <View style={styles.iconWrapper}>
                <View style={styles.documentIcon} />
              </View>
            </View>
            <Text style={styles.featureText}>Document Requests</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: settings.sidebarColor }]}>
              <View style={styles.iconWrapper}>
                <View style={styles.announcementIcon} />
              </View>
            </View>
            <Text style={styles.featureText}>Announcements</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: settings.sidebarColor }]}
          onPress={onGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Barangay Information Management System
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
    marginBottom: 20,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 4,
    position: 'relative',
  },
  documentIcon: {
    width: 14,
    height: 18,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 2,
    position: 'relative',
  },
  announcementIcon: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    borderTopWidth: 0,
    position: 'relative',
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default WelcomeScreen;