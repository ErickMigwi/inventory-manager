import { useTheme } from '../context/ThemeContext';

export function useThemedColors() {
  const { colors } = useTheme();
  return colors;
}
