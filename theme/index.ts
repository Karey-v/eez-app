import { useColorScheme } from 'react-native'
import { light, dark, brand } from './colors'
import { type } from './typography'
import { spacing } from './spacing'

export { light, dark, brand, type, spacing }

export function useTheme() {
  const scheme = useColorScheme()
  const colors = scheme === 'dark' ? dark : light
  return { colors, brand, type, spacing }
}
