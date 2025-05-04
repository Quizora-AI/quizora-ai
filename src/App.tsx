
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simplified app component for testing builds
export default function MainApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quizora AI</Text>
      <Text style={styles.text}>Welcome to the mobile app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
