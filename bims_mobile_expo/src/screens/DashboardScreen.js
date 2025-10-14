import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { settingsAPI } from '../services/settingsAPI';
import { documentsAPI, announcementsAPI, projectsAPI } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [sidebarColor, setSidebarColor] = useState('#3b82f6');
  const [barangayName, setBarangayName] = useState('Barangay');
  const [dashboardData, setDashboardData] = useState({
    activeRequests: 0,
    announcements: 0,
    upcomingEvents: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadDashboardData();
  }, []);

  const loadSettings = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('sidebarColor');
      const savedName = await AsyncStorage.getItem('barangayName');
      
      if (savedColor) setSidebarColor(savedColor);
      if (savedName) setBarangayName(savedName);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [documentsRes, announcementsRes, eventsRes] = await Promise.allSettled([
        documentsAPI.getMyRequests(),
        announcementsAPI.getAnnouncements(),
        projectsAPI.getUpcomingEvents(),
      ]);

      const activeRequests = documentsRes.status === 'fulfilled' 
        ? documentsRes.value.filter(doc => doc.status === 'pending' || doc.status === 'approved').length 
        : 0;

      const announcements = announcementsRes.status === 'fulfilled'
        ? announcementsRes.value.filter(ann => ann.status === 'published').length
        : 0;

      const upcomingEvents = eventsRes.status === 'fulfilled'
        ? eventsRes.value.length
        : 0;

      setDashboardData({
        activeRequests,
        announcements,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => await logout(),
        },
      ]
    );
  };

  const summaryCards = [
    { title: 'Active Requests', count: dashboardData.activeRequests.toString(), color: '#3b82f6' },
    { title: 'Announcements', count: dashboardData.announcements.toString(), color: '#10b981' },
    { title: 'Upcoming Events', count: dashboardData.upcomingEvents.toString(), color: '#f59e0b' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: sidebarColor }]}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[sidebarColor]}
            tintColor={sidebarColor}
          />
        }
      >
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Account Status</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: user?.is_approved ? '#10b981' : '#f59e0b' }
          ]}>
            <Text style={styles.statusText}>
              {user?.is_approved ? 'Approved' : 'Pending Approval'}
            </Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.summaryGrid}>
            {summaryCards.map((card, index) => (
              <View key={index} style={[styles.summaryCard, { borderLeftColor: card.color }]}>
                <Text style={styles.summaryCount}>{card.count}</Text>
                <Text style={styles.summaryTitle}>{card.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.menuIconContainer}>
              <View style={styles.profileIcon} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My Profile</Text>
              <Text style={styles.menuSubtitle}>View and edit your information</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('BarangayID')}
          >
            <View style={styles.menuIconContainer}>
              <View style={styles.idIcon} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Barangay ID</Text>
              <Text style={styles.menuSubtitle}>View your QR code and ID</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Contacts')}
          >
            <View style={styles.menuIconContainer}>
              <View style={styles.contactIcon} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Barangay Contacts</Text>
              <Text style={styles.menuSubtitle}>Emergency and official contacts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <View style={styles.documentIcon} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Document Requests</Text>
              <Text style={styles.menuSubtitle}>Request certificates and clearances</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <View style={styles.announcementIcon} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Announcements</Text>
              <Text style={styles.menuSubtitle}>Latest news and updates</Text>
            </View>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    flex: 1,
    minWidth: '28%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
  },
  idIcon: {
    width: 24,
    height: 20,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  contactIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
  },
  documentIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  announcementIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ec4899',
    borderRadius: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
});

export default DashboardScreen;

