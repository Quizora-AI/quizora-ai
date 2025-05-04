
import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import MainApp from './src/App';

// This is a wrapper component that serves as the entry point for Expo
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <MainApp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
