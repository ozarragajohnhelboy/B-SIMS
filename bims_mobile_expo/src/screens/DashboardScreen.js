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
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { documentsAPI, announcementsAPI, projectsAPI } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [dashboardData, setDashboardData] = useState({
    activeRequests: 0,
    announcements: 0,
    upcomingEvents: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [documentsRes, announcementsRes, eventsRes, announcementStatsRes] = await Promise.allSettled([
        documentsAPI.getMyRequests(),
        announcementsAPI.getAnnouncements(),
        projectsAPI.getUpcomingEvents(),
        announcementsAPI.getStats(),
      ]);

      const activeRequests = documentsRes.status === 'fulfilled' 
        ? documentsRes.value.filter(doc => doc.status === 'pending' || doc.status === 'approved').length 
        : 0;

      const announcements = announcementStatsRes.status === 'fulfilled'
        ? (announcementStatsRes.value?.published_announcements ?? 0)
        : (announcementsRes.status === 'fulfilled'
            ? announcementsRes.value.length
            : 0);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: settings.sidebarColor }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[settings.sidebarColor]}
            tintColor={settings.sidebarColor}
          />
        }
      >
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {summaryCards.map((card, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: card.color }]}>
                <View style={styles.statCardContent}>
                  <Text style={styles.statCount}>{card.count}</Text>
                  <Text style={styles.statTitle}>{card.title}</Text>
                </View>
                <View style={styles.statCardCorner} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          
          <View style={styles.servicesGrid}>
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#EEF2FF' }]}>
                <View style={styles.profileIconWrapper}>
                  <View style={styles.profileIconHead} />
                  <View style={styles.profileIconBody} />
                </View>
              </View>
              <Text style={styles.serviceTitle}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('BarangayID')}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#ECFDF5' }]}>
                <View style={styles.idCardIconWrapper}>
                  <View style={styles.idCardIconBorder} />
                  <View style={styles.idCardIconLine1} />
                  <View style={styles.idCardIconLine2} />
                </View>
              </View>
              <Text style={styles.serviceTitle}>ID Card</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Contacts')}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#FEF3C7' }]}>
                <View style={styles.contactsIconWrapper}>
                  <View style={styles.contactsIconPhone} />
                  <View style={styles.contactsIconHandle} />
                </View>
              </View>
              <Text style={styles.serviceTitle}>Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard} activeOpacity={0.7} onPress={() => navigation.navigate('DocumentRequests')}>
              <View style={[styles.serviceIcon, { backgroundColor: '#FCE7F3' }]}>
                <View style={styles.documentsIconWrapper}>
                  <View style={styles.documentsIconPage} />
                  <View style={styles.documentsIconFold} />
                  <View style={styles.documentsIconLine1} />
                  <View style={styles.documentsIconLine2} />
                </View>
              </View>
              <Text style={styles.serviceTitle}>Documents</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard} activeOpacity={0.7} onPress={() => navigation.navigate('Announcements')}>
              <View style={[styles.serviceIcon, { backgroundColor: '#E0E7FF' }]}>
                <View style={styles.newsIconWrapper}>
                  <View style={styles.newsIconPaper} />
                  <View style={styles.newsIconLine1} />
                  <View style={styles.newsIconLine2} />
                  <View style={styles.newsIconLine3} />
                </View>
              </View>
              <Text style={[styles.serviceTitle, styles.serviceTitleSmall]} numberOfLines={1}>
                Announcements
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard} activeOpacity={0.7} onPress={handleLogout}>
              <View style={[styles.serviceIcon, { backgroundColor: '#FEE2E2' }]}>
                <View style={styles.logoutIconWrapper}>
                  <View style={styles.logoutIconDoor} />
                  <View style={styles.logoutIconArrow} />
                </View>
              </View>
              <Text style={styles.serviceTitle}>Logout</Text>
            </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  avatarButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 24,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    margin: 8,
    flex: 1,
    minWidth: '42%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  statCardContent: {
    position: 'relative',
    zIndex: 2,
  },
  statCardCorner: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.3,
  },
  quickAccessSection: {
    padding: 24,
    paddingTop: 4,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    width: '28%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
    marginBottom: 2,
  },
  profileIconBody: {
    width: 16,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#6366F1',
  },
  idCardIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCardIconBorder: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 3,
    position: 'absolute',
  },
  idCardIconLine1: {
    width: 10,
    height: 2,
    backgroundColor: '#10B981',
    position: 'absolute',
    top: 4,
  },
  idCardIconLine2: {
    width: 14,
    height: 2,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 4,
  },
  contactsIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsIconPhone: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 3,
    transform: [{ rotate: '-10deg' }],
  },
  contactsIconHandle: {
    width: 4,
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  documentsIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentsIconPage: {
    width: 16,
    height: 20,
    borderWidth: 2,
    borderColor: '#EC4899',
    borderRadius: 2,
    position: 'absolute',
  },
  documentsIconFold: {
    width: 6,
    height: 6,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#EC4899',
    position: 'absolute',
    top: -2,
    right: 2,
  },
  documentsIconLine1: {
    width: 8,
    height: 1.5,
    backgroundColor: '#EC4899',
    position: 'absolute',
    top: 6,
  },
  documentsIconLine2: {
    width: 10,
    height: 1.5,
    backgroundColor: '#EC4899',
    position: 'absolute',
    top: 10,
  },
  newsIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsIconPaper: {
    width: 18,
    height: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 2,
    position: 'absolute',
  },
  newsIconLine1: {
    width: 12,
    height: 1.5,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    top: 4,
  },
  newsIconLine2: {
    width: 10,
    height: 1.5,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    top: 8,
  },
  newsIconLine3: {
    width: 12,
    height: 1.5,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    top: 12,
  },
  logoutIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconDoor: {
    width: 14,
    height: 18,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 2,
    borderLeftWidth: 0,
    position: 'absolute',
    left: 2,
  },
  logoutIconArrow: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#EF4444',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: 4,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  serviceTitleSmall: {
    fontSize: 11,
  },
});

export default DashboardScreen;

