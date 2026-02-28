import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, Header, EmptyState } from '../components/ui';
import { colors } from '../components/theme';
import BottomNav from '../components/BottomNav';
import { AlertIcon, CheckIcon, ChartIcon } from '../components/icons';

export default function LowStockAlertsScreen() {
  const router = useRouter();
  const { currentBranch, products } = useApp();

  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.branchId === currentBranch && p.quantity <= p.reorderThreshold)
      .sort((a, b) => a.quantity - b.quantity);
  }, [products, currentBranch]);

  const getRecommendedQty = (p: typeof products[0]) => Math.max(p.reorderThreshold * 2, 10);
  const getPotentialProfit = (p: typeof products[0]) => (p.sellingPrice - p.costPrice) * getRecommendedQty(p);

  const getUrgency = (p: typeof products[0]) => {
    const pct = (p.quantity / p.reorderThreshold) * 100;
    if (pct <= 50) return { level: 'Critical', color: 'red' as const, bgColor: colors.red[50] };
    return { level: 'Low', color: 'orange' as const, bgColor: colors.orange[50] };
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Low Stock Alerts"
        subtitle={`${lowStockProducts.length} items need attention`}
        onBack={() => router.back()}
      />

      <FlatList
        data={lowStockProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          lowStockProducts.length > 0 ? (
            <View style={styles.alertBanner}>
              <AlertIcon size={24} color={colors.orange[600]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Action Required</Text>
                <Text style={styles.alertText}>
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} below reorder threshold.
                  Consider restocking soon to avoid stockouts.
                </Text>
              </View>
            </View>
          ) : null
        )}
        ListEmptyComponent={
          <EmptyState icon="check" title="All Good!" subtitle="No low stock alerts at the moment" />
        }
        renderItem={({ item: product }) => {
          const urgency = getUrgency(product);
          const recommendedQty = getRecommendedQty(product);
          const potentialProfit = getPotentialProfit(product);

          return (
            <Card style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Badge color={urgency.color}>{urgency.level}</Badge>
                  </View>
                  <Text style={styles.supplierText}>{product.supplier}</Text>
                </View>
              </View>

              <View style={styles.stockGrid}>
                <View style={[styles.stockBox, { backgroundColor: urgency.bgColor }]}>
                  <Text style={styles.stockLabel}>Current Stock</Text>
                  <Text style={styles.stockValue}>{product.quantity}</Text>
                </View>
                <View style={[styles.stockBox, { backgroundColor: colors.gray[50] }]}>
                  <Text style={styles.stockLabel}>Threshold</Text>
                  <Text style={styles.stockValue}>{product.reorderThreshold}</Text>
                </View>
              </View>

              <View style={styles.recommendBox}>
                <View style={styles.recommendTitleRow}>
                  <ChartIcon size={18} color={colors.gray[900]} />
                  <Text style={styles.recommendTitle}>Restock Recommendation</Text>
                </View>
                <View style={styles.recommendRow}>
                  <Text style={styles.recommendLabel}>Recommended Qty</Text>
                  <Text style={styles.recommendValue}>{recommendedQty} units</Text>
                </View>
                <View style={styles.recommendRow}>
                  <Text style={styles.recommendLabel}>Restock Cost</Text>
                  <Text style={styles.recommendValue}>
                    KES {(product.costPrice * recommendedQty).toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.recommendRow, styles.recommendDivider]}>
                  <Text style={styles.recommendLabel}>Potential Profit</Text>
                  <Text style={[styles.recommendValue, { color: colors.emerald[600] }]}>
                    KES {potentialProfit.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Button onPress={() => router.push('/restock' as any)} style={{ flex: 1 }} size="sm">
                  Restock Now
                </Button>
                <Button
                  variant="outline"
                  onPress={() => router.push(`/products/edit/${product.id}` as any)}
                  size="sm"
                >
                  Edit
                </Button>
              </View>
            </Card>
          );
        }}
      />

      <BottomNav active="alerts" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  alertBanner: {
    backgroundColor: colors.orange[50],
    borderWidth: 1,
    borderColor: colors.orange[200],
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: colors.orange[900], marginBottom: 4 },
  alertText: { fontSize: 13, color: colors.orange[800], lineHeight: 18 },
  productCard: { gap: 12 },
  productHeader: { flexDirection: 'row' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 },
  productName: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  supplierText: { fontSize: 12, color: colors.gray[500] },
  stockGrid: { flexDirection: 'row', gap: 10 },
  stockBox: { flex: 1, borderRadius: 12, padding: 12, gap: 4 },
  stockLabel: { fontSize: 11, color: colors.gray[600] },
  stockValue: { fontSize: 22, fontWeight: '700', color: colors.gray[900] },
  recommendBox: {
    backgroundColor: colors.blue[50],
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.blue[200],
    gap: 8,
  },
  recommendTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recommendTitle: { fontSize: 12, fontWeight: '700', color: colors.blue[900] },
  recommendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recommendDivider: { borderTopWidth: 1, borderTopColor: colors.blue[200], paddingTop: 8, marginTop: 2 },
  recommendLabel: { fontSize: 13, color: colors.gray[700] },
  recommendValue: { fontSize: 13, fontWeight: '600', color: colors.gray[900] },
  actionRow: { flexDirection: 'row', gap: 8 },
});
