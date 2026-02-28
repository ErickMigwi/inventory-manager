import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input } from '../components/ui';
import { PackageIcon, EyeIcon, EyeOffIcon } from '../components/icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useApp();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {
      Alert.alert('Login Failed', 'Invalid credentials. Try john@shop.co.ke');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.logo}>
              <PackageIcon size={56} color={colors.primary[600]} />
            </View>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to manage your inventory</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>Email or Phone</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordContainer}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eyeButton}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeIcon size={20} color={colors.gray[500]} />
                  ) : (
                    <EyeOffIcon size={20} color={colors.gray[500]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Button onPress={handleLogin} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }}>
              Sign In
            </Button>

            {/* Demo hint */}
            <View style={s.demoCard}>
              <Text style={s.demoText}>
                <Text style={{ fontWeight: '700' }}>Demo credentials:{'\n'}</Text>
                Admin: john@shop.co.ke{'\n'}
                Staff: mary@shop.co.ke{'\n'}
                Password: any
              </Text>
            </View>
          </View>

          <Text style={s.tagline}>Track Inventory. Maximize Profit.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 32,
      justifyContent: 'space-between',
    },
    header: {
      paddingTop: 40,
      paddingBottom: 24,
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: colors.primary[600],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: colors.gray[900],
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.gray[600],
    },
    form: {
      gap: 16,
    },
    fieldGroup: {
      gap: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.gray[700],
    },
    passwordContainer: {
      flexDirection: 'row',
    },
    eyeButton: {
      width: 46,
      height: 46,
      backgroundColor: colors.gray[50],
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: colors.gray[200],
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    demoCard: {
      backgroundColor: colors.blue[50],
      borderWidth: 1,
      borderColor: colors.blue[200],
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
    },
    demoText: {
      fontSize: 13,
      color: colors.blue[800],
      lineHeight: 20,
    },
    tagline: {
      textAlign: 'center',
      fontSize: 13,
      color: colors.gray[500],
      paddingTop: 24,
    },
  });
