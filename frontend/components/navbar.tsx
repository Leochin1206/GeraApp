import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  background: '#0C1D2C', 
  active: '#EFB322',    
  inactive: '#FFFFFF',  
};

const Navbar = () => {
  const router = useRouter();
  const segments = useSegments(); 
  const currentRoute = segments[segments.length - 1];

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    router.replace('/');
  };

  const navItems = [
    { name: 'home', icon: 'home-outline', route: '/home' },
    { name: 'eventos', icon: 'calendar-outline', route: '/eventos' },
    { name: 'geradores', icon: 'generator-portable', route: '/geradores' }, 
    { name: 'logout', icon: 'logout', action: handleLogout }, 
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <Pressable
          key={item.name}
          style={styles.navItem}
          onPress={() => (item.action ? item.action() : router.replace(item.route as any))} 
        >
          <MaterialCommunityIcons
            name={item.icon as any} 
            size={32}
            color={currentRoute === item.name ? COLORS.active : COLORS.inactive}
          />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',height: 65, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: '#2a3b4c', paddingBottom: Platform.OS === 'ios' ? 10 : 0 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default Navbar;