import React from 'react'
import {
  Modal as RNModal,
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme'

type Props = {
  visible: boolean
  onClose?: () => void
  children: React.ReactNode
  dismissible?: boolean
  title?: string
}

export function Modal({ visible, onClose, children, dismissible = true, title }: Props) {
  const { colors, type } = useTheme()

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <Pressable
        style={styles.overlay}
        onPress={dismissible ? onClose : undefined}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.card,
            { backgroundColor: colors.bgPrimary },
          ]}
        >
          {title ? (
            <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
              {title}
            </Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    width: '100%',
    maxWidth: 400,
  },
})
