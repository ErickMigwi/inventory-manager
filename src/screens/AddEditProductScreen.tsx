import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Button, Card, Header, Input } from '../components/ui';
import { colors } from '../components/theme';
import { SaveIcon } from '../components/icons';

export default function AddEditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { currentBranch, products, addProduct, updateProduct } = useApp();

  const isEdit = !!id;
  const existingProduct = id ? products.find((p) => p.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    supplier: '',
    reorderThreshold: '',
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        costPrice: existingProduct.costPrice.toString(),
        sellingPrice: existingProduct.sellingPrice.toString(),
        quantity: existingProduct.quantity.toString(),
        supplier: existingProduct.supplier,
        reorderThreshold: existingProduct.reorderThreshold.toString(),
      });
    }
  }, [existingProduct]);

  const profitPerItem =
    formData.costPrice && formData.sellingPrice
      ? Number(formData.sellingPrice) - Number(formData.costPrice)
      : 0;

  const totalProfit =
    formData.quantity && profitPerItem > 0 ? profitPerItem * Number(formData.quantity) : 0;

  const handleSubmit = () => {
    if (!formData.name || !formData.costPrice || !formData.sellingPrice || !formData.quantity || !formData.supplier || !formData.reorderThreshold) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const productData = {
      name: formData.name,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      quantity: Number(formData.quantity),
      supplier: formData.supplier,
      reorderThreshold: Number(formData.reorderThreshold),
      branchId: currentBranch,
    };

    if (isEdit && id) {
      updateProduct(id, productData);
      Alert.alert('Success', 'Product updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      addProduct(productData);
      Alert.alert('Success', 'Product added successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  const update = (key: keyof typeof formData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEdit ? 'Edit Product' : 'Add Product'}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.formCard}>
            <View style={styles.field}>
              <Text style={styles.label}>Product Name</Text>
              <Input
                value={formData.name}
                onChangeText={update('name')}
                placeholder="e.g., Rice 5kg"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Cost Price (KES)</Text>
                <Input
                  value={formData.costPrice}
                  onChangeText={update('costPrice')}
                  placeholder="450"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Selling Price (KES)</Text>
                <Input
                  value={formData.sellingPrice}
                  onChangeText={update('sellingPrice')}
                  placeholder="650"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Quantity</Text>
                <Input
                  value={formData.quantity}
                  onChangeText={update('quantity')}
                  placeholder="45"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Reorder Threshold</Text>
                <Input
                  value={formData.reorderThreshold}
                  onChangeText={update('reorderThreshold')}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Supplier</Text>
              <Input
                value={formData.supplier}
                onChangeText={update('supplier')}
                placeholder="e.g., Mwea Rice Suppliers"
              />
            </View>
          </Card>

          {/* Profit Calculation */}
          <View style={styles.profitCard}>
            <Text style={styles.profitSectionTitle}>Profit Calculation</Text>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Profit per Item</Text>
              <Text style={styles.profitAmount}>KES {profitPerItem.toLocaleString()}</Text>
            </View>
            <View style={[styles.profitRow, styles.profitDivider]}>
              <Text style={styles.profitLabel}>Total Expected Profit</Text>
              <Text style={[styles.profitAmount, { fontSize: 22 }]}>
                KES {totalProfit.toLocaleString()}
              </Text>
            </View>
          </View>

          <Button onPress={handleSubmit} fullWidth size="lg">
            {isEdit ? 'Update Product' : 'Save Product'}
          </Button>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  formCard: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  profitCard: {
    backgroundColor: colors.emerald[600],
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: colors.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  profitSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    marginTop: 4,
  },
  profitLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  profitAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
