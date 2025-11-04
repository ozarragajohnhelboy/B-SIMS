import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  TextInput,
} from 'react-native';
import { projectsAPI } from '../services/api';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total_projects: 0,
    ongoing_projects: 0,
    completed_projects: 0,
    total_budget: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, statsRes] = await Promise.allSettled([
        projectsAPI.getProjects(),
        projectsAPI.getProjectStats(),
      ]);

      if (projectsRes.status === 'fulfilled') {
        const data = projectsRes.value.results || projectsRes.value || [];
        setProjects(data);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value || stats);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#FBBF24',
      ongoing: '#3B82F6',
      completed: '#10B981',
      cancelled: '#EF4444',
      on_hold: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      planning: 'Planning',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      on_hold: 'On Hold',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      project.title?.toLowerCase().includes(search) ||
      project.description?.toLowerCase().includes(search) ||
      project.location?.toLowerCase().includes(search) ||
      project.project_type_name?.toLowerCase().includes(search) ||
      project.project_number?.toLowerCase().includes(search) ||
      getStatusLabel(project.status)?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const renderProjectCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.projectTitle}>{item.title}</Text>
            <Text style={styles.projectNumber}>{item.project_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.projectTypeBadge}>
          <Text style={styles.projectTypeText}>{item.project_type_name}</Text>
        </View>

        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.projectDetails}>
          <View style={styles.projectDetailRow}>
            <View style={[styles.projectDetailIcon, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.projectDetailText}>
              {formatDate(item.start_date)} - {formatDate(item.end_date)}
            </Text>
          </View>

          <View style={styles.projectDetailRow}>
            <View style={[styles.projectDetailIcon, { backgroundColor: '#10B981' }]} />
            <Text style={styles.projectDetailText}>₱{parseFloat(item.budget_allocated || 0).toLocaleString()}</Text>
          </View>

          <View style={styles.projectDetailRow}>
            <View style={[styles.projectDetailIcon, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.projectDetailText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress_percentage || 0}%`, backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.progressText}>{item.progress_percentage || 0}%</Text>
        </View>
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
          <Text style={styles.headerTitle}>Barangay Projects</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredProjects.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            setCurrentPage(1);
          }}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.statValue, { color: '#1E40AF' }]}>{stats.total_projects}</Text>
              <Text style={[styles.statLabel, { color: '#3B82F6' }]}>Total Projects</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.statValue, { color: '#065F46' }]}>{stats.ongoing_projects}</Text>
              <Text style={[styles.statLabel, { color: '#10B981' }]}>Ongoing</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E9D5FF' }]}>
              <Text style={[styles.statValue, { color: '#6B21A8' }]}>{stats.completed_projects}</Text>
              <Text style={[styles.statLabel, { color: '#8B5CF6' }]}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statValue, { color: '#92400E' }]}>₱{parseFloat(stats.total_budget || 0).toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: '#F59E0B' }]}>Total Budget</Text>
            </View>
          </View>
        </View>

        {loading && projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading projects...</Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <View style={styles.projectIcon} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchTerm ? 'No projects found' : 'No Projects'}
            </Text>
            <Text style={styles.emptyText}>
              {searchTerm ? 'Try different search terms' : 'No public projects available'}
            </Text>
          </View>
        ) : (
          <View style={styles.projectsList}>
            <FlatList
              data={paginatedProjects}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderProjectCard}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
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
          </View>
        )}
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
  content: {
    flex: 1,
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
  statsContainer: {
    padding: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  projectNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  projectTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  projectTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectDetails: {
    marginBottom: 12,
  },
  projectDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectDetailIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  projectDetailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    minWidth: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 16,
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
  projectIcon: {
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

export default ProjectsScreen;

