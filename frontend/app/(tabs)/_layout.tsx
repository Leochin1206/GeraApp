import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router'; 
import Navbar from '@/components/navbar';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});