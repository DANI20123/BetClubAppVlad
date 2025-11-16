// src/screens/CheckInScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomModal from '../components/Modal';
import { Storage, STORAGE_KEYS, userData } from '../data/mockData';

const CheckInScreen = () => {
  const [user, setUser] = useState(userData);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  useEffect(() => {
    loadCheckInData();
  }, []);

  const loadCheckInData = async () => {
    const savedStats = await Storage.getItem(STORAGE_KEYS.USER_STATS);
    const savedHistory = await Storage.getItem('checkin_history');
    
    if (savedStats) {
      setUser(prev => ({ ...prev, stats: savedStats }));
    }
    
    if (savedHistory) {
      setCheckInHistory(savedHistory);
      // Check if user already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = savedHistory.find(entry => entry.date === today);
      setTodayCheckedIn(!!todayCheckIn);
    }
  };

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const newCheckIn = {
      id: Date.now(),
      date: today,
      time: now,
      type: 'training',
      location: 'Main Club'
    };

    // Update history
    const updatedHistory = [newCheckIn, ...checkInHistory];
    setCheckInHistory(updatedHistory);
    await Storage.setItem('checkin_history', updatedHistory);

    // Update stats
    const updatedStats = {
      ...user.stats,
      visits: user.stats.visits + 1,
      streak: user.stats.streak + 1 // Simple streak logic
    };
    
    setUser(prev => ({ ...prev, stats: updatedStats }));
    await Storage.setItem(STORAGE_KEYS.USER_STATS, updatedStats);

    setTodayCheckedIn(true);
    setCheckInModalVisible(true);
  };

  const getWeekday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const StatCard = ({ value, label, icon, color }) => (
    <View style={styles.statCard}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.statGradient}>
        <FontAwesome5 name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  const CheckInCard = ({ entry, index }) => (
    <View style={styles.checkInCard}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.checkInGradient}>
        <View style={styles.checkInHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.weekday}>{getWeekday(entry.date)}</Text>
            <Text style={styles.date}>{entry.date}</Text>
          </View>
          <View style={styles.timeContainer}>
            <FontAwesome5 name="clock" size={12} color="#00FF88" />
            <Text style={styles.time}>{entry.time}</Text>
          </View>
        </View>
        
        <View style={styles.checkInDetails}>
          <View style={styles.detailItem}>
            <FontAwesome5 name="running" size={12} color="#FF4444" />
            <Text style={styles.detailText}>{entry.type}</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome5 name="map-marker-alt" size={12} color="#33B5E5" />
            <Text style={styles.detailText}>{entry.location}</Text>
          </View>
        </View>

        {index === 0 && (
          <View style={styles.latestBadge}>
            <FontAwesome5 name="star" size={10} color="#FFD700" />
            <Text style={styles.latestText}>LATEST</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
        <Text style={styles.headerTitle}>Check-In</Text>
        <Text style={styles.headerSubtitle}>Track your visits</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <StatCard
            value={user.stats.visits}
            label="Total Visits"
            icon="walking"
            color="#00FF88"
          />
          <StatCard
            value={user.stats.streak}
            label="Day Streak"
            icon="fire"
            color="#FF4444"
          />
          <StatCard
            value={checkInHistory.filter(entry => 
              new Date(entry.date).getMonth() === new Date().getMonth()
            ).length}
            label="This Month"
            icon="calendar"
            color="#33B5E5"
          />
        </View>

        {/* Check-In Button */}
        <View style={styles.checkInSection}>
          <Text style={styles.sectionTitle}>Today's Check-In</Text>
          <TouchableOpacity 
            style={[
              styles.checkInButton,
              todayCheckedIn && styles.checkedInButton
            ]}
            onPress={handleCheckIn}
            disabled={todayCheckedIn}
          >
            <LinearGradient 
              colors={todayCheckedIn ? ['#00C851', '#007E33'] : ['#FF4444', '#CC0000']} 
              style={styles.checkInButtonGradient}
            >
              <FontAwesome5 
                name={todayCheckedIn ? "check-circle" : "qrcode"} 
                size={32} 
                color="#FFF" 
              />
              <Text style={styles.checkInButtonText}>
                {todayCheckedIn ? 'ALREADY CHECKED IN' : 'TAP TO CHECK IN'}
              </Text>
              <Text style={styles.checkInButtonSubtext}>
                {todayCheckedIn ? 'Great job today! 🎉' : 'Scan to register your visit'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Check-Ins */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Check-Ins</Text>
            {checkInHistory.length > 0 && (
              <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {checkInHistory.length > 0 ? (
            checkInHistory.slice(0, 5).map((entry, index) => (
              <CheckInCard key={entry.id} entry={entry} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome5 name="history" size={50} color="#666" />
              <Text style={styles.emptyStateText}>No check-in history</Text>
              <Text style={styles.emptyStateSubtext}>
                Check in today to start tracking your visits!
              </Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Check-In Tips</Text>
          <View style={styles.tipItem}>
            <FontAwesome5 name="check-circle" size={14} color="#00FF88" />
            <Text style={styles.tipText}>Check in every time you visit the club</Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome5 name="award" size={14} color="#FFD700" />
            <Text style={styles.tipText}>Maintain streaks to earn achievements</Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome5 name="chart-line" size={14} color="#33B5E5" />
            <Text style={styles.tipText}>Track your progress over time</Text>
          </View>
        </View>
      </ScrollView>

      {/* Check-In Success Modal */}
      <CustomModal
        visible={checkInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        title="Check-In Successful! 🎉"
      >
        <View style={styles.successContent}>
          <FontAwesome5 name="check-circle" size={60} color="#00FF88" />
          <Text style={styles.successTitle}>You're checked in!</Text>
          <Text style={styles.successText}>
            Visit #{user.stats.visits} registered successfully
          </Text>
          
          <View style={styles.successStats}>
            <View style={styles.successStat}>
              <Text style={styles.successStatValue}>{user.stats.visits}</Text>
              <Text style={styles.successStatLabel}>Total Visits</Text>
            </View>
            <View style={styles.successStat}>
              <Text style={styles.successStatValue}>{user.stats.streak}</Text>
              <Text style={styles.successStatLabel}>Day Streak</Text>
            </View>
          </View>

          <Text style={styles.motivationText}>
            Keep up the great work! Your consistency is inspiring. 💪
          </Text>

          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setCheckInModalVisible(false)}
          >
            <Text style={styles.doneButtonText}>AWESOME!</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Full History Modal */}
      <CustomModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        title="Check-In History"
      >
        <ScrollView style={styles.historyModalContent}>
          {checkInHistory.map((entry, index) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDate}>{entry.date}</Text>
                <Text style={styles.historyTime}>{entry.time}</Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyType}>{entry.type}</Text>
                <Text style={styles.historyLocation}>{entry.location}</Text>
              </View>
              {index === 0 && (
                <View style={styles.currentStreakBadge}>
                  <Text style={styles.streakText}>TODAY</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.historySummary}>
          <Text style={styles.historyTotal}>
            Total Check-Ins: {checkInHistory.length}
          </Text>
        </View>
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
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  statGradient: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkInSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  checkInButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  checkedInButton: {
    opacity: 0.8,
  },
  checkInButtonGradient: {
    padding: 30,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  checkInButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  historySection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  checkInCard: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkInGradient: {
    padding: 15,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  weekday: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  checkInDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  latestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  latestText: {
    color: '#FFD700',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
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
  tipsSection: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 15,
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  successText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  successStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  successStat: {
    alignItems: 'center',
  },
  successStatValue: {
    color: '#00FF88',
    fontSize: 24,
    fontWeight: 'bold',
  },
  successStatLabel: {
    color: '#888',
    fontSize: 12,
  },
  motivationText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyModalContent: {
    maxHeight: 400,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyTime: {
    color: '#888',
    fontSize: 12,
  },
  historyDetails: {
    flex: 2,
  },
  historyType: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyLocation: {
    color: '#888',
    fontSize: 10,
  },
  currentStreakBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  historySummary: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  historyTotal: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CheckInScreen;