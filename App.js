import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from './Home';
import HomeChinese from './HomeChinese';
import Questions from './Questions';
import QuestionsChinese from './QuestionsChinese';
import Settings from './Settings';
import { AppProvider, AppContext } from './AppContext';  // Import AppProvider and AppContext

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color }) => {
  return <Ionicons name={name} size={24} color={color} />;
};

const BottomTab = () => {
  const { isChinese } = useContext(AppContext);  // Access context here
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home' || route.name === '主页') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'About' || route.name === '关于') {
        iconName = focused ? 'help-circle' : 'help-circle-outline';
      }
          return <TabBarIcon name={iconName} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name={isChinese ? "主页"  : "Home" } //定义名字
        component={isChinese ? HomeChinese : Home} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name={isChinese ? "关于"  : "About" } 
        component={isChinese ? QuestionsChinese : Questions} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BottomTab">
          <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
