import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Card, Header, EmptyState } from '../components/ui';
import { colors } from '../components/theme';
import { CostIcon, ChartIcon, ReceiptIcon } from '../components/icons';

type Filter = 'all' | 'today' | 'week';

export default function SalesHistoryScreen() {
  const router = useRouter();
  const { currentBranch, sales } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const branchSales = useMemo(() => {
    let filtered = sales.filter((s) => s.branchId === currentBranch);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (filter === 'today') {
      filtered = filtered.filter((s) => s.date.startsWith(today));
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((s) => new Date(s.date) >= weekAgo);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, currentBranch, filter]);

  const totals = useMemo(() => ({
    totalRevenue: branchSales.reduce((sum, s) => sum + s.revenue, 0),
    totalProfit: branchSales.reduce((sum, s) => sum + s.profit, 0),
  }), [branchSales]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }) + ' • ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: '7 Days' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Header title="Sales History" onBack={() => router.back()} />
        <View style={styles.filterRow}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={branchSales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, styles.summaryCardFlex]}>
              <CostIcon size={24} color={colors.gray[900]} />
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>KES {totals.totalRevenue.toLocaleString()}</Text>
            </Card>
            <View style={[styles.summaryCardGreen, styles.summaryCardFlex]}>
              <ChartIcon size={24} color={colors.white} />
              <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.8)' }]}>Total Profit</Text>
              <Text style={[styles.summaryValue, { color: colors.white }]}>
                KES {totals.totalProfit.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="receipt" title="No sales found" subtitle="Sales will appear here" />}
        renderItem={({ item: sale }) => (
          <Card style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <View>
                <Text style={styles.productName}>{sale.productName}</Text>
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>{formatDate(sale.date)}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <Text style={styles.quantityValue}>{sale.quantity}</Text>
              </View>
            </View>
            <View style={styles.saleDivider} />
            <View style={styles.saleFooter}>
              <View>
                <Text style={styles.financialLabel}>Revenue</Text>
                <Text style={styles.financialValue}>KES {sale.revenue.toLocaleString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.financialLabel}>Profit</Text>
                <Text style={[styles.financialValue, { color: colors.emerald[600] }]}>
                  KES {sale.profit.toLocaleString()}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterTab: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  filterTabActive: {
    backgroundColor: colors.emerald[600],
    borderColor: colors.emerald[600],
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  summaryCard: {
    gap: 4,
  },
  summaryCardFlex: {
    flex: 1,
  },
  summaryCardGreen: {
    flex: 1,
    backgroundColor: colors.emerald[600],
    borderRadius: 20,
    padding: 16,
    gap: 4,
    shadowColor: colors.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  saleCard: {
    gap: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  dateRow: {
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  quantityLabel: {
    fontSize: 11,
    color: colors.gray[600],
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  saleDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: 2,
  },
  financialValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[900],
  },
});
