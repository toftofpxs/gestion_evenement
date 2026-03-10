import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion Événements</Text>
      <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
      <Text style={styles.loading}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 15,
  },
  loading: {
    color: '#fff',
    fontSize: 14,
  },
});
