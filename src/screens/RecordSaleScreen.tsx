import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../context/AppContext';
import { Button, Card, Header, Input, Badge } from '../components/ui';
import { colors } from '../components/theme';
import { TrashIcon, PlusIcon, CreditCardIcon, DollarSignIcon } from '../components/icons';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
}

export default function RecordSaleScreen() {
  const router = useRouter();
  const { currentBranch, products, addSale } = useApp();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'cash' | 'mpesa' | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState('254');
  const [showMpesaInput, setShowMpesaInput] = useState(false);

  const branchProducts = products.filter((p) => p.branchId === currentBranch && p.quantity > 0);
  
  // Filter products by search term in modal
  const filteredProducts = branchProducts.filter((p) =>
    p.name.toLowerCase().includes(modalSearch.toLowerCase())
  );
  
  const selectedProduct = branchProducts.find((p) => p.id === selectedProductId);

  // Handle product selection from modal
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductModalOpen(false);
    setModalSearch('');
  };

  // Calculate Order Totals
  const orderTotals = useMemo(() => {
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
    const totalProfit = orderItems.reduce((sum, item) => sum + (item.sellingPrice - item.costPrice) * item.quantity, 0);
    return { revenue: totalRevenue, profit: totalProfit, itemCount: orderItems.length };
  }, [orderItems]);

  // Add item to order
  const handleAddToOrder = () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product');
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (qty > selectedProduct.quantity) {
      Alert.alert('Error', `Only ${selectedProduct.quantity} units available`);
      return;
    }

    // Check if product already in order
    const existingIndex = orderItems.findIndex((item) => item.productId === selectedProduct.id);
    if (existingIndex > -1) {
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantity += qty;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: qty,
          sellingPrice: selectedProduct.sellingPrice,
          costPrice: selectedProduct.costPrice,
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity('');
  };

  // Remove item from order
  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  // Handle Payment Selection
  const handlePaymentModeSelect = (mode: 'cash' | 'mpesa') => {
    setSelectedPaymentMode(mode);
    if (mode === 'mpesa') {
      setShowMpesaInput(true);
    } else {
      handleRecordSale('cash');
    }
  };

  // Validate and record M-Pesa payment
  const handleMpesaConfirm = () => {
    if (mpesaPhone.length < 12) {
      Alert.alert('Error', 'Please enter a valid phone number (254 + 9 digits)');
      return;
    }
    handleRecordSale('mpesa', mpesaPhone);
  };

  // Record Sale
  const handleRecordSale = (paymentMode: 'cash' | 'mpesa', phone?: string) => {
    try {
      orderItems.forEach((item) => {
        addSale({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          revenue: item.sellingPrice * item.quantity,
          profit: (item.sellingPrice - item.costPrice) * item.quantity,
          branchId: currentBranch,
          paymentMode,
          mpesaPhone: phone,
        });
      });

      const message = paymentMode === 'cash'
        ? 'Sale recorded successfully via Cash!'
        : `Sale recorded successfully via M-Pesa (${phone})!`;

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => {
            setOrderItems([]);
            setSelectedProductId('');
            setQuantity('');
            setIsPaymentModalOpen(false);
            setSelectedPaymentMode(null);
            setShowMpesaInput(false);
            setMpesaPhone('254');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to record sale. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Record Sale" onBack={() => router.back()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Product Selection Section */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add Products to Order</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Select Product</Text>
              <TouchableOpacity
                onPress={() => setIsProductModalOpen(true)}
                style={styles.pickerButton}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerButtonText}>
                  {selectedProduct ? `${selectedProduct.name} (Stock: ${selectedProduct.quantity})` : 'Tap to choose a product...'}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.productInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Price</Text>
                    <Text style={styles.infoValue}>KES {selectedProduct.sellingPrice}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Available</Text>
                    <Text style={styles.infoValue}>{selectedProduct.quantity} units</Text>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Quantity</Text>
                  <View style={styles.quantityRow}>
                    <Input
                      value={quantity}
                      onChangeText={setQuantity}
                      placeholder="0"
                      keyboardType="numeric"
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      onPress={handleAddToOrder}
                      style={styles.addButton}
                      activeOpacity={0.7}
                    >
                      <PlusIcon size={20} color={colors.white} />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Card>

          {/* Order Items List */}
          {orderItems.length > 0 && (
            <Card style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>Order Items ({orderItems.length})</Text>
              </View>

              {orderItems.map((item) => (
                <View key={item.productId} style={styles.orderItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} × KES {item.sellingPrice.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemTotal}>KES {(item.sellingPrice * item.quantity).toLocaleString()}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.productId)}
                      style={styles.deleteButton}
                    >
                      <TrashIcon size={16} color={colors.red[600]} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>KES {orderTotals.revenue.toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryDivider]}>
                  <Text style={styles.summaryLabel}>Profit</Text>
                  <Text style={[styles.summaryValue, { color: colors.emerald[600] }]}>
                    KES {orderTotals.profit.toLocaleString()}
                  </Text>
                </View>
              </Card>

              <Button onPress={() => setIsPaymentModalOpen(true)} fullWidth size="lg">
                Proceed to Payment
              </Button>
            </>
          )}

          {orderItems.length === 0 && (
            <View style={styles.emptyState}>
              <ShoppingCartIcon size={48} color={colors.gray[400]} />
              <Text style={styles.emptyStateText}>No items in order</Text>
              <Text style={styles.emptyStateSubtext}>Add products to create an order</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Payment Modal */}
      <Modal visible={isPaymentModalOpen} transparent animationType="slide" onRequestClose={() => setIsPaymentModalOpen(false)}>
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContent}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Select Payment Mode</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalOpen(false)}>
                <Text style={styles.paymentClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {!showMpesaInput ? (
              <View style={styles.paymentOptions}>
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentAmount}>Total: KES {orderTotals.revenue.toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handlePaymentModeSelect('cash')}
                  style={styles.paymentOption}
                  activeOpacity={0.7}
                >
                  <DollarSignIcon size={24} color={colors.emerald[600]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentOptionLabel}>Cash Payment</Text>
                    <Text style={styles.paymentOptionDesc}>Pay with cash on delivery</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePaymentModeSelect('mpesa')}
                  style={styles.paymentOption}
                  activeOpacity={0.7}
                >
                  <CreditCardIcon size={24} color={colors.blue[600]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentOptionLabel}>M-Pesa Payment</Text>
                    <Text style={styles.paymentOptionDesc}>Pay via mobile money</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mpesaForm}>
                <Text style={styles.mpesaTitle}>Enter M-Pesa Phone Number</Text>
                <View style={styles.phoneInputGroup}>
                  <Input
                    value={mpesaPhone}
                    onChangeText={setMpesaPhone}
                    placeholder="254712345678"
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                </View>
                <Text style={styles.phoneHint}>Format: 254 + phone number (9 digits)</Text>

                <View style={styles.mpesaActions}>
                  <Button
                    onPress={() => {
                      setShowMpesaInput(false);
                      setSelectedPaymentMode(null);
                      setMpesaPhone('254');
                    }}
                    variant="outline"
                    fullWidth
                    style={{ marginRight: 8 }}
                  >
                    Back
                  </Button>
                  <Button
                    onPress={handleMpesaConfirm}
                    fullWidth
                    style={{ marginLeft: 8 }}
                  >
                    Confirm
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        visible={isProductModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsProductModalOpen(false);
          setModalSearch('');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsProductModalOpen(false);
                setModalSearch('');
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Product</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalSearchContainer}>
            <Input
              value={modalSearch}
              onChangeText={setModalSearch}
              placeholder="Search products..."
              autoFocus
            />
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectProduct(item.id)}
                style={styles.productItem}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.productItemName}>{item.name}</Text>
                  <Text style={styles.productItemDetails}>
                    Price: KES {item.sellingPrice} • Stock: {item.quantity}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.modalListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found for "{modalSearch}"</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Shopping Cart Icon for empty state
