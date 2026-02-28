import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { colors } from './theme';
import { DashboardIcon, PackageIcon, AlertIcon, MenuIcon } from './icons';

interface BottomNavProps {
  active: 'home' | 'products' | 'alerts' | 'more';
}

export default function BottomNav({ active }: BottomNavProps) {
  const router = useRouter();
  const { user } = useApp();

  const tabs = [
    { key: 'home', label: 'Home', icon: DashboardIcon, route: '/dashboard' },
    { key: 'products', label: 'Products', icon: PackageIcon, route: '/products' },
    { key: 'alerts', label: 'Alerts', icon: AlertIcon, route: '/low-stock' },
    ...(user?.role === 'admin' ? [{ key: 'more', label: 'More', icon: MenuIcon, route: '/branches' }] : []),
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => router.push(tab.route as any)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <tab.icon size={24} color={isActive ? colors.emerald[600] : colors.gray[500]} />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray[500],
  },
  tabLabelActive: {
    color: colors.emerald[600],
    fontWeight: '700',
  },
});
