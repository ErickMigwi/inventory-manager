import React, { useState, useMemo, useEffect } from 'react';
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
import { useApp } from '../context/AppContext';
import { Button, Card, Header, Input } from '../components/ui';
import { colors } from '../components/theme';
import { PackageIcon, CostIcon, ChartIcon, MapPinIcon, CloseIcon } from '../components/icons';

export default function BranchManagementScreen() {
  const router = useRouter();
  const { user, branches, products, sales, addBranch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Guard: Only admins can access this screen
  if (!user || user.role !== 'admin') {
    return null;
  }

  const branchMetrics = useMemo(() => {
    return branches.map((branch) => {
      const bProducts = products.filter((p) => p.branchId === branch.id);
      const bSales = sales.filter((s) => s.branchId === branch.id);
      return {
        ...branch,
        inventoryValue: bProducts.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0),
        totalRevenue: bSales.reduce((sum, s) => sum + s.revenue, 0),
        totalProfit: bSales.reduce((sum, s) => sum + s.profit, 0),
        productCount: bProducts.length,
      };
    });
  }, [branches, products, sales]);

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    addBranch(newBranch);
    Alert.alert('Success', 'Branch added successfully!');
    setNewBranch({ name: '', location: '' });
    setIsModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Header
          title="Branch Management"
          subtitle="Manage and monitor all branch locations"
          onBack={() => router.back()}
          rightElement={
            <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addButton} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <FlatList
        data={branchMetrics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: branch }) => (
          <Card style={styles.branchCard}>
            <View style={styles.branchHeader}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={styles.branchLocationRow}>
                <MapPinIcon size={14} color={colors.gray[500]} />
                <Text style={styles.branchLocation}>{branch.location}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={[styles.metricBox, { backgroundColor: colors.blue[50] }]}>
                <PackageIcon size={18} color={colors.gray[700]} />
                <Text style={styles.metricLabel}>Products</Text>
                <Text style={styles.metricValue}>{branch.productCount}</Text>
              </View>
              <View style={[styles.metricBox, { backgroundColor: colors.purple[50] }]}>
                <CostIcon size={18} color={colors.gray[700]} />
                <Text style={styles.metricLabel}>Inventory</Text>
                <Text style={[styles.metricValue, { fontSize: 13 }]}>
                  KES {branch.inventoryValue.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.revenueCard}>
              <View style={styles.revenueHeader}>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <ChartIcon size={18} color={colors.white} />
              </View>
              <Text style={styles.revenueAmount}>KES {branch.totalRevenue.toLocaleString()}</Text>
              <View style={styles.revenueDivider} />
              <View style={styles.profitRow}>
                <Text style={styles.profitLabel}>Total Profit</Text>
                <Text style={styles.profitValue}>KES {branch.totalProfit.toLocaleString()}</Text>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Add Branch Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Branch</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <CloseIcon size={24} color={colors.gray[500]} />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Branch Name</Text>
                <Input
                  value={newBranch.name}
                  onChangeText={(val) => setNewBranch((b) => ({ ...b, name: val }))}
                  placeholder="e.g., Karen Branch"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Location</Text>
                <Input
                  value={newBranch.location}
                  onChangeText={(val) => setNewBranch((b) => ({ ...b, location: val }))}
                  placeholder="e.g., Karen"
                />
              </View>
              <Button onPress={handleAddBranch} fullWidth>
                Add Branch
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: colors.white, fontSize: 22, fontWeight: '300', lineHeight: 24 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  branchCard: { gap: 14 },
  branchHeader: { gap: 4 },
  branchName: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  branchLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  branchLocation: { fontSize: 13, color: colors.gray[500] },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricBox: { flex: 1, borderRadius: 14, padding: 12, gap: 4, alignItems: 'center' },
  metricLabel: { fontSize: 11, color: colors.gray[600] },
  metricValue: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  revenueCard: {
    backgroundColor: colors.emerald[600],
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  revenueLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  revenueAmount: { fontSize: 22, fontWeight: '700', color: colors.white },
  revenueDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  profitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profitLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  profitValue: { fontSize: 15, fontWeight: '700', color: colors.white },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: colors.gray[700] },
});
