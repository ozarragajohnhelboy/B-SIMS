import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsAPI } from '../services/settingsAPI';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [customLogo, setCustomLogo] = useState(null);
  const [sidebarColor, setSidebarColor] = useState('#3b82f6');
  const [barangayName, setBarangayName] = useState('B-SIMS');
  const { login } = useAuth();

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

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData);
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          {customLogo ? (
            <Image source={{ uri: customLogo }} style={styles.logoImageLarge} />
          ) : (
            <View style={[styles.logo, { backgroundColor: sidebarColor }]}>
              <Text style={styles.logoText}>{barangayName}</Text>
            </View>
          )}
          <Text style={styles.barangayNameText}>{barangayName}</Text>
          <Text style={styles.subtitle}>Barangay Information Management System</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.description}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: sidebarColor }, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Register Here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  barangayNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
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
    backgroundColor: '#f9fafb',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748b',
    fontSize: 16,
  },
  registerText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LoginScreen;
