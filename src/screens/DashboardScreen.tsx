import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { colors } from '../components/theme';
import { Card } from '../components/ui';
import BottomNav from '../components/BottomNav';
import { Picker } from '@react-native-picker/picker';
import { MenuIcon, PackageIcon, ChartIcon, ShoppingCartIcon, AlertIcon, PlusIcon, ReceiptIcon, RefreshIcon, DashboardIcon, CreditCardIcon, DollarSignIcon, TrashIcon } from '../components/icons';

const { width } = Dimensions.get('window');
const chartWidth = width - 64;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, currentBranch, branches, products, sales, setCurrentBranch, logout } = useApp();

  const branchProducts = products.filter((p) => p.branchId === currentBranch);
  const branchSales = sales.filter((s) => s.branchId === currentBranch);

  const kpis = useMemo(() => {
    const totalInventoryValue = branchProducts.reduce(
      (sum, p) => sum + p.sellingPrice * p.quantity, 0
    );
    const expectedProfit = branchProducts.reduce(
      (sum, p) => sum + (p.sellingPrice - p.costPrice) * p.quantity, 0
    );
    const today = new Date().toISOString().split('T')[0];
    const todaySales = branchSales.filter((s) => s.date.startsWith(today));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.revenue, 0);
    const lowStockItems = branchProducts.filter((p) => p.quantity <= p.reorderThreshold).length;
    return { totalInventoryValue, expectedProfit, todayRevenue, lowStockItems };
  }, [branchProducts, branchSales]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const profits: number[] = [];
    const revenues: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySales = branchSales.filter((s) => s.date.startsWith(dateStr));
      labels.push(date.toLocaleDateString('en', { weekday: 'short' }));
      profits.push(daySales.reduce((sum, s) => sum + s.profit, 0));
      revenues.push(daySales.reduce((sum, s) => sum + s.revenue, 0));
    }
    return { labels, profits, revenues };
  }, [branchSales]);

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.emerald[600] },
    propsForBackgroundLines: { stroke: colors.gray[100] },
    decimalPlaces: 0,
    labelColor: () => colors.gray[500],
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <MenuIcon size={20} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>

        {/* Branch Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={currentBranch}
            onValueChange={setCurrentBranch}
            style={styles.picker}
            itemStyle={{ fontSize: 14, height: 54, paddingVertical: 10, backgroundColor: colors.red[50] }}
          >
            {branches.map((branch) => (
              <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.dateText}>{today}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <Card style={styles.kpiCard}>
            <PackageIcon size={24} color={colors.gray[900]} />
            <Text style={styles.kpiLabel}>Inventory Value</Text>
            <Text style={styles.kpiValue}>KES {kpis.totalInventoryValue.toLocaleString()}</Text>
          </Card>

          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <ChartIcon size={24} color={colors.white} />
            <Text style={[styles.kpiLabel, { color: 'rgba(255,255,255,0.8)' }]}>Expected Profit</Text>
            <Text style={[styles.kpiValue, { color: colors.white }]}>
              KES {kpis.expectedProfit.toLocaleString()}
            </Text>
          </View>

          <Card style={styles.kpiCard}>
            <ShoppingCartIcon size={24} color={colors.gray[900]} />
            <Text style={styles.kpiLabel}>Today's Sales</Text>
            <Text style={styles.kpiValue}>KES {kpis.todayRevenue.toLocaleString()}</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <AlertIcon size={24} color={colors.orange[600]} />
            <Text style={styles.kpiLabel}>Low Stock Items</Text>
            <Text style={styles.kpiValue}>{kpis.lowStockItems}</Text>
          </Card>
        </View>

        {/* Profit Trend Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Profit Trend (7 Days)</Text>
          <LineChart
            data={{ labels: chartData.labels, datasets: [{ data: chartData.profits.map(v => v || 0) }] }}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
          />
        </Card>

        {/* Sales Overview Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Overview (7 Days)</Text>
          <BarChart
            data={{ labels: chartData.labels, datasets: [{ data: chartData.revenues.map(v => v || 0) }] }}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={true}
            yAxisLabel=""
            yAxisSuffix=""
            showBarTops={false}
          />
        </Card>

        {/* Financial Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Management</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: CreditCardIcon, label: 'Payment Reconciliation', route: '/payment-reconciliation', color: colors.blue[600] },
              { icon: DollarSignIcon, label: 'Cash Register', route: '/cash-register', color: colors.emerald[600] },
              { icon: ChartIcon, label: 'Expense Tracking', route: '/expenses', color: colors.orange[600] },
            ].map((action) => (
              <TouchableOpacity
                key={action.route}
                onPress={() => router.push(action.route as any)}
                style={[styles.actionCard, { backgroundColor: colors.white }]}
                activeOpacity={0.8}
              >
                <action.icon size={28} color={action.color} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: PlusIcon, label: 'Add Product', route: '/products/add', color: colors.emerald[600] },
              { icon: ReceiptIcon, label: 'Record Sale', route: '/sales/new', color: colors.purple[600] },
              { icon: RefreshIcon, label: 'Restock', route: '/restock', color: colors.blue[600] },
              { icon: TrashIcon, label: 'Damaged Goods', route: '/damaged-goods', color: colors.orange[600] },
            ].map((action) => (
              <TouchableOpacity
                key={action.route}
                onPress={() => router.push(action.route as any)}
                style={[styles.actionCard, { backgroundColor: colors.white }]}
                activeOpacity={0.8}
              >
                <action.icon size={32} color={action.color} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
            {/* Full-width View Reports button */}
            <TouchableOpacity
              onPress={() => router.push('/sales' as any)}
              style={[styles.actionCard, styles.actionCardFullWidth, { backgroundColor: colors.white }]}
              activeOpacity={0.8}
            >
              <ChartIcon size={32} color={colors.orange[600]} />
              <Text style={styles.actionLabel}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    color: colors.gray[600],
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  menuIcon: {
    color: colors.gray[700],
  },
  pickerContainer: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  picker: {
    height: 50,
    color: colors.gray[900],
  },
  dateText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: (width - 44) / 2,
    gap: 4,
  },
  kpiCardGreen: {
    backgroundColor: colors.emerald[600],
    borderRadius: 20,
    padding: 16,
    width: (width - 44) / 2,
    shadowColor: colors.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  kpiIcon: {
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.gray[600],
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: 2,
  },
  chartCard: {
    padding: 16,
    gap: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  chart: {
    marginLeft: -16,
    borderRadius: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    height: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  actionCardFullWidth: {
    width: width - 32,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[800],
  },
});