const ShoppingCartIcon = ({ size, color }: { size: number; color: string }) => (
  <Text style={{ fontSize: size * 1.5, color }}>🛒</Text>
);

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  pickerWrapper: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    overflow: 'hidden',
    height: 46,
    justifyContent: 'center',
  },
  picker: {
    color: colors.gray[900],
    height: 66,
  },
  productInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.emerald[600],
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  noResults: {
    color: colors.red[600],
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  orderCard: {
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[900],
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: colors.gray[600],
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emerald[600],
  },
  deleteButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: colors.emerald[50],
    borderWidth: 1,
    borderColor: colors.emerald[200],
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.emerald[200],
    paddingTop: 12,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: colors.gray[600],
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paymentModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  paymentClose: {
    fontSize: 24,
    color: colors.gray[400],
    fontWeight: '300',
  },
  paymentSummary: {
    backgroundColor: colors.blue[50],
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.blue[600],
    textAlign: 'center',
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  paymentOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  mpesaForm: {
    gap: 12,
  },
  mpesaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  phoneInputGroup: {
    gap: 6,
  },
  phoneHint: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
  },
  mpesaActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  pickerButton: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 15,
    color: colors.gray[900],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: colors.gray[500],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  modalSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  productItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  productItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  productItemDetails: {
    fontSize: 13,
    color: colors.gray[600],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});
