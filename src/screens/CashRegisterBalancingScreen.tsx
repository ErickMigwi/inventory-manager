import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Card, Header } from '../components/ui';
import { colors } from '../components/theme';
import { DollarSignIcon, CreditCardIcon, ChartIcon, AlertIcon } from '../components/icons';

type PeriodFilter = 'today' | 'week' | 'month';

export default function CashRegisterBalancingScreen() {
  const router = useRouter();
  const { currentBranch, sales, creditSales } = useApp();
  const [period, setPeriod] = useState<PeriodFilter>('today');

  // Get date range based on period
  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    return { startDate, endDate: now };
  };

  // Filter sales by branch and date range
  const periodSales = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    return sales.filter((s) => {
      if (s.branchId !== currentBranch) return false;
      const saleDate = new Date(s.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, currentBranch, period]);

  // Filter credit sales by branch
  const branchCreditSales = useMemo(() => {
    return creditSales.filter((cs) => cs.branchId === currentBranch && !cs.isPaid);
  }, [creditSales, currentBranch]);

  // Calculate totals
  const totals = useMemo(() => {
    let cash = 0;
    let mpesa = 0;
    let credited = 0;
    let totalRevenue = 0;

    periodSales.forEach((s) => {
      totalRevenue += s.revenue;
      if (s.paymentMode === 'cash') cash += s.revenue;
      else if (s.paymentMode === 'mpesa') mpesa += s.revenue;
      else if (s.paymentMode === 'credit') credited += s.revenue;
    });

    branchCreditSales.forEach((cs) => {
      credited += cs.amount;
    });

    const totalReceived = cash + mpesa;

    return { cash, mpesa, credited, totalRevenue, totalReceived };
  }, [periodSales, branchCreditSales]);

  // Get breakdown by transaction
  const transactions = useMemo(() => {
    const trans: any[] = [];

    periodSales.forEach((s) => {
      trans.push({
        type: 'sale',
        id: s.id,
        date: new Date(s.date),
        description: `${s.productName} (${s.quantity}x)`,
        amount: s.revenue,
        paymentMode: s.paymentMode || 'cash',
        paymentStatus: s.paymentStatus,
      });
    });

    branchCreditSales.forEach((cs) => {
      trans.push({
        type: 'credit',
        id: cs.id,
        date: new Date(cs.createdDate),
        description: `Credit: ${cs.creditName}`,
        amount: cs.amount,
        paymentMode: 'credit',
        dueDate: cs.dueDate,
      });
    });

    return trans.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [periodSales, branchCreditSales]);

  const getPeriodLabel = () => {
    const { startDate, endDate } = getDateRange();
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    });

    switch (period) {
      case 'today':
        return `Today (${timeFormatter.format(new Date())})`;
      case 'week':
        return `${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
      case 'month':
        return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(startDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Cash Register Balancing" onBack={() => router.back()} />

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
          >
            <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
              {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.periodLabel}>{getPeriodLabel()}</Text>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, { backgroundColor: colors.emerald[50] }]}>
          <View style={styles.cardData}>
            <View style={styles.cardIcon}>
              <DollarSignIcon size={28} color={colors.emerald[600]} />
            </View>
            <View>
              <Text style={styles.cardLabel}>Cash Received</Text>
              <Text style={styles.cardValue}>KES {totals.cash.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.blue[50] }]}>
          <View style={styles.cardData}>
            <View style={styles.cardIcon}>
              <CreditCardIcon size={28} color={colors.blue[600]} />
            </View>
            <View>
              <Text style={styles.cardLabel}>M-Pesa Received</Text>
              <Text style={styles.cardValue}>KES {totals.mpesa.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.orange[50] }]}>
          <View style={styles.cardData}>
            <View style={styles.cardIcon}>
              <AlertIcon size={28} color={colors.orange[600]} />
            </View>
            <View>
              <Text style={styles.cardLabel}>Credit Outstanding</Text>
              <Text style={styles.cardValue}>KES {totals.credited.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.purple[50] }]}>
          <View style={styles.cardData}>
            <View style={styles.cardIcon}>
              <ChartIcon size={28} color={colors.purple[600]} />
            </View>
            <View>
              <Text style={styles.cardLabel}>Total Revenue</Text>
              <Text style={styles.cardValue}>KES {totals.totalRevenue.toLocaleString()}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Received (Cash + M-Pesa):</Text>
          <Text style={styles.statValue}>KES {totals.totalReceived.toLocaleString()}</Text>
        </View>
        <View style={[styles.statRow, styles.statDivider]}>
          <Text style={styles.statLabel}>Expected Revenue:</Text>
          <Text style={styles.statValue}>KES {totals.totalRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Variance:</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  totals.totalReceived === totals.totalRevenue
                    ? colors.emerald[600]
                    : colors.orange[600],
              },
            ]}
          >
            KES {(totals.totalRevenue - totals.totalReceived).toLocaleString()}
          </Text>
        </View>
      </Card>

      {/* Transaction List */}
      <Text style={styles.transactionTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              {item.paymentMode === 'cash' ? (
                <Text style={styles.iconText}>💵</Text>
              ) : item.paymentMode === 'mpesa' ? (
                <Text style={styles.iconText}>📱</Text>
              ) : (
                <Text style={styles.iconText}>📋</Text>
              )}
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDesc}>{item.description}</Text>
              <Text style={styles.transactionMeta}>
                {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.type === 'credit' && (
                <Text style={styles.transactionDue}>
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              )}
            </View>
            <Text style={styles.transactionAmount}>
              KES {item.amount.toLocaleString()}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.transactionList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: colors.emerald[600],
    borderColor: colors.emerald[600],
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
  periodBtnTextActive: {
    color: colors.white,
  },
  periodLabel: {
    fontSize: 13,
    color: colors.gray[600],
    marginHorizontal: 16,
    marginBottom: 12,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  summaryCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardData: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 10,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[900],
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[900],
    marginHorizontal: 16,
    marginBottom: 8,
  },
  transactionList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 11,
    color: colors.gray[600],
  },
  transactionDue: {
    fontSize: 11,
    color: colors.orange[600],
    marginTop: 2,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[900],
  },
});
