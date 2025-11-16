// src/screens/StatisticsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Storage, STORAGE_KEYS } from '../data/mockData';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [userStats, setUserStats] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const stats = await Storage.getItem(STORAGE_KEYS.USER_STATS);
    const events = await Storage.getItem(STORAGE_KEYS.USER_EVENTS);
    const checkins = await Storage.getItem('checkin_history');
    
    setUserStats(stats);
    generateAttendanceData(checkins || []);
    generatePerformanceData(events || []);
    generateGoalsData(stats);
  };

  const generateAttendanceData = (checkins) => {
    const monthlyData = [
      { month: 'Jan', visits: 12, goal: 16, trend: 'up' },
      { month: 'Feb', visits: 15, goal: 16, trend: 'up' },
      { month: 'Mar', visits: 14, goal: 16, trend: 'stable' },
      { month: 'Apr', visits: 18, goal: 16, trend: 'up' },
      { month: 'May', visits: 16, goal: 16, trend: 'stable' },
      { month: 'Jun', visits: 13, goal: 16, trend: 'down' },
    ];
    setAttendanceData(monthlyData);
  };

  const generatePerformanceData = (events) => {
    const performance = [
      { activity: 'Running', sessions: 24, avgDuration: '45min', progress: '+15%' },
      { activity: 'Strength', sessions: 18, avgDuration: '60min', progress: '+8%' },
      { activity: 'Yoga', sessions: 12, avgDuration: '30min', progress: '+25%' },
      { activity: 'Cycling', sessions: 8, avgDuration: '75min', progress: '+5%' },
      { activity: 'Swimming', sessions: 6, avgDuration: '40min', progress: '+12%' },
    ];
    setPerformanceData(performance);
  };

  const generateGoalsData = (stats) => {
    const goals = [
      { goal: 'Monthly Visits', current: stats?.visits || 0, target: 20, progress: 65 },
      { goal: 'Event Participation', current: stats?.events || 0, target: 15, progress: 53 },
      { goal: 'Consistency Streak', current: stats?.streak || 0, target: 30, progress: 17 },
      { goal: 'Training Hours', current: 42, target: 80, progress: 52 },
      { goal: 'Calories Burned', current: 12500, target: 25000, progress: 50 },
    ];
    setGoalsData(goals);
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <View style={styles.statCard}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.statGradient}>
        <View style={styles.statHeader}>
          <Text style={styles.statTitle}>{title}</Text>
          <FontAwesome5 name={icon} size={16} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.statFooter}>
          <Text style={styles.statSubtitle}>{subtitle}</Text>
          {trend && (
            <View style={[styles.trend, { backgroundColor: trend === 'up' ? '#00C851' : '#FF4444' }]}>
              <FontAwesome5 
                name={trend === 'up' ? 'caret-up' : 'caret-down'} 
                size={10} 
                color="#FFF" 
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const ProgressBar = ({ progress, color }) => (
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${progress}%`, backgroundColor: color }
        ]} 
      />
    </View>
  );

  const AttendanceTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>Monthly Attendance</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.columnHeader}>Month</Text>
        <Text style={styles.columnHeader}>Visits</Text>
        <Text style={styles.columnHeader}>Goal</Text>
        <Text style={styles.columnHeader}>Status</Text>
      </View>
      {attendanceData.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.tableCell}>{item.month}</Text>
          <Text style={styles.tableCell}>{item.visits}</Text>
          <Text style={styles.tableCell}>{item.goal}</Text>
          <View style={styles.statusCell}>
            <FontAwesome5 
              name={item.trend === 'up' ? 'caret-up' : item.trend === 'down' ? 'caret-down' : 'minus'}
              size={12} 
              color={item.trend === 'up' ? '#00FF88' : item.trend === 'down' ? '#FF4444' : '#888'} 
            />
            <Text style={[
              styles.statusText,
              { color: item.trend === 'up' ? '#00FF88' : item.trend === 'down' ? '#FF4444' : '#888' }
            ]}>
              {item.trend}
            </Text>
          </View>
        </View>
      ))}
      <View style={styles.tableSummary}>
        <Text style={styles.summaryText}>
          Avg Monthly: <Text style={styles.highlight}>15 visits</Text>
        </Text>
        <Text style={styles.summaryText}>
          Goal Completion: <Text style={styles.highlight}>83%</Text>
        </Text>
      </View>
    </View>
  );

  const PerformanceTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>Training Performance</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, { flex: 2 }]}>Activity</Text>
        <Text style={styles.columnHeader}>Sessions</Text>
        <Text style={styles.columnHeader}>Avg Time</Text>
        <Text style={styles.columnHeader}>Progress</Text>
      </View>
      {performanceData.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.tableCell, { flex: 2 }]}>
            <View style={styles.activityInfo}>
              <View style={[styles.activityDot, { backgroundColor: getActivityColor(item.activity) }]} />
              <Text style={styles.activityText}>{item.activity}</Text>
            </View>
          </View>
          <Text style={styles.tableCell}>{item.sessions}</Text>
          <Text style={styles.tableCell}>{item.avgDuration}</Text>
          <Text style={[styles.tableCell, { color: '#00FF88' }]}>{item.progress}</Text>
        </View>
      ))}
      <View style={styles.performanceInsights}>
        <Text style={styles.insightTitle}>💡 Performance Insights</Text>
        <Text style={styles.insightText}>
          • Most consistent with <Text style={styles.highlight}>Running</Text>
        </Text>
        <Text style={styles.insightText}>
          • <Text style={styles.highlight}>Yoga</Text> shows highest growth
        </Text>
      </View>
    </View>
  );

  const GoalsTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>Goals Progress</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, { flex: 2 }]}>Goal</Text>
        <Text style={styles.columnHeader}>Progress</Text>
        <Text style={styles.columnHeader}>Status</Text>
      </View>
      {goalsData.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.tableCell, { flex: 2 }]}>
            <Text style={styles.goalText}>{item.goal}</Text>
            <Text style={styles.goalSubtext}>
              {item.current} / {item.target}
            </Text>
          </View>
          <View style={styles.tableCell}>
            <ProgressBar progress={item.progress} color={getProgressColor(item.progress)} />
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={[
              styles.statusBadge,
              { 
                backgroundColor: item.progress >= 75 ? '#00C851' : 
                                item.progress >= 50 ? '#FFBB33' : '#FF4444'
              }
            ]}>
              {item.progress >= 75 ? 'Great' : item.progress >= 50 ? 'Good' : 'Needs Work'}
            </Text>
          </View>
        </View>
      ))}
      <View style={styles.goalsSummary}>
        <Text style={styles.summaryTitle}>Overall Progress</Text>
        <ProgressBar progress={47} color="#FF4444" />
        <Text style={styles.overallProgress}>47% of annual goals</Text>
      </View>
    </View>
  );

  const getActivityColor = (activity) => {
    switch(activity) {
      case 'Running': return '#FF4444';
      case 'Strength': return '#33B5E5';
      case 'Yoga': return '#00C851';
      case 'Cycling': return '#FFBB33';
      case 'Swimming': return '#AA66CC';
      default: return '#888';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#00C851';
    if (progress >= 50) return '#FFBB33';
    return '#FF4444';
  };

   return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>Progress & Performance</Text>
      </LinearGradient>

      {/* Основной контент - ОДИН ScrollView */}
      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.quickStats}
          contentContainerStyle={styles.quickStatsContent}
        >
          <StatCard
            title="Total Visits"
            value={userStats?.visits || 0}
            subtitle="This year"
            icon="walking"
            color="#00FF88"
            trend="up"
          />
          <StatCard
            title="Avg Sessions"
            value="4.2"
            subtitle="Per week"
            icon="calendar-week"
            color="#33B5E5"
            trend="stable"
          />
          <StatCard
            title="Success Rate"
            value="83%"
            subtitle="Goals completed"
            icon="trophy"
            color="#FFD700"
            trend="up"
          />
          <StatCard
            title="Consistency"
            value={userStats?.streak || 0}
            subtitle="Day streak"
            icon="fire"
            color="#FF4444"
            trend="up"
          />
        </ScrollView>

        {/* Табы */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
            onPress={() => setActiveTab('attendance')}
          >
            <FontAwesome5 
              name="calendar-check" 
              size={14} 
              color={activeTab === 'attendance' ? '#FF4444' : '#888'} 
            />
            <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
              Attendance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
            onPress={() => setActiveTab('performance')}
          >
            <FontAwesome5 
              name="chart-line" 
              size={14} 
              color={activeTab === 'performance' ? '#FF4444' : '#888'} 
            />
            <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
              Performance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
            onPress={() => setActiveTab('goals')}
          >
            <FontAwesome5 
              name="flag" 
              size={14} 
              color={activeTab === 'goals' ? '#FF4444' : '#888'} 
            />
            <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
              Goals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Активная таблица */}
        <View style={styles.tableSection}>
          {activeTab === 'attendance' && <AttendanceTable />}
          {activeTab === 'performance' && <PerformanceTable />}
          {activeTab === 'goals' && <GoalsTable />}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>📊 Monthly Insights</Text>
          <View style={styles.insightCard}>
            <FontAwesome5 name="award" size={16} color="#FFD700" />
            <View style={styles.insightContent}>
              <Text style={styles.insightMain}>Best Month: April</Text>
              <Text style={styles.insightSub}>18 visits (112% of goal)</Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <FontAwesome5 name="lightbulb" size={16} color="#33B5E5" />
            <View style={styles.insightContent}>
              <Text style={styles.insightMain}>Recommendation</Text>
              <Text style={styles.insightSub}>Increase weekend sessions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  mainContent: {
    
    flex: 1,
  
   
  },
  quickStats: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10, // Уменьшил отступ снизу
    
   
 
  },
  statCard: {
    width: 140,
    marginRight: 12,
  },
  statGradient: {
    padding: 12,
    borderRadius: 12,
    minHeight: 90,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statSubtitle: {
    color: '#888',
    fontSize: 9,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    
    backgroundColor: '#16213e',
    marginHorizontal: 15,
    marginBottom: 10, // Уменьшил отступ снизу
    borderRadius: 12,
  
    padding: 4,
   
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#1a1a2e',
  },
  tabText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#FF4444',
  },
  tablesScroll: {
    flex: 1,
    paddingHorizontal: 15,
    
  },
  tableContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10, // Уменьшил отступ между таблицами
  },
  tableTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    paddingBottom: 8,
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    color: '#FF4444',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  tableCell: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
  },
  statusCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 3,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  activityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  goalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalSubtext: {
    color: '#888',
    fontSize: 9,
  },
  progressBar: {
    height: 5,
    backgroundColor: '#1a1a2e',
    borderRadius: 3,
    marginBottom: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 9,
    textAlign: 'center',
  },
  statusBadge: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    textAlign: 'center',
  },
  tableSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  summaryText: {
    color: '#888',
    fontSize: 11,
    marginBottom: 4,
  },
  highlight: {
    color: '#00FF88',
    fontWeight: 'bold',
  },
  performanceInsights: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    color: '#888',
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 14,
  },
  goalsSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overallProgress: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  insightContent: {
    flex: 1,
    marginLeft: 10,
  },
  insightMain: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  insightSub: {
    color: '#888',
    fontSize: 10,
  },
});

export default StatisticsScreen;