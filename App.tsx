
import React from 'react';
import { StyleSheet } from 'react-native';
import MainApp from './src/App';

// This is a wrapper component that serves as the entry point for Expo
export default function App() {
  return <MainApp />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
