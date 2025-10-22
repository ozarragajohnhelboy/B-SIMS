import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import BarangayIDScreen from './src/screens/BarangayIDScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import { View, Text, StyleSheet, Image } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [showWelcome, setShowWelcome] = useState(true);

  if (isLoading || settingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          {settings.customLogo ? (
            <Image source={{ uri: settings.customLogo }} style={styles.logoImage} />
          ) : (
            <View style={[styles.logo, { backgroundColor: settings.sidebarColor }]}>
              <Text style={styles.logoText}>{settings.appName}</Text>
            </View>
          )}
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (showWelcome && !isAuthenticated) {
    return (
      <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            {needsOnboarding ? (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
              <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
                <Stack.Screen name="BarangayID" component={BarangayIDScreen} />
                <Stack.Screen name="Contacts" component={ContactsScreen} />
                <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SettingsProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
});

export default App;