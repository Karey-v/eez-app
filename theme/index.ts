import { light, dark, brand } from './colors'
import { type } from './typography'
import { spacing } from './spacing'

export { light, dark, brand, type, spacing }

export function useTheme() {
  // Force dark mode globally
  const colors = dark
  return { colors, brand, type, spacing }
}
