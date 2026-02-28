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
import { Button, Card, Header, Input } from '../components/ui';
import { colors } from '../components/theme';
import { TrashIcon, PlusIcon } from '../components/icons';

interface DamagedItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  date: string;
  branchId: string;
}

export default function DamagedGoodsScreen() {
  const router = useRouter();
  const { currentBranch, products } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
  });

  const branchProducts = useMemo(() => {
    return products.filter((p) => p.branchId === currentBranch);
  }, [products, currentBranch]);

  const branchDamagedItems = useMemo(() => {
    return damagedItems.filter((d) => d.branchId === currentBranch);
  }, [damagedItems, currentBranch]);

  const handleAddDamagedItem = () => {
    if (!formData.productId || !formData.quantity || !formData.reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const product = products.find((p) => p.id === formData.productId);
    if (!product) {
      Alert.alert('Error', 'Product not found');
      return;
    }

    const newItem: DamagedItem = {
      id: Date.now().toString(),
      productId: formData.productId,
      productName: product.name,
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
      date: new Date().toISOString().split('T')[0],
      branchId: currentBranch,
    };

    setDamagedItems((prev) => [newItem, ...prev]);
    Alert.alert('Success', 'Damaged item recorded');
    setFormData({ productId: '', quantity: '', reason: '' });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item?', 'Remove this damaged goods record?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          setDamagedItems((prev) => prev.filter((d) => d.id !== itemId));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Damaged Goods" onBack={() => router.back()} />
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={styles.addButton}
        >
          <PlusIcon size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <View>
            <Text style={styles.summaryLabel}>Total Damaged Items</Text>
            <Text style={styles.summaryValue}>{branchDamagedItems.length}</Text>
          </View>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryMetaText}>
              {branchDamagedItems.reduce((sum, d) => sum + d.quantity, 0)} units
            </Text>
          </View>
        </View>
      </Card>

      {/* Items List */}
      <FlatList
        data={branchDamagedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} units • {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text style={styles.itemReason}>Reason: {item.reason}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item.id)}
                style={styles.deleteBtn}
              >
                <TrashIcon size={20} color={colors.orange[600]} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No damaged items recorded</Text>
          </View>
        }
      />

      {/* Add Modal */}
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
            <Text style={styles.modalTitle}>Record Damaged Item</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formContainer}>
            {/* Product Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Product</Text>
              <View style={styles.productGrid}>
                {branchProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => setFormData({ ...formData, productId: product.id })}
                    style={[
                      styles.productBtn,
                      formData.productId === product.id && styles.productBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.productBtnText,
                        formData.productId === product.id && styles.productBtnTextActive,
                      ]}
                    >
                      {product.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quantity Damaged</Text>
              <Input
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                placeholder="Number of units"
                keyboardType="numeric"
              />
            </View>

            {/* Reason */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason</Text>
              <Input
                value={formData.reason}
                onChangeText={(text) => setFormData({ ...formData, reason: text })}
                placeholder="e.g., Broken, Expired, Water damage..."
                multiline
              />
            </View>

            {/* Actions */}
            <View style={styles.formActions}>
              <Button
                variant="outline"
                onPress={() => setIsModalOpen(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button onPress={handleAddDamagedItem} fullWidth>
                Record Damage
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
  headerContainer: { position: 'relative', zIndex: 1 },
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
    backgroundColor: colors.orange[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.orange[600],
  },
  summaryContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: colors.gray[600], marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: colors.orange[600] },
  summaryMeta: { alignItems: 'flex-end' },
  summaryMetaText: { fontSize: 12, color: colors.gray[600] },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  itemCard: { marginBottom: 10, gap: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.gray[900], marginBottom: 4 },
  itemMeta: { fontSize: 12, color: colors.gray[600] },
  itemReason: { fontSize: 12, color: colors.orange[600], marginTop: 4, fontWeight: '500' },
  deleteBtn: { paddingVertical: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[500] },
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
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  productBtnActive: { backgroundColor: colors.orange[600], borderColor: colors.orange[600] },
  productBtnText: { fontSize: 11, fontWeight: '600', color: colors.gray[700], textAlign: 'center' },
  productBtnTextActive: { color: colors.white },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingBottom: 20 },
});
