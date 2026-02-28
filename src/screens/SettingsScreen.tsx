import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Card, Header } from '../components/ui';
import { colors } from '../components/theme';
import { themeLabels, themes, ThemeType } from '../components/themes';
import { PackageIcon, BuildingIcon, UsersIcon } from '../components/icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, branches, currentBranch } = useApp();
  const { currentTheme, setTheme } = useTheme();
  const currentBranchData = branches.find((b) => b.id === currentBranch);

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const menuItems = [
    { icon: PackageIcon, label: 'Products', subtitle: 'Manage inventory', route: '/products', color: colors.emerald[100] },
    { icon: BuildingIcon, label: 'Branches', subtitle: 'Manage store locations', route: '/branches', color: colors.blue[100] },
    { icon: UsersIcon, label: 'Users', subtitle: 'Manage staff accounts', route: '/users', color: colors.purple[100] },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name || '')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[
              styles.roleBadge,
              { backgroundColor: user?.role === 'admin' ? colors.purple[100] : colors.gray[100] }
            ]}>
              <View style={styles.badgeContent}>
                {user?.role === 'admin' ? (
                  <UsersIcon size={16} color={colors.purple[700]} />
                ) : (
                  <UsersIcon size={16} color={colors.gray[700]} />
                )}
                <Text style={[
                  styles.roleText,
                  { color: user?.role === 'admin' ? colors.purple[700] : colors.gray[700] }
                ]}>
                  {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                </Text>
              </View>
            </View>
            {currentBranchData && (
              <View style={styles.branchBadge}>
                <View style={styles.badgeContent}>
                  <BuildingIcon size={16} color={colors.gray[700]} />
                  <Text style={styles.branchText}>{currentBranchData.name}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Theme Selector */}
        <Card style={styles.themeCard}>
          <Text style={styles.themeTitle}>Theme</Text>
          <View style={styles.themesGrid}>
            {(['emerald', 'blue', 'purple', 'orange'] as ThemeType[]).map((theme) => (
              <TouchableOpacity
                key={theme}
                onPress={() => setTheme(theme)}
                style={[
                  styles.themeOption,
                  currentTheme === theme && styles.themeOptionActive,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: themes[theme].primary[600] },
                  ]}
                />
                <Text style={styles.themeLabel}>{themeLabels[theme]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Menu */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.route}>
              <TouchableOpacity
                onPress={() => router.push(item.route as any)}
                style={styles.menuItem}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <item.icon size={20} color={colors.gray[800]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        {/* About */}
        <Card style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Currency</Text>
            <Text style={styles.aboutValue}>KES (Kenyan Shilling)</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Platform</Text>
            <Text style={styles.aboutValue}>Expo / React Native</Text>
          </View>
        </Card>

        <Button variant="danger" onPress={handleLogout} fullWidth size="lg">
          Sign Out
        </Button>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 16 },
  profileCard: { gap: 12 },
  profileRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.emerald[600], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '700' },
  userName: { fontSize: 17, fontWeight: '700', color: colors.gray[900], marginBottom: 2 },
  userEmail: { fontSize: 13, color: colors.gray[500] },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  roleBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  roleText: { fontSize: 13, fontWeight: '600' },
  branchBadge: {
    backgroundColor: colors.blue[50], borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.blue[200],
  },
  branchText: { fontSize: 13, color: colors.blue[700], marginLeft: 6 },
  badgeContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16,
  },
  menuIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.gray[900], marginBottom: 1 },
  menuSubtitle: { fontSize: 12, color: colors.gray[500] },
  menuArrow: { fontSize: 22, color: colors.gray[400], fontWeight: '300' },
  divider: { height: 1, backgroundColor: colors.gray[100], marginLeft: 70 },
  aboutCard: { gap: 10 },
  aboutTitle: { fontSize: 15, fontWeight: '700', color: colors.gray[900], marginBottom: 2 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between' },
  aboutLabel: { fontSize: 13, color: colors.gray[600] },
  aboutValue: { fontSize: 13, color: colors.gray[900], fontWeight: '500' },
  themeCard: { gap: 12 },
  themeTitle: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  themesGrid: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: colors.emerald[600],
    backgroundColor: colors.emerald[50],
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  themeLabel: { fontSize: 12, fontWeight: '600', color: colors.gray[700], textAlign: 'center' },
});
