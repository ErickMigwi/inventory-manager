import { Stack } from 'expo-router';
import { AppProvider } from '../src/context/AppContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="products/index" />
            <Stack.Screen name="products/add" />
            <Stack.Screen name="products/edit/[id]" />
            <Stack.Screen name="sales/new" />
            <Stack.Screen name="sales/index" />
            <Stack.Screen name="restock" />
            <Stack.Screen name="low-stock" />
            <Stack.Screen name="branches" />
            <Stack.Screen name="users" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="payment-reconciliation" />
            <Stack.Screen name="cash-register" />
            <Stack.Screen name="expenses" />
          </Stack>
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
