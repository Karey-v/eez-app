import { TextStyle } from 'react-native'

export const type: Record<string, TextStyle> = {
  heroTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    fontWeight: '400',
  },
  screenTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    fontWeight: '400',
  },
  sectionHead: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    fontWeight: '400',
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: '400',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
}
