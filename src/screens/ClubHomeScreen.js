// src/screens/ClubHomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Storage, STORAGE_KEYS, userData as initialUserData } from '../data/mockData';

const ClubHomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(initialUserData);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [todayCheckIn, setTodayCheckIn] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadHomeData();
    }
  }, [isFocused]);

  const loadHomeData = async () => {
    await Promise.all([
      loadUserProfile(),
      loadEvents(),
      loadCheckInStatus(),
      loadPartnerRequests()
    ]);
    loadNews();
  };

  const loadUserProfile = async () => {
    const savedProfile = await Storage.getItem(STORAGE_KEYS.USER_PROFILE);
    const savedStats = await Storage.getItem(STORAGE_KEYS.USER_STATS);
    
    if (savedProfile) {
      setUser({
        ...savedProfile,
        stats: savedStats || savedProfile.stats || initialUserData.stats
      });
    } else if (savedStats) {
      setUser(prev => ({ 
        ...prev, 
        stats: savedStats 
      }));
    }
  };

  const loadEvents = async () => {
    const savedEvents = await Storage.getItem(STORAGE_KEYS.USER_EVENTS);
    if (savedEvents) {
      const upcoming = savedEvents
        .filter(event => !event.signedUp)
        .slice(0, 3);
      setUpcomingEvents(upcoming);
    }
  };

  const loadCheckInStatus = async () => {
    const checkinHistory = await Storage.getItem('checkin_history');
    if (checkinHistory) {
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = checkinHistory.find(entry => entry.date === today);
      setTodayCheckIn(!!todayCheckIn);
    }
  };

  const loadPartnerRequests = async () => {
    const partners = await Storage.getItem(STORAGE_KEYS.PARTNER_REQUESTS);
    if (partners) {
      setPartnerRequests(partners.slice(0, 2));
    }
  };

  const loadNews = () => {
    setRecentNews([
      {
        id: 1,
        title: 'New Yoga Classes Starting',
        date: '2 hours ago',
        important: true
      },
      {
        id: 2,
        title: 'Weekend Schedule Update',
        date: '1 day ago',
        important: false
      }
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'checkin':
        navigation.navigate('CheckIn');
        break;
      case 'events':
        navigation.navigate('Events');
        break;
      case 'partners':
        navigation.navigate('Partners');
        break;
      case 'stats':
        navigation.navigate('Statistics');
        break;
    }
  };

  const QuickActionCard = ({ title, subtitle, icon, color, onPress, disabled }) => (
    <TouchableOpacity 
      style={[styles.quickActionCard, disabled && styles.disabledCard]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient 
        colors={disabled ? ['#666', '#888'] : [color, `${color}CC`]} 
        style={styles.quickActionGradient}
      >
        <FontAwesome5 name={icon} size={24} color="#FFF" />
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('Events')}
    >
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.eventGradient}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventDate}>{event.date}</Text>
          <View style={styles.eventTime}>
            <FontAwesome5 name="clock" size={10} color="#888" />
            <Text style={styles.eventTimeText}>{event.time}</Text>
          </View>
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
        <View style={styles.eventFooter}>
          <View style={styles.coachInfo}>
            <FontAwesome5 name="user" size={10} color="#00FF88" />
            <Text style={styles.coachText}>{event.coach}</Text>
          </View>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const NewsItem = ({ news }) => (
    <TouchableOpacity style={styles.newsItem} onPress={() => navigation.navigate('News')}>
      <View style={styles.newsContent}>
        {news.important && (
          <View style={styles.importantDot} />
        )}
        <View style={styles.newsText}>
          <Text style={styles.newsTitle} numberOfLines={2}>{news.title}</Text>
          <Text style={styles.newsDate}>{news.date}</Text>
        </View>
      </View>
      <FontAwesome5 name="chevron-right" size={12} color="#666" />
    </TouchableOpacity>
  );

  const PartnerItem = ({ partner }) => (
    <TouchableOpacity style={styles.partnerItem} onPress={() => navigation.navigate('Partners')}>
      <View style={styles.partnerInfo}>
        <View style={[styles.partnerAvatar, { backgroundColor: getActivityColor(partner.activity) }]}>
          <FontAwesome5 name="user" size={16} color="#FFF" />
        </View>
        <View style={styles.partnerDetails}>
          <Text style={styles.partnerName}>{partner.user}</Text>
          <Text style={styles.partnerActivity}>{partner.activity}</Text>
        </View>
      </View>
      <View style={styles.partnerTime}>
        <FontAwesome5 name="clock" size={10} color="#888" />
        <Text style={styles.partnerTimeText}>{partner.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const getActivityColor = (activity) => {
    switch(activity) {
      case 'running': return '#FF4444';
      case 'strength': return '#33B5E5';
      case 'yoga': return '#00C851';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userDetails}>
                <Text style={styles.welcome}>Welcome back!</Text>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRole}>{user.role}</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <FontAwesome5 name="user-edit" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('News')}
              >
                <FontAwesome5 name="bell" size={20} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsOverview}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.visits || 0}</Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.events || 0}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {todayCheckIn ? '✅' : '⏰'}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Check-In"
              subtitle={todayCheckIn ? "Already checked in" : "Tap to check in"}
              icon="qrcode"
              color="#FF4444"
              onPress={() => handleQuickAction('checkin')}
              disabled={todayCheckIn}
            />
            <QuickActionCard
              title="Events"
              subtitle="View schedule"
              icon="calendar"
              color="#33B5E5"
              onPress={() => handleQuickAction('events')}
            />
            <QuickActionCard
              title="Partners"
              subtitle="Find buddies"
              icon="users"
              color="#00C851"
              onPress={() => handleQuickAction('partners')}
            />
            <QuickActionCard
              title="Statistics"
              subtitle="View progress"
              icon="chart-bar"
              color="#FFBB33"
              onPress={() => handleQuickAction('stats')}
            />
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome5 name="calendar-plus" size={30} color="#666" />
                <Text style={styles.emptyStateText}>No upcoming events</Text>
                <Text style={styles.emptyStateSubtext}>Check events schedule</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Latest News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            <TouchableOpacity onPress={() => navigation.navigate('News')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.newsList}>
            {recentNews.map(news => (
              <NewsItem key={news.id} news={news} />
            ))}
          </View>
        </View>

        {/* Training Partners */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Partners</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Partners')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.partnersList}>
            {partnerRequests.length > 0 ? (
              partnerRequests.map(partner => (
                <PartnerItem key={partner.id} partner={partner} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome5 name="users" size={30} color="#666" />
                <Text style={styles.emptyStateText}>No partners available</Text>
                <Text style={styles.emptyStateSubtext}>Find training buddies</Text>
              </View>
            )}
          </View>
        </View>

        {/* Motivation Section */}
        <View style={styles.motivationSection}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.motivationGradient}>
            <FontAwesome5 name="fire" size={30} color="#FFF" />
            <Text style={styles.motivationTitle}>Keep Going! 🔥</Text>
            <Text style={styles.motivationText}>
              You've completed {user.stats?.visits || 0} sessions this month. 
              Stay consistent and reach your goals!
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

// Стили остаются точно такими же как в предыдущей версии
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  welcome: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  disabledCard: {
    opacity: 0.6,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textAlign: 'center',
  },
  eventsScroll: {
    marginHorizontal: -20,
  },
  eventCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  eventGradient: {
    padding: 15,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventDate: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventLocation: {
    color: '#888',
    fontSize: 10,
    marginBottom: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsList: {
    gap: 10,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 12,
  },
  newsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  importantDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 10,
  },
  newsText: {
    flex: 1,
  },
  newsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  newsDate: {
    color: '#888',
    fontSize: 10,
  },
  partnersList: {
    gap: 10,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 12,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  partnerActivity: {
    color: '#888',
    fontSize: 12,
  },
  partnerTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerTimeText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    width: 200,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },
  motivationSection: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 20,
    marginTop: 10,
  },
  motivationGradient: {
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  motivationTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  motivationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ClubHomeScreen;