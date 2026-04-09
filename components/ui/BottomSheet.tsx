import React, { useEffect } from 'react'
import { View, Pressable, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

type Props = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  snapHeight?: number
}

export function BottomSheet({ visible, onClose, children, snapHeight = SCREEN_HEIGHT * 0.5 }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(snapHeight)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withTiming(0, { duration: 300 })
    } else {
      translateY.value = withTiming(snapHeight, { duration: 300 })
      opacity.value = withTiming(0, { duration: 300 })
    }
  }, [visible])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.bgPrimary, paddingBottom: insets.bottom },
          sheetStyle,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.borderWeak }]} />
        {children}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
})
