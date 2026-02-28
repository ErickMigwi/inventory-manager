import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useApp, UserRole } from '../context/AppContext';
import { Badge, Button, Card, Header, Input } from '../components/ui';
import { colors } from '../components/theme';
import { UsersIcon, CloseIcon } from '../components/icons';

export default function UserManagementScreen() {
  const router = useRouter();
  const { user, users, branches, addUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'staff' as UserRole, branchId: '',
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Guard: Only admins can access this screen
  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.branchId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    addUser(newUser);
    Alert.alert('Success', 'User added successfully!');
    setNewUser({ name: '', email: '', role: 'staff', branchId: '' });
    setIsModalOpen(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Header
          title="User Management"
          subtitle="Manage team members and permissions"
          onBack={() => router.back()}
          rightElement={
            <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addButton} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: u }) => {
          const userBranch = branches.find((b) => b.id === u.branchId);
          const isCurrentUser = u.id === user?.id;

          return (
            <Card style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(u.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{u.name}</Text>
                    {isCurrentUser && <Badge color="blue">You</Badge>}
                  </View>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
              </View>

              <View style={styles.badgeRow}>
                <View style={[
                  styles.roleBadge,
                  { backgroundColor: u.role === 'admin' ? colors.purple[100] : colors.gray[100] }
                ]}>
                  <UsersIcon size={14} color={u.role === 'admin' ? colors.purple[700] : colors.gray[700]} />
                  <Text style={[
                    styles.roleText,
                    { color: u.role === 'admin' ? colors.purple[700] : colors.gray[700] }
                  ]}>
                    {u.role === 'admin' ? 'Admin' : 'Staff'}
                  </Text>
                </View>
                {userBranch && (
                  <View style={styles.branchBadge}>
                    <Text style={styles.branchText}>{userBranch.name}</Text>
                  </View>
                )}
              </View>

              {u.role === 'admin' && (
                <View style={styles.accessNote}>
                  <Text style={styles.accessNoteText}>
                    Full access to all branches, products, and settings
                  </Text>
                </View>
              )}
            </Card>
          );
        }}
      />

      {/* Add User Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New User</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <CloseIcon size={24} color={colors.gray[500]} />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <Input
                  value={newUser.name}
                  onChangeText={(val) => setNewUser((u) => ({ ...u, name: val }))}
                  placeholder="e.g., Jane Doe"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <Input
                  value={newUser.email}
                  onChangeText={(val) => setNewUser((u) => ({ ...u, email: val }))}
                  placeholder="jane@shop.co.ke"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newUser.role}
                    onValueChange={(val: UserRole) => setNewUser((u) => ({ ...u, role: val }))}
                  >
                    <Picker.Item label="Staff" value="staff" />
                    <Picker.Item label="Admin" value="admin" />
                  </Picker>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Branch</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newUser.branchId}
                    onValueChange={(val) => setNewUser((u) => ({ ...u, branchId: val }))}
                  >
                    <Picker.Item label="Select branch..." value="" />
                    {branches.map((branch) => (
                      <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <Button onPress={handleAddUser} fullWidth>
                Add User
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerSection: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  addButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.emerald[600], alignItems: 'center', justifyContent: 'center',
  },
  addButtonText: { color: colors.white, fontSize: 22, fontWeight: '300', lineHeight: 24 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  userCard: { gap: 12 },
  userHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.emerald[600], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  userName: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  userEmail: { fontSize: 13, color: colors.gray[500] },
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  roleText: { fontSize: 13, fontWeight: '600' },
  branchBadge: {
    backgroundColor: colors.gray[50], borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  branchText: { fontSize: 13, color: colors.gray[600] },
  accessNote: {
    backgroundColor: colors.purple[50], borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: '#e9d5ff',
  },
  accessNoteText: { fontSize: 12, color: colors.purple[700] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: colors.gray[700] },
  pickerWrapper: {
    backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200],
    borderRadius: 12, overflow: 'hidden', height: 46, justifyContent: 'center',
  },
});
