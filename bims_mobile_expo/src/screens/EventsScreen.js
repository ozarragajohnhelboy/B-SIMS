import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import * as Calendar from 'expo-calendar';
import { projectsAPI } from '../services/api';

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEvents();
    requestCalendarPermissions();
  }, []);

  const requestCalendarPermissions = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        console.log('Calendar permission not granted');
      }
    } catch (error) {
      console.error('Calendar permission error:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getEvents();
      const data = response.results || response || [];
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.start_datetime);
        const dateB = new Date(b.start_datetime);
        return dateA - dateB;
      });
      setEvents(sorted);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const getEventTypeLabel = (type) => {
    const types = {
      meeting: 'Meeting',
      festival: 'Festival',
      training: 'Training',
      health: 'Health Program',
      sports: 'Sports',
      other: 'Other',
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: '#3B82F6',
      festival: '#F59E0B',
      training: '#10B981',
      health: '#EF4444',
      sports: '#8B5CF6',
      other: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'past';
  };

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      event.title?.toLowerCase().includes(search) ||
      event.description?.toLowerCase().includes(search) ||
      event.location?.toLowerCase().includes(search) ||
      getEventTypeLabel(event.event_type)?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const addToCalendar = async (event) => {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Calendar.requestCalendarPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Calendar permission is required to add events');
          return;
        }
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar available');
        return;
      }

      const eventStart = new Date(event.start_datetime);
      const eventEnd = new Date(event.end_datetime);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: event.title,
        startDate: eventStart,
        endDate: eventEnd,
        location: event.location,
        notes: event.description,
        timeZone: 'Asia/Manila',
      });

      Alert.alert('Success', 'Event added to calendar');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add event to calendar');
    }
  };

  const renderEventCard = ({ item }) => {
    const status = getEventStatus(item);
    const typeColor = getEventTypeColor(item.event_type);

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventHeaderLeft}>
            <View style={[styles.eventTypeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.eventTypeText, { color: typeColor }]}>
                {getEventTypeLabel(item.event_type)}
              </Text>
            </View>
            {status === 'ongoing' && (
              <View style={styles.ongoingBadge}>
                <Text style={styles.ongoingText}>ONGOING</Text>
              </View>
            )}
            {status === 'past' && (
              <View style={styles.pastBadge}>
                <Text style={styles.pastText}>PAST</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.eventTitle}>{item.title}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <View style={styles.eventDetailIcon} />
            <Text style={styles.eventDetailText}>{formatDateTime(item.start_datetime)}</Text>
          </View>

          <View style={styles.eventDetailRow}>
            <View style={[styles.eventDetailIcon, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.eventDetailText}>{item.location}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {status === 'upcoming' && (
          <TouchableOpacity
            style={[styles.addCalendarButton, { borderColor: typeColor }]}
            onPress={() => addToCalendar(item)}
          >
            <Text style={[styles.addCalendarText, { color: typeColor }]}>
              Add to Calendar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
          <Text style={styles.headerTitle}>Events</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredEvents.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            setCurrentPage(1);
          }}
        />
      </View>

      {loading && events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading events...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <View style={styles.calendarIcon} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchTerm ? 'No events found' : 'No Events'}
          </Text>
          <Text style={styles.emptyText}>
            {searchTerm ? 'Try different search terms' : 'No upcoming events scheduled'}
          </Text>
        </View>
        ) : (
        <FlatList
          data={paginatedEvents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={true}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>Previous</Text>
                </TouchableOpacity>
                <Text style={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
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
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  countBadge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 12,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 0,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ongoingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ongoingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  pastBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pastText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  eventDetailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  addCalendarButton: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addCalendarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#FEE2E2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarIcon: {
    width: 60,
    height: 60,
    borderWidth: 3,
    borderColor: '#EF4444',
    borderRadius: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default EventsScreen;

