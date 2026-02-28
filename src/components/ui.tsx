import React from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useThemedColors } from '../hooks/useThemedColors';
import * as Icons from './icons';

// Helper function to create styles with dynamic colors
function getStyles(colors: any) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    buttonSm: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    buttonLg: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 14,
    },
    buttonPrimary: {
      backgroundColor: colors.primary[600],
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonOutline: {
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.gray[200],
    },
    buttonGhost: {
      backgroundColor: 'transparent',
    },
    buttonDanger: {
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.red[200],
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.white,
      fontWeight: '600' as const,
      fontSize: 15,
    },
    buttonTextSm: {
      fontSize: 13,
    },
    buttonTextOutline: {
      color: colors.gray[700],
    },
    buttonTextGhost: {
      color: colors.gray[600],
    },
    buttonTextDanger: {
      color: colors.red[600],
    },
    label: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: colors.gray[700],
      marginBottom: 6,
    },
    input: {
      height: 46,
      backgroundColor: colors.gray[50],
      borderWidth: 1,
      borderColor: colors.gray[200],
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.gray[900],
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.gray[100],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600' as const,
    },
    header: {
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    headerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.gray[900],
    },
    headerSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.gray[500],
    },
    emptyState: {
      alignItems: 'center' as const,
      paddingVertical: 48,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.gray[900],
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.gray[500],
      textAlign: 'center' as const,
    },
  });
}

// Button Component
interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colors = useThemedColors();
  const styles = getStyles(colors);

  const buttonStyles: ViewStyle[] = [
    styles.button,
    size === 'sm' && styles.buttonSm,
    size === 'lg' && styles.buttonLg,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'outline' && styles.buttonOutline,
    variant === 'ghost' && styles.buttonGhost,
    variant === 'danger' && styles.buttonDanger,
    (disabled || loading) && styles.buttonDisabled,
    fullWidth && { width: '100%' },
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const labelStyles: TextStyle[] = [
    styles.buttonText,
    size === 'sm' && styles.buttonTextSm,
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'ghost' && styles.buttonTextGhost,
    variant === 'danger' && styles.buttonTextDanger,
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary[600]} size="small" />
      ) : (
        <Text style={labelStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

// Input Component
interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, containerStyle, style, ...props }: InputProps) {
  const colors = useThemedColors();
  const styles = getStyles(colors);

  return (
    <View style={[{ marginBottom: 0 }, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.gray[400]}
        editable={true}
        selectTextOnFocus={true}
        scrollEnabled={false}
        keyboardType="default"
        returnKeyType="search"
        {...props}
      />
    </View>
  );
}

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const colors = useThemedColors();
  const styles = getStyles(colors);

  return <View style={[styles.card, style]}>{children}</View>;
}

// Badge Component
interface BadgeProps {
  children: string;
  color?: 'orange' | 'red' | 'emerald' | 'blue' | 'purple' | 'gray';
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors = useThemedColors();
  const styles = getStyles(colors);

  const badgeColors = {
    orange: { bg: colors.orange[100], text: '#c2410c' },
    red: { bg: colors.red[100], text: colors.red[700] },
    emerald: { bg: colors.primary[100], text: colors.primary[700] },
    blue: { bg: colors.blue[100], text: colors.blue[700] },
    purple: { bg: colors.purple[100], text: colors.purple[700] },
    gray: { bg: colors.gray[100], text: colors.gray[700] },
  };

  const { bg, text } = badgeColors[color];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{children}</Text>
    </View>
  );
}

// Header Component
interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  subtitle?: string;
}

export function Header({ title, onBack, rightElement, subtitle }: HeaderProps) {
  const colors = useThemedColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Icons.BackIcon size={20} color={colors.gray[700]} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {rightElement && <View>{rightElement}</View>}
      </View>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// Divider
export function Divider({ style }: { style?: ViewStyle }) {
  const colors = useThemedColors();
  return <View style={[{ height: 1, backgroundColor: colors.gray[100] }, style]} />;
}

// Empty State
export function EmptyState({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  const colors = useThemedColors();
  const styles = getStyles(colors);

  const iconMap: Record<string, React.FC<any>> = {
    package: Icons.PackageIcon,
    receipt: Icons.ReceiptIcon,
    check: Icons.CheckIcon,
  };

  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <View style={styles.emptyState}>
      {IconComponent && <IconComponent size={48} color={colors.gray[400]} />}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}
