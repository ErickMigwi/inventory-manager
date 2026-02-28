import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, Header, Input } from '../components/ui';
import { colors } from '../components/theme';
import { CheckIcon, AlertIcon, CreditCardIcon } from '../components/icons';

interface FilterState {
  status: 'all' | 'settled' | 'credited';
}

export default function PaymentReconciliationScreen() {
  const router = useRouter();
  const { currentBranch, sales, creditSales, markCreditSalePaid, deleteCreditSale } = useApp();
  const [filter, setFilter] = useState<FilterState['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCredit, setSelectedCredit] = useState<string | null>(null);

  // Filter sales by branch
  const branchSales = useMemo(() => {
    return sales.filter((s) => s.branchId === currentBranch);
  }, [sales, currentBranch]);

  // Filter credit sales by branch
  const branchCreditSales = useMemo(() => {
    return creditSales.filter((cs) => cs.branchId === currentBranch);
  }, [creditSales, currentBranch]);

  // Combined view with filtering
  const filteredRecords = useMemo(() => {
    let records: any[] = [];

    // Add regular sales
    const filteredSales = branchSales.filter((s) => {
      if (filter !== 'all' && s.paymentStatus !== filter) return false;
      if (searchQuery && !s.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    records.push(...filteredSales.map((s) => ({ type: 'sale', data: s })));

    // Add credit sales if filter includes 'credited' or 'all'
    if (filter !== 'settled') {
      const filtered = branchCreditSales.filter((cs) => {
        if (filter === 'credited' && cs.isPaid) return false; // Only show unpaid
        if (searchQuery && !cs.creditName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });
      records.push(...filtered.map((cs) => ({ type: 'credit', data: cs })));
    }

    return records.sort((a, b) => {
      const dateA = a.data.date ? new Date(a.data.date).getTime() : new Date(a.data.createdDate).getTime();
      const dateB = b.data.date ? new Date(b.data.date).getTime() : new Date(b.data.createdDate).getTime();
      return dateB - dateA;
    });
  }, [branchSales, branchCreditSales, filter, searchQuery]);

  const totals = useMemo(() => {
    let settled = 0, credited = 0;

    branchSales.forEach((s) => {
      if (s.paymentStatus === 'settled') settled += s.revenue;
      else if (s.paymentStatus === 'credited') credited += s.revenue;
    });

    branchCreditSales.forEach((cs) => {
      if (!cs.isPaid) credited += cs.amount;
    });

    return { settled, credited };
  }, [branchSales, branchCreditSales]);

  const handleMarkPaid = (creditSaleId: string) => {
    Alert.alert('Mark as Paid?', 'This will mark the credit sale as fully paid.', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Mark Paid',
        onPress: () => {
          markCreditSalePaid(creditSaleId);
          setSelectedCredit(null);
        },
      },
    ]);
  };

  const handleDeleteCredit = (creditSaleId: string) => {
    Alert.alert('Delete Credit Sale?', 'This action cannot be undone.', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          deleteCreditSale(creditSaleId);
          setSelectedCredit(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Payment Reconciliation" onBack={() => router.back()} />

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Settled (Cash/M-Pesa)</Text>
              <Text style={styles.summaryValue}>KES {totals.settled.toLocaleString()}</Text>
            </View>
            <CheckIcon size={32} color={colors.emerald[600]} />
          </View>
        </Card>
        <Card style={[styles.summaryCard, { backgroundColor: colors.orange[50], borderLeftColor: colors.orange[600] }]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Pending (Credit)</Text>
              <Text style={styles.summaryValue}>KES {totals.credited.toLocaleString()}</Text>
            </View>
            <CreditCardIcon size={32} color={colors.orange[600]} />
          </View>
        </Card>
      </View>

      {/* Filters & Search */}
      <View style={styles.filterSection}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search product or customer..."
          containerStyle={styles.searchInput}
        />
        <View style={styles.filterButtons}>
          {(['all', 'settled', 'credited'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilter(status)}
              style={[
                styles.filterBtn,
                filter === status && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filter === status && styles.filterBtnTextActive,
                ]}
              >
                {status === 'all' ? 'All' : status === 'settled' ? 'Settled' : 'Pending'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        renderItem={({ item }) => {
          if (item.type === 'sale') {
            const sale = item.data;
            return (
              <Card style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordTitle}>{sale.productName}</Text>
                    <Text style={styles.recordDate}>
                      {new Date(sale.date).toLocaleDateString()} • {sale.quantity}x
                    </Text>
                  </View>
                  <View style={styles.recordAmount}>
                    <Text style={styles.recordRevenue}>KES {sale.revenue.toLocaleString()}</Text>
                    <Badge
                      color={
                        sale.paymentMode === 'mpesa'
                          ? 'blue'
                          : 'emerald'
                      }
                    >
                      {sale.paymentMode?.toUpperCase() || 'CASH'}
                    </Badge>
                  </View>
                </View>
                {sale.paymentStatus === 'credited' && (
                  <Text style={styles.creditedNote}>Credited Sale</Text>
                )}
              </Card>
            );
          } else {
            const credit = item.data;
            return (
              <Card
                style={[
                  styles.recordCard,
                  credit.isPaid && styles.recordCardPaid,
                ]}
              >
                <TouchableOpacity
                  onPress={() => setSelectedCredit(credit.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recordHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{credit.creditName}</Text>
                      <Text style={styles.recordDate}>
                        Due: {new Date(credit.dueDate).toLocaleDateString()}
                      </Text>
                      {credit.notes && (
                        <Text style={styles.recordNotes}>{credit.notes}</Text>
                      )}
                    </View>
                    <View style={styles.recordAmount}>
                      <Text style={styles.recordRevenue}>KES {credit.amount.toLocaleString()}</Text>
                      <Badge color={credit.isPaid ? 'emerald' : 'orange'}>
                        {credit.isPaid ? 'PAID' : 'PENDING'}
                      </Badge>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          }
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AlertIcon size={48} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />

      {/* Credit Sale Detail Modal */}
      <Modal
        visible={!!selectedCredit}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCredit(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            {selectedCredit &&
              branchCreditSales.find((cs) => cs.id === selectedCredit) && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Credit Sale Details</Text>
                    <TouchableOpacity onPress={() => setSelectedCredit(null)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {(() => {
                    const credit = branchCreditSales.find(
                      (cs) => cs.id === selectedCredit
                    )!;
                    return (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Customer Name:</Text>
                          <Text style={styles.detailValue}>{credit.creditName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Amount:</Text>
                          <Text style={styles.detailValue}>
                            KES {credit.amount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Due Date:</Text>
                          <Text style={styles.detailValue}>
                            {new Date(credit.dueDate).toLocaleDateString()}
                          </Text>
                        </View>
                        {credit.notes && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Notes:</Text>
                            <Text style={styles.detailValue}>{credit.notes}</Text>
                          </View>
                        )}
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Status:</Text>
                          <Badge color={credit.isPaid ? 'emerald' : 'orange'}>
                            {credit.isPaid ? 'PAID' : 'PENDING'}
                          </Badge>
                        </View>

                        {!credit.isPaid && (
                          <View style={styles.actionRow}>
                            <Button
                              variant="outline"
                              onPress={() => handleDeleteCredit(credit.id)}
                              fullWidth
                              size="sm"
                              textStyle={{ color: colors.orange[600] }}
                            >
                              Delete
                            </Button>
                            <Button
                              onPress={() => handleMarkPaid(credit.id)}
                              fullWidth
                              size="sm"
                            >
                              Mark as Paid
                            </Button>
                          </View>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  summaryCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.emerald[600],
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: colors.gray[600], marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  filterSection: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInput: { marginBottom: 8 },
  filterButtons: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: colors.emerald[600], borderColor: colors.emerald[600] },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: colors.gray[700] },
  filterBtnTextActive: { color: colors.white },
  listContent: { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 24 },
  recordCard: { marginBottom: 12 },
  recordCardPaid: { opacity: 0.6 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[900], marginBottom: 4 },
  recordDate: { fontSize: 12, color: colors.gray[600] },
  recordNotes: { fontSize: 11, color: colors.gray[500], marginTop: 4, fontStyle: 'italic' },
  recordAmount: { alignItems: 'flex-end', gap: 6 },
  recordRevenue: { fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  creditedNote: { fontSize: 12, color: colors.orange[600], marginTop: 8, fontWeight: '500' },
  badgeSmall: { marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[500], marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: { width: '100%', maxWidth: 400, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  modalClose: { fontSize: 24, color: colors.gray[400], fontWeight: '600' },
  detailRow: { gap: 8, marginBottom: 12 },
  detailLabel: { fontSize: 12, color: colors.gray[600], fontWeight: '600' },
  detailValue: { fontSize: 14, color: colors.gray[900] },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
});
