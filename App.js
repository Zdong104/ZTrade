import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // If you use Expo
import Home from './Home';
import Questions from './Questions';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color }) => {
  return <Ionicons name={name} size={24} color={color} />;
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Questions') {
              iconName = focused ? 'help-circle' : 'help-circle-outline';
            }
            return <TabBarIcon name={iconName} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: [
            {
              display: 'flex'
            },
            null
          ],
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Questions" component={Questions} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
