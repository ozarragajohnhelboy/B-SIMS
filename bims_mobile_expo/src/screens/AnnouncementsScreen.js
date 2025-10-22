import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, LayoutAnimation, Platform, UIManager } from 'react-native';
import { announcementsAPI } from '../services/api';

const AnnouncementsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    load();
  }, []);

  const load = async () => {
    try {
      const data = await announcementsAPI.getAnnouncements();
      // keep parity with admin: show published first
      const sorted = (data || []).sort((a, b) => new Date(b.created_at || b.published_at || 0) - new Date(a.created_at || a.published_at || 0));
      setItems(sorted);
    } catch (e) {
      // silent fail to keep UX clean
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusStyles = (status) => {
    const key = (status || '').toLowerCase();
    if (key === 'published') return { container: styles.statusPublished, text: styles.statusPublishedText };
    if (key === 'draft') return { container: styles.statusDraft, text: styles.statusDraftText };
    if (key === 'archived') return { container: styles.statusArchived, text: styles.statusArchivedText };
    return { container: styles.statusDefault, text: styles.statusDefaultText };
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpand(item.id)} style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.chevron, isExpanded && styles.chevronExpanded]} />
        </View>
        <View style={styles.rowBetween}>
          {item.category ? <Text style={styles.category}>{item.category.name || item.category}</Text> : <View />}
          <View style={[styles.statusPill, getStatusStyles(item.status).container]}>
            <Text style={[styles.statusText, getStatusStyles(item.status).text]}>
              {(item.status || 'published').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta} />
          {item.publish_date || item.created_at ? (
            <Text style={styles.meta}>{new Date(item.publish_date || item.created_at).toLocaleDateString()}</Text>
          ) : null}
        </View>
        {isExpanded && item.content ? (
          <View style={styles.expandedBox}>
            <Text style={styles.expandedText}>{item.content}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Announcements</Text>
          <View style={styles.countBadge}><Text style={styles.countText}>{items.length}</Text></View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerContainer: { backgroundColor: 'white', paddingTop: 60, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIconContainer: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  backIconArrow: { width: 12, height: 12, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#6B7280', transform: [{ rotate: '45deg' }] },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', letterSpacing: 0.3 },
  countBadge: { minWidth: 28, height: 24, paddingHorizontal: 6, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#6366F1', fontWeight: '700' },
  listContent: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  category: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  content: { fontSize: 14, color: '#374151' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  meta: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  expandedBox: { marginTop: 10, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  expandedText: { fontSize: 14, color: '#111827', lineHeight: 20 },
  chevron: { width: 10, height: 10, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#9CA3AF', transform: [{ rotate: '-45deg' }] },
  chevronExpanded: { transform: [{ rotate: '135deg' }] },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusPublished: { backgroundColor: '#ECFDF5' },
  statusPublishedText: { color: '#047857' },
  statusDraft: { backgroundColor: '#F3F4F6' },
  statusDraftText: { color: '#6B7280' },
  statusArchived: { backgroundColor: '#FEF2F2' },
  statusArchivedText: { color: '#B91C1C' },
  statusDefault: { backgroundColor: '#EFF6FF' },
  statusDefaultText: { color: '#1D4ED8' },
});

export default AnnouncementsScreen;


