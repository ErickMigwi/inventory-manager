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
import { Badge, Button, Card, Header, Input, EmptyState } from '../components/ui';
import { colors } from '../components/theme';
import { PackageIcon, CostIcon, ChartIcon, CheckIcon, AlertIcon, ShoppingCartIcon } from '../components/icons';

type FilterType = 'all' | 'low';

interface SaleRecordState {
  productId: string | null;
  quantity: string;
}

export default function RestockScreen() {
  const router = useRouter();
  const { currentBranch, products, restockProduct, addSale } = useApp();
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('low');
  const [saleRecord, setSaleRecord] = useState<SaleRecordState>({ productId: null, quantity: '' });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  const branchProducts = useMemo(() => {
    let filtered = products.filter((p) => p.branchId === currentBranch);
    if (filter === 'low') filtered = filtered.filter((p) => p.quantity <= p.reorderThreshold);
    if (searchQuery) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered.sort((a, b) => (b.sellingPrice - b.costPrice) - (a.sellingPrice - a.costPrice));
  }, [products, currentBranch, filter, searchQuery]);

  // Modal search - all products without filter
  const modalFilteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.branchId === currentBranch);
    if (modalSearch) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(modalSearch.toLowerCase()));
    }
    return filtered.sort((a, b) => (b.sellingPrice - b.costPrice) - (a.sellingPrice - a.costPrice));
  }, [products, currentBranch, modalSearch]);

  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSearchQuery(product.name);
    }
    setIsSearchModalOpen(false);
    setModalSearch('');
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductIds(newSelection);
  };

  const handleClearSelection = () => {
    setSelectedProductIds(new Set());
    setModalSearch('');
  };

  const handleConfirmSelection = () => {
    // Apply suggested quantities to all selected products
    const newQuantities = { ...quantities };
    selectedProductIds.forEach((productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const suggestedQty = Math.max(product.reorderThreshold * 2, 10);
        newQuantities[productId] = suggestedQty.toString();
      }
    });
    setQuantities(newQuantities);
    setIsSearchModalOpen(false);
    setSelectedProductIds(new Set());
    setModalSearch('');
  };

  const lowStockCount = products.filter((p) => p.branchId === currentBranch && p.quantity <= p.reorderThreshold).length;

  const getSuggestedQty = (p: typeof products[0]) => Math.max(p.reorderThreshold * 2, 10);
  const getProfitMargin = (p: typeof products[0]) => (((p.sellingPrice - p.costPrice) / p.costPrice) * 100).toFixed(1);

  const selectedProducts = branchProducts.filter((p) => quantities[p.id]);
  const totals = useMemo(() => {
    const totalCost = selectedProducts.reduce((sum, p) => {
      const qty = Number(quantities[p.id]) || getSuggestedQty(p);
      return sum + p.costPrice * qty;
    }, 0);
    const totalProfit = selectedProducts.reduce((sum, p) => {
      const qty = Number(quantities[p.id]) || getSuggestedQty(p);
      return sum + (p.sellingPrice - p.costPrice) * qty;
    }, 0);
    return { totalCost, totalProfit };
  }, [selectedProducts, quantities]);

  const handleRestock = (productId: string) => {
    const product = branchProducts.find((p) => p.id === productId);
    if (!product) return;
    const qty = Number(quantities[productId]) || getSuggestedQty(product);
    restockProduct(productId, qty);
    Alert.alert('Success', `${product.name} restocked!`);
    const newQ = { ...quantities };
    delete newQ[productId];
    setQuantities(newQ);
  };

  const handleRestockAll = () => {
    selectedProducts.forEach((p) => {
      const qty = Number(quantities[p.id]) || getSuggestedQty(p);
      restockProduct(p.id, qty);
    });
    Alert.alert('Success', `${selectedProducts.length} products restocked!`);
    setQuantities({});
  };

  const handleRecordSaleClick = (productId: string) => {
    setSaleRecord({ productId, quantity: '' });
  };

  const handleRecordSale = () => {
    if (!saleRecord.productId || !saleRecord.quantity) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    const product = products.find((p) => p.id === saleRecord.productId);
    if (!product) return;
    const qty = Number(saleRecord.quantity);
    if (qty > product.quantity) {
      Alert.alert('Error', `Only ${product.quantity} units available`);
      return;
    }
    const revenue = qty * product.sellingPrice;
    const profit = qty * (product.sellingPrice - product.costPrice);
    addSale({ productId: product.id, productName: product.name, quantity: qty, revenue, profit, branchId: currentBranch });
    Alert.alert('Success', `${qty} units of ${product.name} recorded!`);
    setSaleRecord({ productId: null, quantity: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Header title="Restock Products" onBack={() => router.back()} />
        <View style={styles.searchAndFilter}>
          <TouchableOpacity
            onPress={() => setIsSearchModalOpen(true)}
            style={styles.searchButton}
            activeOpacity={0.7}
          >
            <Text style={styles.searchButtonIcon}>🔍</Text>
            <Text style={styles.searchButtonText}>
              {selectedProductIds.size > 0 ? `${selectedProductIds.size} products selected` : 'Search products...'}
            </Text>
          </TouchableOpacity>
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setFilter('low')}
              style={[styles.filterBtn, filter === 'low' && styles.filterBtnActive]}
            >
              <Text style={[styles.filterBtnText, filter === 'low' && styles.filterBtnTextActive]}>
                Low Stock ({lowStockCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            >
              <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>
                All Products
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={branchProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {selectedProducts.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Restock Summary</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <PackageIcon size={18} color={colors.white} />
                    <Text style={styles.summaryLabel}>Items Selected</Text>
                  </View>
                  <Text style={styles.summaryValue}>{selectedProducts.length}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryDivider]}>
                  <View style={styles.summaryLabelRow}>
                    <CostIcon size={18} color={colors.white} />
                    <Text style={styles.summaryLabel}>Est. Restock Cost</Text>
                  </View>
                  <Text style={styles.summaryValue}>KES {totals.totalCost.toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryDivider]}>
                  <View style={styles.summaryLabelRow}>
                    <ChartIcon size={18} color={colors.white} />
                    <Text style={styles.summaryLabel}>Expected Profit</Text>
                  </View>
                  <Text style={[styles.summaryValue, { fontSize: 20 }]}>
                    KES {totals.totalProfit.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRestockAll} style={styles.restockAllBtn}>
                  <CheckIcon size={20} color={colors.emerald[600]} />
                  <Text style={styles.restockAllText}>Restock All Selected</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={filter === 'low' ? 'check' : 'package'}
            title={filter === 'low' ? 'All Stocked Up!' : 'No Products Found'}
            subtitle={filter === 'low' ? 'No products need restocking right now' : 'Try adjusting your search'}
          />
        }
        renderItem={({ item: product }) => {
          const suggestedQty = getSuggestedQty(product);
          const isSelected = !!quantities[product.id];
          const qty = Number(quantities[product.id]) || suggestedQty;
          const cost = product.costPrice * qty;
          const profit = (product.sellingPrice - product.costPrice) * qty;
          const margin = getProfitMargin(product);
          const isLow = product.quantity <= product.reorderThreshold;

          return (
            <Card style={[styles.productCard, isSelected && styles.productCardSelected].filter(Boolean)}>
              <View style={styles.productHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.productNameRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    {isLow && <Badge color="orange">Low Stock</Badge>}
                    {Number(margin) > 30 && <Badge color="emerald">High Profit</Badge>}
                  </View>
                  <Text style={styles.supplierText}>{product.supplier}</Text>
                </View>
              </View>

              <View style={styles.stockRow}>
                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>Current Stock</Text>
                  <Text style={styles.stockValue}>{product.quantity}</Text>
                </View>
                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>Threshold</Text>
                  <Text style={styles.stockValue}>{product.reorderThreshold}</Text>
                </View>
              </View>

              {isSelected ? (
                <>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Restock Quantity</Text>
                    <Input
                      value={quantities[product.id]}
                      onChangeText={(val) => setQuantities((q) => ({ ...q, [product.id]: val }))}
                      keyboardType="numeric"
                      placeholder={suggestedQty.toString()}
                    />
                    <Text style={styles.suggestedText}>Suggested: {suggestedQty} units</Text>
                  </View>

                  <View style={styles.profitBox}>
                    <View style={styles.profitRow}>
                      <Text style={styles.profitLabel}>Cost to Restock</Text>
                      <Text style={styles.profitValue}>KES {cost.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.profitRow, styles.profitDivider]}>
                      <Text style={styles.profitLabel}>Expected Profit</Text>
                      <Text style={[styles.profitValue, { color: colors.emerald[600] }]}>
                        KES {profit.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.marginText}>Profit Margin: {margin}%</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Button onPress={() => handleRestock(product.id)} style={{ flex: 1 }} size="sm">
                      Confirm Restock
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => {
                        const newQ = { ...quantities };
                        delete newQ[product.id];
                        setQuantities(newQ);
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </View>
                  <Button
                    variant="outline"
                    onPress={() => handleRecordSaleClick(product.id)}
                    fullWidth
                    size="sm"
                  >
                    Record Past Sale
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onPress={() => setQuantities((q) => ({ ...q, [product.id]: suggestedQty.toString() }))}
                  style={styles.selectBtn}
                  textStyle={{ color: colors.emerald[600] }}
                >
                  Select to Restock
                </Button>
              )}
            </Card>
          );
        }}
      />

      <Modal
        visible={!!saleRecord.productId}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSaleRecord({ productId: null, quantity: '' })}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Past Sale</Text>
              <TouchableOpacity onPress={() => setSaleRecord({ productId: null, quantity: '' })}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {saleRecord.productId && (
              <>
                <View style={styles.saleField}>
                  <Text style={styles.saleLabel}>Quantity Sold</Text>
                  <Input
                    value={saleRecord.quantity}
                    onChangeText={(val) => setSaleRecord((s) => ({ ...s, quantity: val }))}
                    keyboardType="numeric"
                    placeholder="Enter quantity"
                  />
                  <Text style={styles.availableText}>
                    Available: {products.find((p) => p.id === saleRecord.productId)?.quantity} units
                  </Text>
                </View>

                <Button onPress={handleRecordSale} fullWidth size="lg">
                  Record Sale
                </Button>
              </>
            )}
          </Card>
        </View>
      </Modal>

      {/* Product Search Modal */}
      <Modal
        visible={isSearchModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSearchModalOpen(false);
          setModalSearch('');
          setSelectedProductIds(new Set());
        }}
      >
        <SafeAreaView style={styles.searchModalContainer}>
          <View style={styles.searchModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsSearchModalOpen(false);
                setModalSearch('');
                setSelectedProductIds(new Set());
              }}
              style={styles.searchModalCloseButton}
            >
              <Text style={styles.searchModalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.searchModalTitle}>Find Products to Restock</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchModalSearchInput}>
            <Input
              value={modalSearch}
              onChangeText={setModalSearch}
              placeholder="Search by product name..."
              autoFocus
            />
          </View>

          <FlatList
            data={modalFilteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedProductIds.has(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleProductSelection(item.id)}
                  style={[styles.searchModalProductItem, isSelected && styles.searchModalProductItemSelected]}
                  activeOpacity={0.7}
                >
                  <View style={styles.searchModalCheckbox}>
                    <Text style={styles.searchModalCheckboxText}>
                      {isSelected ? '✓' : ''}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchModalProductName}>{item.name}</Text>
                    <Text style={styles.searchModalProductDetails}>
                      Current Stock: {item.quantity} • Reorder at: {item.reorderThreshold} • Profit: {getProfitMargin(item)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.searchModalListContent}
            ListEmptyComponent={
              <View style={styles.searchModalEmpty}>
                <Text style={styles.searchModalEmptyText}>No products found for "{modalSearch}"</Text>
              </View>
            }
          />

          <View style={styles.searchModalActions}>
            <Button
              variant="outline"
              onPress={handleClearSelection}
              style={{ flex: 1 }}
              textStyle={{ color: colors.gray[700] }}
            >
              Clear
            </Button>
            <Button
              onPress={handleConfirmSelection}
              style={{ flex: 1 }}
              disabled={selectedProductIds.size === 0}
            >
              Confirm ({selectedProductIds.size})
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchAndFilter: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  filterBtnActive: { backgroundColor: colors.emerald[600], borderColor: colors.emerald[600] },
  filterBtnText: { fontSize: 12, fontWeight: '500', color: colors.gray[700] },
  filterBtnTextActive: { color: colors.white, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  summaryCard: {
    backgroundColor: colors.emerald[600],
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
    gap: 10,
    shadowColor: colors.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 10, marginTop: 2 },
  summaryLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  summaryValue: { fontSize: 18, fontWeight: '700', color: colors.white },
  restockAllBtn: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  restockAllText: { color: colors.emerald[600], fontWeight: '700', fontSize: 15 },
  productCard: { gap: 12 },
  productCardSelected: { borderColor: colors.emerald[500], borderWidth: 2 },
  productHeader: { flexDirection: 'row' },
  productNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  productName: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  supplierText: { fontSize: 12, color: colors.gray[500] },
  stockRow: { flexDirection: 'row', gap: 10 },
  stockBox: { flex: 1, backgroundColor: colors.gray[50], borderRadius: 10, padding: 10, gap: 2 },
  stockLabel: { fontSize: 11, color: colors.gray[600] },
  stockValue: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  field: { gap: 4 },
  fieldLabel: { fontSize: 12, color: colors.gray[600] },
  suggestedText: { fontSize: 11, color: colors.gray[500] },
  profitBox: { backgroundColor: colors.emerald[50], borderRadius: 12, padding: 12, gap: 8 },
  profitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  profitDivider: { borderTopWidth: 1, borderTopColor: colors.emerald[100], paddingTop: 8, marginTop: 2 },
  profitLabel: { fontSize: 13, color: colors.gray[700] },
  profitValue: { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  marginText: { fontSize: 11, color: colors.gray[500] },
  actionRow: { flexDirection: 'row', gap: 8 },
  selectBtn: { borderColor: colors.emerald[600] },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  modalClose: {
    color: colors.gray[500],
    fontSize: 15,
    fontWeight: '600',
  },
  saleField: {
    gap: 8,
  },
  saleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  availableText: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
  },
  searchButton: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButtonIcon: {
    fontSize: 18,
  },
  searchButtonText: {
    fontSize: 15,
    color: colors.gray[900],
    flex: 1,
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchModalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchModalCloseText: {
    fontSize: 24,
    color: colors.gray[500],
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  searchModalSearchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchModalListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchModalProductItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  searchModalProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  searchModalProductDetails: {
    fontSize: 12,
    color: colors.gray[600],
  },
  searchModalEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  searchModalEmptyText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  searchModalProductItemSelected: {
    backgroundColor: colors.emerald[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald[600],
  },
  searchModalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchModalCheckboxText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emerald[600],
  },
  searchModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
});
