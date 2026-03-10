import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EventsListScreen from '../screens/EventsListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EventsList"
        component={EventsListScreen}
        options={{ title: 'Événements' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Détail événement' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return <NavigationContainer>{userToken ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}
