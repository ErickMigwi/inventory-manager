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
import { PlusIcon, TrashIcon, EditIcon } from '../components/icons';

export default function ExpenseTrackingScreen() {
  const router = useRouter();
  const { currentBranch, expenses, expenseCategories, addExpense, updateExpense, deleteExpense } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  });

  // Filter expenses by branch
  const branchExpenses = useMemo(() => {
    return expenses.filter((e) => e.branchId === currentBranch);
  }, [expenses, currentBranch]);

  // Group expenses by month
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    branchExpenses.forEach((e) => {
      const date = new Date(e.date);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    return Object.entries(groups)
      .map(([month, items]) => ({
        month,
        total: items.reduce((sum, e) => sum + e.amount, 0),
        items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }, [branchExpenses]);

  const totalExpenses = useMemo(() => {
    return branchExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [branchExpenses]);

  const handleOpenForm = (expenseId?: string) => {
    if (expenseId) {
      const expense = branchExpenses.find((e) => e.id === expenseId);
      if (expense) {
        setFormData({
          category: expense.category,
          amount: expense.amount.toString(),
          date: expense.date,
          notes: expense.notes || '',
          isRecurring: expense.isRecurring,
          recurringFrequency: expense.recurringFrequency || 'monthly',
        });
        setEditingId(expenseId);
      }
    } else {
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        isRecurring: false,
        recurringFrequency: 'monthly',
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.category || !formData.amount) {
      Alert.alert('Error', 'Please fill in category and amount');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const expenseData = {
      category: formData.category,
      amount,
      date: formData.date,
      notes: formData.notes,
      branchId: currentBranch,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
    };

    if (editingId) {
      updateExpense(editingId, expenseData);
      Alert.alert('Success', 'Expense updated');
    } else {
      addExpense(expenseData);
      Alert.alert('Success', 'Expense added');
    }

    setIsModalOpen(false);
    setFormData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      isRecurring: false,
      recurringFrequency: 'monthly',
    });
  };

  const handleDelete = (expenseId: string) => {
    Alert.alert('Delete Expense?', 'This action cannot be undone.', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          deleteExpense(expenseId);
          Alert.alert('Success', 'Expense deleted');
        },
      },
    ]);
  };

  const frequencyLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Expense Tracking" onBack={() => router.back()} />
        <TouchableOpacity
          onPress={() => handleOpenForm()}
          style={styles.addButton}
        >
          <PlusIcon size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Total Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <View>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>KES {totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryMetaText}>{branchExpenses.length} expenses</Text>
          </View>
        </View>
      </Card>

      {/* Expenses List */}
      <FlatList
        data={groupedExpenses}
        keyExtractor={(item) => item.month}
        renderItem={({ item: monthGroup }) => (
          <View style={styles.monthGroup}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{monthGroup.month}</Text>
              <Text style={styles.monthTotal}>
                KES {monthGroup.total.toLocaleString()}
              </Text>
            </View>

            {monthGroup.items.map((expense) => (
              <Card key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseCategory}>{expense.category}</Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                    {expense.notes && (
                      <Text style={styles.expenseNotes}>{expense.notes}</Text>
                    )}
                    {expense.isRecurring && (
                      <View style={styles.recurringBadge}>
                        <Badge color="blue">{`Recurring: ${frequencyLabels[(expense.recurringFrequency || 'monthly') as keyof typeof frequencyLabels]}`}</Badge>
                      </View>
                    )}
                  </View>
                  <Text style={styles.expenseAmount}>
                    KES {expense.amount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.expenseActions}>
                  <TouchableOpacity
                    onPress={() => handleOpenForm(expense.id)}
                    style={styles.actionBtn}
                  >
                    <EditIcon size={18} color={colors.blue[600]} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(expense.id)}
                    style={styles.actionBtn}
                  >
                    <TrashIcon size={18} color={colors.orange[600]} />
                    <Text style={[styles.actionText, { color: colors.orange[600] }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded yet</Text>
            <Button onPress={() => handleOpenForm()} style={styles.emptyButton}>
              Add First Expense
            </Button>
          </View>
        }
      />

      {/* Add/Edit Expense Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Expense' : 'Add Expense'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formContainer}>
            {/* Category Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {expenseCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFormData({ ...formData, category: cat.name })}
                    style={[
                      styles.categoryBtn,
                      formData.category === cat.name && styles.categoryBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        formData.category === cat.name && styles.categoryBtnTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount (KES)</Text>
              <Input
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <Input
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <Input
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Optional notes..."
                multiline
              />
            </View>

            {/* Recurring */}
            <View style={styles.recurringSection}>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                style={styles.recurringCheckbox}
              >
                <Text style={styles.checkboxText}>{formData.isRecurring ? '✓' : ''}</Text>
              </TouchableOpacity>
              <Text style={styles.recurringLabel}>Make this expense recurring</Text>
            </View>

            {formData.isRecurring && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency</Text>
                <View style={styles.frequencyGrid}>
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() =>
                        setFormData({ ...formData, recurringFrequency: freq })
                      }
                      style={[
                        styles.frequencyBtn,
                        formData.recurringFrequency === freq &&
                          styles.frequencyBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.frequencyBtnText,
                          formData.recurringFrequency === freq &&
                            styles.frequencyBtnTextActive,
                        ]}
                      >
                        {frequencyLabels[freq]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.formActions}>
              <Button
                variant="outline"
                onPress={() => setIsModalOpen(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button onPress={handleSubmit} fullWidth>
                {editingId ? 'Update Expense' : 'Add Expense'}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.emerald[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.emerald[600],
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 12, color: colors.gray[600], marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: colors.emerald[600] },
  summaryMeta: {
    alignItems: 'flex-end',
  },
  summaryMetaText: { fontSize: 12, color: colors.gray[600] },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  monthGroup: { marginBottom: 20 },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  monthTitle: { fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  monthTotal: { fontSize: 14, fontWeight: '700', color: colors.emerald[600] },
  expenseCard: { marginBottom: 10, gap: 12 },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  expenseInfo: { flex: 1 },
  expenseCategory: { fontSize: 14, fontWeight: '600', color: colors.gray[900], marginBottom: 4 },
  expenseDate: { fontSize: 12, color: colors.gray[600] },
  expenseNotes: { fontSize: 12, color: colors.gray[600], marginTop: 4, fontStyle: 'italic' },
  recurringBadge: { marginTop: 6 },
  expenseAmount: { fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  expenseActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.blue[600] },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[500], marginBottom: 16 },
  emptyButton: { marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalClose: { fontSize: 28, color: colors.gray[500], fontWeight: '600' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  formContainer: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  formGroup: { gap: 8 },
  formLabel: { fontSize: 13, fontWeight: '600', color: colors.gray[900] },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  categoryBtnActive: {
    backgroundColor: colors.emerald[600],
    borderColor: colors.emerald[600],
  },
  categoryBtnText: { fontSize: 11, fontWeight: '600', color: colors.gray[700], textAlign: 'center' },
  categoryBtnTextActive: { color: colors.white },
  recurringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 10,
  },
  recurringCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxText: { fontSize: 14, fontWeight: '700', color: colors.emerald[600] },
  recurringLabel: { fontSize: 13, color: colors.gray[900], fontWeight: '600' },
  frequencyGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  frequencyBtnActive: {
    backgroundColor: colors.blue[600],
    borderColor: colors.blue[600],
  },
  frequencyBtnText: { fontSize: 11, fontWeight: '600', color: colors.gray[700] },
  frequencyBtnTextActive: { color: colors.white },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingBottom: 20 },
});
