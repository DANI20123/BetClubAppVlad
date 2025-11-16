// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import StatisticsScreen from './src/screens/StatisticsScreen';
// Import screens
import ClubHomeScreen from './src/screens/ClubHomeScreen';
import EventsScreen from './src/screens/EventsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NewsScreen from './src/screens/NewsScreen';
import PartnersScreen from './src/screens/PartnersScreen';
import CheckInScreen from './src/screens/CheckInScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Events') {
              iconName = 'calendar';
            } else if (route.name === 'CheckIn') {
              iconName = 'qrcode';
            } else if (route.name === 'News') {
              iconName = 'newspaper';
            } else if (route.name === 'Partners') {
              iconName = 'users';
            }

            return <FontAwesome5 name={iconName} size={size} color={color} solid />;
          },
          tabBarActiveTintColor: '#FF4444',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#1a1a2e',
            borderTopWidth: 0,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={ClubHomeScreen}
          options={{ title: 'My Club' }}
        />
        <Tab.Screen 
          name="Events" 
          component={EventsScreen}
          options={{ title: 'Events' }}
        />
        <Tab.Screen 
          name="CheckIn" 
          component={CheckInScreen}
          options={{ title: 'Check-In' }}
        />
        <Tab.Screen 
          name="News" 
          component={NewsScreen}
          options={{ title: 'News' }}
        />
        <Tab.Screen 
          name="Partners" 
          component={PartnersScreen}
          options={{ title: 'Partners' }}
        />
        <Tab.Screen 
  name="Statistics" 
  component={StatisticsScreen}
  options={{ 
    title: 'Stats',
    tabBarIcon: ({ color, size }) => (
      <FontAwesome5 name="chart-bar" size={size} color={color} />
    )
  }}
/>
 <Tab.Screen 
  name="Profile" 
  component={ProfileScreen}
  options={{ 
    title: 'Profile',
    tabBarIcon: ({ color, size }) => (
      <FontAwesome5 name="user" size={size} color={color} />
    )
  }}
/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}