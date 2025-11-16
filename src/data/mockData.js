// src/data/mockData.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventManager from '../utils/EventManager'; // Добавьте этот импорт
// Mock user data
export const userData = {
   id: 1,
  name: 'Alexey Petrov',
  role: 'Running Club Member',
  avatar: 'https://via.placeholder.com/100/FF4444/FFFFFF?text=AP',
  stats: {
    visits: 12,
    events: 8,
    streak: 5,
  }
};

// Новые события на декабрь 2025
export const initialEvents = [
  {
    id: 1,
    title: 'Winter Marathon Training',
    type: 'training',
    date: '2025-12-05',
    time: '08:00',
    location: 'Central Park',
    coach: 'Coach Ivanov',
    participants: 15,
    maxParticipants: 25,
    signedUp: false,
    description: 'Special winter marathon preparation session with focus on cold weather running techniques'
  },
  {
    id: 2,
    title: 'Christmas Charity Run',
    type: 'competition',
    date: '2025-12-14',
    time: '10:00',
    location: 'City Stadium',
    coach: 'All Coaches',
    participants: 45,
    maxParticipants: 100,
    signedUp: false,
    description: 'Annual Christmas charity run supporting local children hospital'
  },
  {
    id: 3,
    title: 'New Year Yoga Retreat',
    type: 'workshop',
    date: '2025-12-21',
    time: '09:30',
    location: 'Yoga Studio',
    coach: 'Coach Elena',
    participants: 8,
    maxParticipants: 15,
    signedUp: false,
    description: 'Special yoga session for stress relief and New Year preparation'
  },
  {
    id: 4,
    title: 'Winter Strength Conditioning',
    type: 'training',
    date: '2025-12-08',
    time: '18:00',
    location: 'Main Gym',
    coach: 'Coach Maria',
    participants: 12,
    maxParticipants: 20,
    signedUp: false,
    description: 'Strength training focused on winter sports performance'
  },
  {
    id: 5,
    title: 'Holiday Cycling Tour',
    type: 'training',
    date: '2025-12-17',
    time: '11:00',
    location: 'Forest Park',
    coach: 'Coach David',
    participants: 6,
    maxParticipants: 12,
    signedUp: false,
    description: 'Scenic winter cycling tour through forest routes'
  },
  {
    id: 6,
    title: 'New Year Eve Special Workout',
    type: 'competition',
    date: '2025-12-31',
    time: '16:00',
    location: 'Main Gym',
    coach: 'All Coaches',
    participants: 28,
    maxParticipants: 50,
    signedUp: false,
    description: 'Special New Year Eve workout challenge with prizes'
  },
  {
    id: 7,
    title: 'Winter Swimming Session',
    type: 'training',
    date: '2025-12-12',
    time: '07:30',
    location: 'Olympic Pool',
    coach: 'Coach Anna',
    participants: 5,
    maxParticipants: 10,
    signedUp: false,
    description: 'Indoor swimming session with winter training techniques'
  },
  {
    id: 8,
    title: 'December Endurance Challenge',
    type: 'competition',
    date: '2025-12-28',
    time: '09:00',
    location: 'Mountain Trail',
    coach: 'Coach Ivanov',
    participants: 18,
    maxParticipants: 30,
    signedUp: false,
    description: 'Year-end endurance challenge on mountain trails'
  }
];

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profiles',
  USER_STATS: 'user_statss',
  USER_EVENTS: 'user_eventss',
  PARTNER_REQUESTS: 'partner_requestss'
};

// Events
export const EVENTS = {
  PROFILE_UPDATED: 'profileUpdateds',
  STATS_UPDATED: 'statsUpdateds',
  EVENTS_UPDATED: 'eventsUpdateds',
  DATA_CHANGED: 'dataChangeds'
};

// Local storage functions
export const Storage = {
  // Save data
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.log('Storage save error:', error);
      return false;
    }
  },

  // Get data
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value != null) {
        return JSON.parse(value);
      } else {
        // Return default data if no data in storage
        if (key === STORAGE_KEYS.USER_EVENTS) {
          return initialEvents;
        }
        return null;
      }
    } catch (error) {
      console.log('Storage get error:', error);
      return null;
    }
  },

  // Remove data
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.log('Storage remove error:', error);
      return false;
    }
  }
};
export { EventManager };

export default {
  userData,
  initialEvents,
  STORAGE_KEYS,
  EVENTS,
  EventManager,
  Storage
};