// src/screens/EventsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomModal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import { initialEvents, Storage, STORAGE_KEYS } from '../data/mockData';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const showAlert = (title, message, type = 'info', buttons = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, type, buttons });
    setAlertModalVisible(true);
  };

  const loadEvents = async () => {
    const userEvents = await Storage.getItem(STORAGE_KEYS.USER_EVENTS);
    if (userEvents) {
      setEvents(userEvents);
    } else {
      setEvents(initialEvents);
    }
  };

  const saveEvents = async (updatedEvents) => {
    setEvents(updatedEvents);
    await Storage.setItem(STORAGE_KEYS.USER_EVENTS, updatedEvents);
  };

  const handleSignup = (event) => {
    setSelectedEvent(event);
    setSignupModalVisible(true);
  };

  const confirmSignup = () => {
    const updatedEvents = events.map(event => 
      event.id === selectedEvent.id 
        ? { 
            ...event, 
            signedUp: !event.signedUp,
            participants: event.signedUp ? event.participants - 1 : event.participants + 1
          }
        : event
    );
    saveEvents(updatedEvents);
    setSignupModalVisible(false);
    
    showAlert(
      selectedEvent.signedUp ? 'Registration Cancelled' : 'Successfully Registered!',
      selectedEvent.signedUp 
        ? `You have cancelled your registration for "${selectedEvent.title}"`
        : `You are now registered for "${selectedEvent.title}" on ${selectedEvent.date}`,
      selectedEvent.signedUp ? 'info' : 'success',
      [{ text: 'GOT IT' }]
    );
    
    setSelectedEvent(null);
  };

  const showParticipants = (event) => {
    setSelectedEvent(event);
    setParticipantsModalVisible(true);
  };

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'training': return '#00C851';
      case 'workshop': return '#33B5E5';
      case 'competition': return '#FF4444';
      default: return '#888';
    }
  };

  const getEventTypeIcon = (type) => {
    switch(type) {
      case 'training': return 'running';
      case 'workshop': return 'users';
      case 'competition': return 'trophy';
      default: return 'calendar';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Group events by date for SectionList
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  const sections = Object.keys(groupedEvents)
    .sort()
    .map(date => ({
      title: formatDate(date),
      data: groupedEvents[date]
    }));

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.eventGradient}>
        <View style={styles.eventHeader}>
          <View style={styles.eventType}>
            <FontAwesome5 
              name={getEventTypeIcon(item.type)} 
              size={14} 
              color={getEventTypeColor(item.type)} 
              solid 
            />
            <Text style={[styles.eventTypeText, { color: getEventTypeColor(item.type) }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => showParticipants(item)}>
            <View style={styles.participants}>
              <FontAwesome5 name="users" size={12} color="#888" solid />
              <Text style={styles.participantsText}>
                {item.participants}/{item.maxParticipants}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailItem}>
            <FontAwesome5 name="clock" size={12} color="#888" solid />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome5 name="map-marker-alt" size={12} color="#888" solid />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.coachInfo}>
            <FontAwesome5 name="user" size={12} color="#00FF88" solid />
            <Text style={styles.coachText}>{item.coach}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.signupButton,
              item.signedUp && styles.signedUpButton
            ]}
            onPress={() => handleSignup(item)}
          >
            <Text style={[
              styles.signupButtonText,
              item.signedUp && styles.signedUpButtonText
            ]}>
              {item.signedUp ? 'REGISTERED' : 'SIGN UP'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
        <Text style={styles.headerTitle}>December 2025 Events</Text>
        <Text style={styles.headerSubtitle}>Winter Training & Competitions</Text>
      </LinearGradient>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEventItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Signup Modal */}
      <CustomModal
        visible={signupModalVisible}
        onClose={() => setSignupModalVisible(false)}
        title={selectedEvent?.signedUp ? 'Cancel Registration' : 'Confirm Registration'}
      >
        <Text style={styles.modalText}>
          {selectedEvent?.signedUp 
            ? `Are you sure you want to cancel your registration for "${selectedEvent?.title}"?`
            : `Confirm your registration for "${selectedEvent?.title}" on ${selectedEvent?.date} at ${selectedEvent?.time}?`
          }
        </Text>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setSignupModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalButton, styles.confirmButton]}
            onPress={confirmSignup}
          >
            <Text style={styles.confirmButtonText}>
              {selectedEvent?.signedUp ? 'CANCEL REG' : 'CONFIRM'}
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Participants Modal */}
      <CustomModal
        visible={participantsModalVisible}
        onClose={() => setParticipantsModalVisible(false)}
        title="Registered Participants"
      >
        <Text style={styles.participantsCount}>
          {selectedEvent?.participants} of {selectedEvent?.maxParticipants} spots filled
        </Text>
        <View style={styles.participantsList}>
          <Text style={styles.participantItem}>• Alexey Petrov (You)</Text>
          <Text style={styles.participantItem}>• Michael Johnson</Text>
          <Text style={styles.participantItem}>• Sarah Wilson</Text>
          <Text style={styles.participantItem}>• David Brown</Text>
          <Text style={styles.participantItem}>• Emma Davis</Text>
          {selectedEvent?.participants > 5 && (
            <Text style={styles.moreParticipants}>
              +{selectedEvent.participants - 5} more participants
            </Text>
          )}
        </View>
      </CustomModal>

      {/* Alert Modal */}
      <AlertModal
        visible={alertModalVisible}
        onClose={() => setAlertModalVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
      />
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
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  eventGradient: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDescription: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 16,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  signupButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  signedUpButton: {
    backgroundColor: '#00C851',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signedUpButtonText: {
    color: '#FFFFFF',
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
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
  participantsCount: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
  },
  participantsList: {
    gap: 8,
  },
  participantItem: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  moreParticipants: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default EventsScreen;