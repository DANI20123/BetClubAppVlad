// src/screens/PartnersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomModal from '../components/Modal';
import { Storage, STORAGE_KEYS } from '../data/mockData';

const PartnersScreen = () => {
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActivity, setFilterActivity] = useState('all');

  const [newRequest, setNewRequest] = useState({
    activity: 'running',
    date: '',
    time: '',
    location: '',
    notes: '',
    level: 'intermediate'
  });

  useEffect(() => {
    loadPartnerRequests();
  }, []);

  const loadPartnerRequests = async () => {
    const savedRequests = await Storage.getItem(STORAGE_KEYS.PARTNER_REQUESTS);
    if (savedRequests) {
      setPartnerRequests(savedRequests);
    } else {
      // Initial mock data
      const initialRequests = [
        {
          id: 1,
          user: 'Michael S.',
          activity: 'running',
          date: 'Tomorrow',
          time: '18:00',
          location: 'Central Park',
          level: 'intermediate',
          notes: 'Looking for running partner for 10k training',
          createdAt: '2024-01-14'
        },
        {
          id: 2,
          user: 'Anna K.',
          activity: 'strength',
          date: 'Friday',
          time: '19:00',
          location: 'Main Gym',
          level: 'beginner',
          notes: 'Need spotter for weight training session',
          createdAt: '2024-01-14'
        },
        {
          id: 3,
          user: 'David L.',
          activity: 'yoga',
          date: 'Saturday',
          time: '09:00',
          location: 'Yoga Studio',
          level: 'advanced',
          notes: 'Partner for advanced yoga flow session',
          createdAt: '2024-01-13'
        }
      ];
      setPartnerRequests(initialRequests);
      await Storage.setItem(STORAGE_KEYS.PARTNER_REQUESTS, initialRequests);
    }
  };

  const savePartnerRequests = async (requests) => {
    setPartnerRequests(requests);
    await Storage.setItem(STORAGE_KEYS.PARTNER_REQUESTS, requests);
  };

  const handleCreateRequest = async () => {
    const newRequestObj = {
      id: Date.now(),
      user: 'You',
      ...newRequest,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedRequests = [newRequestObj, ...partnerRequests];
    await savePartnerRequests(updatedRequests);
    
    setCreateModalVisible(false);
    setNewRequest({
      activity: 'running',
      date: '',
      time: '',
      location: '',
      notes: '',
      level: 'intermediate'
    });
  };

  const handleJoinRequest = (request) => {
    setSelectedRequest(request);
    setDetailsModalVisible(true);
  };

  const confirmJoin = () => {
    // In a real app, this would send a notification/message
    setDetailsModalVisible(false);
    setSelectedRequest(null);
  };

  const getActivityColor = (activity) => {
    switch(activity) {
      case 'running': return '#00C851';
      case 'strength': return '#FF4444';
      case 'yoga': return '#33B5E5';
      case 'cycling': return '#FFBB33';
      default: return '#888';
    }
  };

  const getActivityIcon = (activity) => {
    switch(activity) {
      case 'running': return 'running';
      case 'strength': return 'dumbbell';
      case 'yoga': return 'spa';
      case 'cycling': return 'bicycle';
      default: return 'question';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return '#33B5E5';
      case 'intermediate': return '#00C851';
      case 'advanced': return '#FF4444';
      default: return '#888';
    }
  };

  const filteredRequests = partnerRequests.filter(request => {
    const matchesSearch = request.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActivity = filterActivity === 'all' || request.activity === filterActivity;
    return matchesSearch && matchesActivity;
  });

  const PartnerCard = ({ request }) => (
    <View style={styles.partnerCard}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.partnerGradient}>
        <View style={styles.partnerHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.activityIcon, { backgroundColor: getActivityColor(request.activity) }]}>
              <FontAwesome5 name={getActivityIcon(request.activity)} size={16} color="#FFF" />
            </View>
            <View>
              <Text style={styles.userName}>{request.user}</Text>
              <Text style={styles.requestDate}>Posted {request.createdAt}</Text>
            </View>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(request.level) }]}>
            <Text style={styles.levelText}>{request.level.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.activityType}>
          {request.activity.charAt(0).toUpperCase() + request.activity.slice(1)} Training
        </Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <FontAwesome5 name="calendar" size={12} color="#888" />
            <Text style={styles.detailText}>{request.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome5 name="clock" size={12} color="#888" />
            <Text style={styles.detailText}>{request.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome5 name="map-marker-alt" size={12} color="#888" />
            <Text style={styles.detailText}>{request.location}</Text>
          </View>
        </View>

        <Text style={styles.notes} numberOfLines={2}>
          {request.notes}
        </Text>

        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => handleJoinRequest(request)}
        >
          <Text style={styles.joinButtonText}>JOIN TRAINING</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
        <Text style={styles.headerTitle}>Training Partners</Text>
        <Text style={styles.headerSubtitle}>Find workout buddies</Text>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search partners..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityFilters}>
          {['all', 'running', 'strength', 'yoga', 'cycling'].map(activity => (
            <TouchableOpacity
              key={activity}
              style={[
                styles.activityFilter,
                filterActivity === activity && styles.activityFilterActive
              ]}
              onPress={() => setFilterActivity(activity)}
            >
              <Text style={[
                styles.activityFilterText,
                filterActivity === activity && styles.activityFilterTextActive
              ]}>
                {activity === 'all' ? 'All' : activity.charAt(0).toUpperCase() + activity.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Create New Request Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <LinearGradient colors={['#FF4444', '#CC0000']} style={styles.createButtonGradient}>
            <FontAwesome5 name="plus" size={20} color="#FFF" />
            <Text style={styles.createButtonText}>CREATE NEW REQUEST</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Partner Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Partners ({filteredRequests.length})
          </Text>
          
          {filteredRequests.length > 0 ? (
            filteredRequests.map(request => (
              <PartnerCard key={request.id} request={request} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome5 name="users" size={50} color="#666" />
              <Text style={styles.emptyStateText}>No partners found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try changing your search or create a new request
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Request Modal */}
     <CustomModal
  visible={createModalVisible}
  onClose={() => setCreateModalVisible(false)}
  title="Create Partner Request"
>
  <View style={styles.modalContent}>
    {/* Activity Type */}
    <View style={styles.modalSection}>
      <Text style={styles.modalLabel}>Activity Type</Text>
      <View style={styles.activityButtons}>
        {['running', 'strength', 'yoga', 'cycling'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.activityButton,
              newRequest.activity === activity && styles.activityButtonActive
            ]}
            onPress={() => setNewRequest({...newRequest, activity})}
          >
            <FontAwesome5 
              name={getActivityIcon(activity)} 
              size={16} 
              color={newRequest.activity === activity ? '#FFF' : '#888'} 
            />
            <Text style={[
              styles.activityButtonText,
              newRequest.activity === activity && styles.activityButtonTextActive
            ]}>
              {activity.charAt(0).toUpperCase() + activity.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Date and Time Row */}
    <View style={styles.modalRow}>
      <View style={styles.modalInputGroup}>
        <Text style={styles.modalLabel}>Date</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g., Tomorrow"
          placeholderTextColor="#666"
          value={newRequest.date}
          onChangeText={(text) => setNewRequest({...newRequest, date: text})}
        />
      </View>
      <View style={styles.modalInputGroup}>
        <Text style={styles.modalLabel}>Time</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g., 18:00"
          placeholderTextColor="#666"
          value={newRequest.time}
          onChangeText={(text) => setNewRequest({...newRequest, time: text})}
        />
      </View>
    </View>

    {/* Location */}
    <View style={styles.modalSection}>
      <Text style={styles.modalLabel}>Location</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="e.g., Central Park"
        placeholderTextColor="#666"
        value={newRequest.location}
        onChangeText={(text) => setNewRequest({...newRequest, location: text})}
      />
    </View>

    {/* Skill Level */}
    <View style={styles.modalSection}>
      <Text style={styles.modalLabel}>Skill Level</Text>
      <View style={styles.levelButtons}>
        {['beginner', 'intermediate', 'advanced'].map(level => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              newRequest.level === level && { backgroundColor: getLevelColor(level) }
            ]}
            onPress={() => setNewRequest({...newRequest, level})}
          >
            <Text style={styles.levelButtonText}>{level.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Additional Notes */}
    <View style={styles.modalSection}>
      <Text style={styles.modalLabel}>Additional Notes</Text>
      <TextInput
        style={styles.modalTextArea}
        placeholder="Describe what you're looking for..."
        placeholderTextColor="#666"
        multiline
        numberOfLines={3}
        value={newRequest.notes}
        onChangeText={(text) => setNewRequest({...newRequest, notes: text})}
      />
    </View>

    {/* Submit Button */}
    <TouchableOpacity 
      style={styles.submitButton}
      onPress={handleCreateRequest}
    >
      <Text style={styles.submitButtonText}>CREATE REQUEST</Text>
    </TouchableOpacity>
  </View>
</CustomModal>

      {/* Join Request Modal */}
      <CustomModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        title="Join Training Session"
      >
        {selectedRequest && (
          <>
            <View style={styles.requestDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Activity:</Text>
                <View style={styles.detailValue}>
                  <FontAwesome5 
                    name={getActivityIcon(selectedRequest.activity)} 
                    size={14} 
                    color={getActivityColor(selectedRequest.activity)} 
                  />
                  <Text style={styles.detailText}>
                    {selectedRequest.activity.charAt(0).toUpperCase() + selectedRequest.activity.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>When:</Text>
                <Text style={styles.detailText}>
                  {selectedRequest.date} at {selectedRequest.time}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Where:</Text>
                <Text style={styles.detailText}>{selectedRequest.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Level:</Text>
                <Text style={[styles.detailText, { color: getLevelColor(selectedRequest.level) }]}>
                  {selectedRequest.level.toUpperCase()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.detailText}>{selectedRequest.notes}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmJoin}
              >
                <Text style={styles.confirmButtonText}>SEND REQUEST</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  // Добавляем в styles в PartnersScreen.js

modalContent: {
  gap: 20,
},
modalSection: {
  gap: 8,
},
modalRow: {
  flexDirection: 'row',
  gap: 15,
},
modalInputGroup: {
  flex: 1,
  gap: 8,
},
modalLabel: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
modalInput: {
  backgroundColor: '#16213e',
  color: '#FFFFFF',
  padding: 12,
  borderRadius: 10,
  fontSize: 14,
  borderWidth: 1,
  borderColor: '#1a1a2e',
},
modalTextArea: {
  backgroundColor: '#16213e',
  color: '#FFFFFF',
  padding: 12,
  borderRadius: 10,
  fontSize: 14,
  borderWidth: 1,
  borderColor: '#1a1a2e',
  height: 80,
  textAlignVertical: 'top',
},
activityButtons: {
  flexDirection: 'row',
  gap: 8,
},
activityButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#16213e',
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#1a1a2e',
  gap: 6,
},
activityButtonActive: {
  backgroundColor: '#FF4444',
  borderColor: '#FF4444',
},
activityButtonText: {
  color: '#888',
  fontSize: 12,
  fontWeight: '600',
},
activityButtonTextActive: {
  color: '#FFFFFF',
},
levelButtons: {
  flexDirection: 'row',
  gap: 8,
},
levelButton: {
  flex: 1,
  backgroundColor: '#16213e',
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#1a1a2e',
  alignItems: 'center',
},
levelButtonText: {
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: 'bold',
},
submitButton: {
  backgroundColor: '#FF4444',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
},
submitButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 16,
  },
  filtersContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  activityFilters: {
    marginBottom: 10,
  },
  activityFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16213e',
    marginRight: 10,
  },
  activityFilterActive: {
    backgroundColor: '#FF4444',
  },
  activityFilterText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activityFilterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  createButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  partnerCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  partnerGradient: {
    padding: 20,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  requestDate: {
    color: '#888',
    fontSize: 10,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  activityType: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  notes: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 15,
  },
  joinButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  activityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  activityButtonActive: {
    backgroundColor: '#FF4444',
  },
  activityButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activityButtonTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#16213e',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  levelButton: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  levelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    gap: 6,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#FF4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default PartnersScreen;