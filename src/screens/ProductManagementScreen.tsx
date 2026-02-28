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
import { Badge, Card, Header, Input, EmptyState } from '../components/ui';
import { colors } from '../components/theme';
import BottomNav from '../components/BottomNav';
import { EditIcon, AlertIcon, SearchIcon, PackageIcon } from '../components/icons';

export default function ProductManagementScreen() {
  const router = useRouter();
  const { currentBranch, products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const branchProducts = useMemo(() => {
    return products
      .filter((p) => p.branchId === currentBranch)
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, currentBranch, searchQuery]);

  const isLowStock = (product: typeof products[0]) => product.quantity <= product.reorderThreshold;

  const renderProduct = ({ item: product }: { item: typeof products[0] }) => {
    const profit = product.sellingPrice - product.costPrice;
    const totalProfit = profit * product.quantity;

    return (
      <Card style={styles.productCard}>
        {/* Header row */}
        <View style={styles.productHeader}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.productNameRow}>
              <Text style={styles.productName}>{product.name}</Text>
              {isLowStock(product) && <Badge color="orange">Low Stock</Badge>}
            </View>
            <Text style={styles.supplierText}>{product.supplier}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/products/edit/${product.id}` as any)}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <EditIcon size={16} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>

        {/* Prices */}
        <View style={styles.priceRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Cost Price</Text>
            <Text style={styles.priceValue}>KES {product.costPrice}</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Selling Price</Text>
            <Text style={styles.priceValue}>KES {product.sellingPrice}</Text>
          </View>
        </View>

        {/* Stock and profit per item */}
        <View style={styles.stockRow}>
          <View>
            <Text style={styles.stockLabel}>In Stock</Text>
            <Text style={styles.stockValue}>{product.quantity}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.stockLabel}>Profit per Item</Text>
            <Text style={[styles.stockValue, { color: colors.emerald[600] }]}>KES {profit}</Text>
          </View>
        </View>

        {/* Total profit */}
        <View style={styles.totalProfitBox}>
          <Text style={styles.totalProfitLabel}>Total Expected Profit</Text>
          <Text style={styles.totalProfitValue}>KES {totalProfit.toLocaleString()}</Text>
          <Text style={styles.totalProfitSub}>Based on current stock of {product.quantity} units</Text>
        </View>

        {/* Low stock alert */}
        {isLowStock(product) && (
          <View style={styles.lowStockAlert}>
            <AlertIcon size={16} color={colors.orange[700]} />
            <Text style={styles.lowStockText}>
              Below reorder threshold of {product.reorderThreshold} units
            </Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Header title="Products" onBack={() => router.back()} />
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="🔍  Search products..."
            containerStyle={{ flex: 1 }}
          />
        </View>
      </View>

      <FlatList
        data={branchProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="package" title="No products found" subtitle="Add products to get started" />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/products/add' as any)}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <BottomNav active="products" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    zIndex: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: colors.white,
    pointerEvents: 'auto',
  },
  list: {
    padding: 16,
    paddingTop: 45,
    paddingBottom: 120,
    gap: 12,
  },
  productCard: {
    gap: 12,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  supplierText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceBox: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.gray[600],
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  stockLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  totalProfitBox: {
    backgroundColor: colors.emerald[50],
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.emerald[100],
    gap: 4,
  },
  totalProfitLabel: {
    fontSize: 13,
    color: colors.gray[700],
  },
  totalProfitValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.emerald[600],
  },
  totalProfitSub: {
    fontSize: 11,
    color: colors.gray[500],
  },
  lowStockAlert: {
    backgroundColor: colors.orange[50],
    borderWidth: 1,
    borderColor: colors.orange[200],
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lowStockText: {
    fontSize: 12,
    color: colors.orange[800],
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 130,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
