import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../components/theme';
import { Button } from '../components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PackageIcon, ChartIcon, DashboardIcon } from '../components/icons';

const { width } = Dimensions.get('window');

const onboardingSlides = [
  {
    icon: PackageIcon,
    title: 'Track Stock Easily',
    description: 'Manage your inventory in real-time with simple, intuitive tools designed for small shop owners.',
  },
  {
    icon: ChartIcon,
    title: 'Maximize Profit',
    description: 'Understand expected profit before reordering. Make smarter decisions for your business.',
  },
  {
    icon: DashboardIcon,
    title: 'Monitor Performance',
    description: 'Track sales, monitor trends, and watch your business grow with powerful insights.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const navigateToNext = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/login');
    }
  };

  const slide = onboardingSlides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <PackageIcon size={40} color={colors.emerald[600]} />
        </View>
      </View>

      {/* Slide Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <slide.icon size={56} color={colors.emerald[600]} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {/* Dots */}
        <View style={styles.dots}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button onPress={navigateToNext} fullWidth size="lg">
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Continue →'}
          </Button>

          {currentSlide < onboardingSlides.length - 1 && (
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.tagline}>Track Inventory. Maximize Profit.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    paddingTop: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    width: '100%',
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.emerald[600],
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.gray[300],
  },
  buttons: {
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: colors.gray[600],
    fontWeight: '500',
  },
  tagline: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.gray[500],
  },
});
