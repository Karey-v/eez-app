import { light, dark, brand } from './colors'
import { type } from './typography'
import { spacing } from './spacing'

export { light, dark, brand, type, spacing }

export function useTheme() {
  // Force light mode globally
  const colors = light
  return { colors, brand, type, spacing }
}
