// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomModal from '../components/Modal';
import AlertModal from '../components/AlertModal'; // Добавляем AlertModal
import { userData, Storage, STORAGE_KEYS, EventManager, EVENTS } from '../data/mockData';
import { useNavigation, useIsFocused } from '@react-navigation/native';
const ProfileScreen = () => {
  const [user, setUser] = useState(userData);
  const [myEvents, setMyEvents] = useState([]);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [bmiModalVisible, setBmiModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false); // Добавляем состояние для алерта
  const [alertConfig, setAlertConfig] = useState({}); // Конфиг для алерта

  // States for editing
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    height: '',
    weight: '',
    age: '',
    fitnessLevel: 'intermediate',
    goals: []
  });

  // States for BMI calculation
  const [bmiData, setBmiData] = useState({
    height: '',
    weight: '',
    bmi: null,
    category: '',
    advice: ''
  });

  // Settings
  const [notifications, setNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
 const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]);
  
  const showAlert = (title, message, type = 'info', buttons = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, type, buttons });
    setAlertModalVisible(true);
  };

  const loadUserData = async () => {
    const savedStats = await Storage.getItem(STORAGE_KEYS.USER_STATS);
    const savedEvents = await Storage.getItem(STORAGE_KEYS.USER_EVENTS);
    const savedProfile = await Storage.getItem(STORAGE_KEYS.USER_PROFILE);
    
    if (savedStats) {
      setUser(prev => ({ ...prev, stats: savedStats }));
    }
    
    if (savedEvents) {
      const registeredEvents = savedEvents.filter(event => event.signedUp);
      setMyEvents(registeredEvents);
    }

    if (savedProfile) {
      setUser(savedProfile);
      setEditForm({
        name: savedProfile.name,
        email: savedProfile.email || '',
        phone: savedProfile.phone || '',
        height: savedProfile.height || '',
        weight: savedProfile.weight || '',
        age: savedProfile.age || '',
        fitnessLevel: savedProfile.fitnessLevel || 'intermediate',
        goals: savedProfile.goals || []
      });
    }
  };

  const saveProfile = async () => {
    const updatedUser = {
      ...user,
      ...editForm
    };
    
    setUser(updatedUser);
    await Storage.setItem(STORAGE_KEYS.USER_PROFILE, updatedUser);
    setEditModalVisible(false);
    
    // Emit event to update other screens
    EventManager.emit(EVENTS.PROFILE_UPDATED, updatedUser);
    EventManager.emit('dataChanged', { key: STORAGE_KEYS.USER_PROFILE, value: updatedUser });
    
    showAlert(
      'Success!',
      'Profile updated successfully!',
      'success',
      [{ text: 'GREAT!' }]
    );
  };

  const calculateBMI = () => {
    const height = parseFloat(bmiData.height);
    const weight = parseFloat(bmiData.weight);

    if (!height || !weight || height <= 0 || weight <= 0) {
      showAlert(
        'Error',
        'Please enter valid height and weight',
        'error',
        [{ text: 'UNDERSTOOD' }]
      );
      return;
    }

    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    let category = '';
    let advice = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      advice = 'Focus on strength training and balanced nutrition. Consider consulting a nutritionist.';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      advice = 'Great! Maintain your current routine with regular exercise and balanced diet.';
    } else if (bmi < 30) {
      category = 'Overweight';
      advice = 'Combine cardio with strength training. Watch your calorie intake and stay consistent.';
    } else {
      category = 'Obese';
      advice = 'Consult with healthcare professional. Focus on gradual, sustainable weight loss.';
    }

    setBmiData(prev => ({
      ...prev,
      bmi,
      category,
      advice
    }));

    // Update user profile with height and weight
    setEditForm(prev => ({
      ...prev,
      height: bmiData.height,
      weight: bmiData.weight
    }));

    showAlert(
      'BMI Calculated',
      `Your BMI is ${bmi} (${category})`,
      'info',
      [{ text: 'GOT IT' }]
    );
  };

  const toggleGoal = (goal) => {
    setEditForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const getGoalColor = (goal) => {
    const colors = {
      weight_loss: '#FF4444',
      muscle_gain: '#33B5E5',
      endurance: '#00C851',
      flexibility: '#FFBB33',
      general: '#AA66CC'
    };
    return colors[goal] || '#888';
  };

  const getGoalName = (goal) => {
    const names = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Muscle Gain',
      endurance: 'Endurance',
      flexibility: 'Flexibility',
      general: 'General Fitness'
    };
    return names[goal] || goal;
  };

  const getPersonalizedAdvice = () => {
    const level = editForm.fitnessLevel;
    const goals = editForm.goals;
    
    let advice = [];

    // Fitness level based advice
    if (level === 'beginner') {
      advice.push('Start with 3 sessions per week, focus on form');
      advice.push('Allow 48 hours recovery between strength sessions');
    } else if (level === 'intermediate') {
      advice.push('4-5 sessions weekly with progressive overload');
      advice.push('Balance cardio (40%) and strength (60%)');
    } else {
      advice.push('5-6 sessions with periodization training');
      advice.push('Include active recovery and mobility work');
    }

    // Goal based advice
    if (goals.includes('weight_loss')) {
      advice.push('Aim for 300-500 calorie deficit daily');
      advice.push('Combine HIIT with steady-state cardio');
    }
    if (goals.includes('muscle_gain')) {
      advice.push('Focus on compound lifts 3x weekly');
      advice.push('Ensure adequate protein intake (1.6-2.2g/kg)');
    }
    if (goals.includes('endurance')) {
      advice.push('Include 2-3 cardio sessions weekly');
      advice.push('Gradually increase duration and intensity');
    }

    return advice;
  };

  const StatCard = ({ value, label, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.statCard}>
        <FontAwesome5 name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const AchievementBadge = ({ title, description, unlocked, icon }) => (
    <View style={[styles.achievementCard, !unlocked && styles.lockedAchievement]}>
      <View style={styles.achievementIcon}>
        <FontAwesome5 
          name={icon} 
          size={20} 
          color={unlocked ? '#FFD700' : '#666'} 
        />
      </View>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementDesc}>{description}</Text>
      </View>
      {unlocked && (
        <FontAwesome5 name="check-circle" size={16} color="#00FF88" />
      )}
    </View>
  );

  const GoalPill = ({ goal, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.goalPill,
        { 
          backgroundColor: selected ? getGoalColor(goal) : 'transparent',
          borderColor: getGoalColor(goal)
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.goalPillText,
        { color: selected ? '#FFF' : getGoalColor(goal) }
      ]}>
        {getGoalName(goal)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
              <Text style={styles.memberSince}>Member since Jan 2024</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <FontAwesome5 name="edit" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Health Metrics Quick View */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
            <TouchableOpacity onPress={() => setBmiModalVisible(true)}>
              <Text style={styles.seeAllText}>Calculate BMI</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Height</Text>
              <Text style={styles.metricValue}>
                {user.height ? `${user.height} cm` : 'Not set'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>
                {user.weight ? `${user.weight} kg` : 'Not set'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>BMI</Text>
              <Text style={styles.metricValue}>
                {bmiData.bmi || '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <View style={styles.statsGrid}>
            <StatCard
              value={user.stats.visits}
              label="Total Visits"
              icon="walking"
              color="#00FF88"
              onPress={() => setStatsModalVisible(true)}
            />
            <StatCard
              value={user.stats.events}
              label="Events Attended"
              icon="calendar-check"
              color="#33B5E5"
              onPress={() => setStatsModalVisible(true)}
            />
            <StatCard
              value={user.stats.streak}
              label="Week Streak"
              icon="fire"
              color="#FF4444"
              onPress={() => setStatsModalVisible(true)}
            />
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {myEvents.length > 0 ? (
            myEvents.slice(0, 3).map(event => (
              <TouchableOpacity key={event.id} style={styles.eventItem}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.title}</Text>
                  <Text style={styles.eventDetails}>
                    {event.date} • {event.time} • {event.location}
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome5 name="calendar-plus" size={40} color="#666" />
              <Text style={styles.emptyStateText}>No upcoming events</Text>
              <Text style={styles.emptyStateSubtext}>
                Register for events to see them here
              </Text>
            </View>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <AchievementBadge
            title="First Timer"
            description="Complete your first training session"
            unlocked={true}
            icon="star"
          />
          <AchievementBadge
            title="Regular Member"
            description="Visit 10 times in a month"
            unlocked={user.stats.visits >= 10}
            icon="award"
          />
          <AchievementBadge
            title="Event Lover"
            description="Participate in 5 events"
            unlocked={user.stats.events >= 5}
            icon="trophy"
          />
          <AchievementBadge
            title="Streak Master"
            description="Maintain 7-day streak"
            unlocked={user.stats.streak >= 7}
            icon="fire"
          />
        </View>

     
      </ScrollView>

      {/* Stats Details Modal */}
      <CustomModal
        visible={statsModalVisible}
        onClose={() => setStatsModalVisible(false)}
        title="Activity Details"
      >
        <View style={styles.statsDetails}>
          <View style={styles.statDetail}>
            <Text style={styles.statDetailLabel}>Total Visits:</Text>
            <Text style={styles.statDetailValue}>{user.stats.visits} sessions</Text>
          </View>
          <View style={styles.statDetail}>
            <Text style={styles.statDetailLabel}>Events Attended:</Text>
            <Text style={styles.statDetailValue}>{user.stats.events} events</Text>
          </View>
          <View style={styles.statDetail}>
            <Text style={styles.statDetailLabel}>Current Streak:</Text>
            <Text style={styles.statDetailValue}>{user.stats.streak} weeks</Text>
          </View>
          <View style={styles.statDetail}>
            <Text style={styles.statDetailLabel}>Member Since:</Text>
            <Text style={styles.statDetailValue}>January 2024</Text>
          </View>
        </View>
        
        <Text style={styles.motivationText}>
          Keep going! You're doing great! 🎉
        </Text>
      </CustomModal>

      {/* Edit Profile Modal */}
      <CustomModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Profile"
      >
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Personal Information</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({...prev, name: text}))}
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={editForm.email}
              onChangeText={(text) => setEditForm(prev => ({...prev, email: text}))}
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Phone"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={editForm.phone}
              onChangeText={(text) => setEditForm(prev => ({...prev, phone: text}))}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Age"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={editForm.age}
              onChangeText={(text) => setEditForm(prev => ({...prev, age: text}))}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Fitness Level</Text>
            <View style={styles.levelButtons}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    editForm.fitnessLevel === level && styles.levelButtonActive
                  ]}
                  onPress={() => setEditForm(prev => ({...prev, fitnessLevel: level}))}
                >
                  <Text style={[
                    styles.levelButtonText,
                    editForm.fitnessLevel === level && styles.levelButtonTextActive
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Fitness Goals</Text>
            <View style={styles.goalsContainer}>
              {['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general'].map(goal => (
                <GoalPill
                  key={goal}
                  goal={goal}
                  selected={editForm.goals.includes(goal)}
                  onPress={() => toggleGoal(goal)}
                />
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Physical Metrics</Text>
            <View style={styles.metricsInputRow}>
              <View style={styles.metricInput}>
                <Text style={styles.metricInputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="175"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={editForm.height}
                  onChangeText={(text) => setEditForm(prev => ({...prev, height: text}))}
                />
              </View>
              <View style={styles.metricInput}>
                <Text style={styles.metricInputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="70"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={editForm.weight}
                  onChangeText={(text) => setEditForm(prev => ({...prev, weight: text}))}
                />
              </View>
            </View>
          </View>

          {/* Personalized Advice */}
          {getPersonalizedAdvice().length > 0 && (
            <View style={styles.adviceSection}>
              <Text style={styles.adviceTitle}>💡 Personalized Advice</Text>
              {getPersonalizedAdvice().map((advice, index) => (
                <Text key={index} style={styles.adviceText}>• {advice}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>SAVE PROFILE</Text>
          </TouchableOpacity>
        </ScrollView>
      </CustomModal>

      {/* BMI Calculator Modal */}
      <CustomModal
        visible={bmiModalVisible}
        onClose={() => setBmiModalVisible(false)}
        title="BMI Calculator"
      >
        <View style={styles.bmiContainer}>
          <View style={styles.bmiInputRow}>
            <View style={styles.bmiInput}>
              <Text style={styles.bmiLabel}>Height (cm)</Text>
              <TextInput
                style={styles.bmiTextInput}
                placeholder="175"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={bmiData.height}
                onChangeText={(text) => setBmiData(prev => ({...prev, height: text}))}
              />
            </View>
            <View style={styles.bmiInput}>
              <Text style={styles.bmiLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.bmiTextInput}
                placeholder="70"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={bmiData.weight}
                onChangeText={(text) => setBmiData(prev => ({...prev, weight: text}))}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateBMI}>
            <Text style={styles.calculateButtonText}>CALCULATE BMI</Text>
          </TouchableOpacity>

          {bmiData.bmi && (
            <View style={styles.bmiResult}>
              <Text style={styles.bmiValue}>Your BMI: {bmiData.bmi}</Text>
              <Text style={styles.bmiCategory}>{bmiData.category}</Text>
              <Text style={styles.bmiAdvice}>{bmiData.advice}</Text>
              
              <View style={styles.bmiScale}>
                <View style={[styles.bmiBar, styles.underweight]} />
                <View style={[styles.bmiBar, styles.normal]} />
                <View style={[styles.bmiBar, styles.overweight]} />
                <View style={[styles.bmiBar, styles.obese]} />
              </View>
            </View>
          )}
        </View>
      </CustomModal>

      {/* Settings Modal */}
      <CustomModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        title="App Settings"
      >
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive event reminders and updates</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#FF4444' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Get weekly progress summaries</Text>
            </View>
            <Switch
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              trackColor={{ false: '#767577', true: '#FF4444' }}
            />
          </View>

          <TouchableOpacity 
            style={styles.saveSettingsButton}
            onPress={() => {
              setSettingsModalVisible(false);
              showAlert(
                'Settings Saved',
                'Your preferences have been updated successfully.',
                'success',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.saveSettingsButtonText}>SAVE SETTINGS</Text>
          </TouchableOpacity>
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
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberSince: {
    color: '#888',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#FF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
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
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDetails: {
    color: '#888',
    fontSize: 12,
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
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDesc: {
    color: '#888',
    fontSize: 12,
  },
  statsDetails: {
    gap: 12,
    marginBottom: 20,
  },
  statDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  statDetailLabel: {
    color: '#888',
    fontSize: 14,
  },
  statDetailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  motivationText: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  settingsButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 500,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#16213e',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  levelButton: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  levelButtonActive: {
    backgroundColor: '#FF4444',
    borderColor: '#FF4444',
  },
  levelButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelButtonTextActive: {
    color: '#FFFFFF',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  goalPillText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricsInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricInput: {
    flex: 1,
  },
  metricInputLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  adviceSection: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  adviceTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  adviceText: {
    color: '#00FF88',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bmiContainer: {
    gap: 15,
  },
  bmiInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bmiInput: {
    flex: 1,
  },
  bmiLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  bmiTextInput: {
    backgroundColor: '#16213e',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  calculateButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bmiResult: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bmiValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bmiCategory: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bmiAdvice: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 15,
  },
  bmiScale: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  bmiBar: {
    flex: 1,
  },
  underweight: { backgroundColor: '#33B5E5' },
  normal: { backgroundColor: '#00C851' },
  overweight: { backgroundColor: '#FFBB33' },
  obese: { backgroundColor: '#FF4444' },
  settingsContainer: {
    gap: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#888',
    fontSize: 12,
  },
  saveSettingsButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveSettingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;