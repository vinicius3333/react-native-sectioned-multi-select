
import * as React from 'react'

import {
  Platform,
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
} from 'react-native'
import useSMSContext from "../context/useSMSContext"
import { callIfFunction } from '../helpers'

const Touchable =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity

export const SelectModal = ({ children, ...rest }) => {
  const {
    _closeSelect,
    getModalProps,
    modalWithSafeAreaView,
    modalWithTouchable,
    selectIsVisible,
    modalComponent,
    styles,
  } = useSMSContext()
  console.log('is vis in modal', selectIsVisible)
  const ModalComponent = modalComponent || Modal;
  const Component = modalWithSafeAreaView ? SafeAreaView : View
  const Wrapper = modalWithTouchable ? TouchableWithoutFeedback : null
  const Backdrop = props =>
    Wrapper ? (
      <Wrapper onPress={_closeSelect}>
        <View {...props} />
      </Wrapper>
    ) : (
      <View {...props} />
    )

  return (
    <ModalComponent {...getModalProps()} {...rest}>
      <Component
        style={[
          { flex: 1, },
          styles.modalWrapper,
        ]}
      >
        <Backdrop
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 0,
            },
            styles.backdrop,
          ]}
        />

        <View
          style={[
            {
              overflow: 'hidden',
              marginHorizontal: 18,
              marginVertical: 26,
              borderRadius: 6,
              alignSelf: 'stretch',
              flex: 1,
              backgroundColor: 'white',
            },
            styles.container,
          ]}
        >
          {children}
        </View>
      </Component>
    </ModalComponent>
  )
}

export const ModalControls = () => {
  const {
    colors,
    styles,
    confirmText,
    confirmFontFamily,
    hideConfirm,
    components,
    showCancelButton,
    _submitSelection,
    _cancelSelection,
  } = useSMSContext()
  
  const confirmFont = confirmFontFamily.fontFamily && confirmFontFamily
  return (
    <View style={{ flexDirection: 'row' }}>
      {showCancelButton && (
        <Touchable
          accessibilityComponentType="button"
          onPress={_cancelSelection}
        >
          <View
            style={[
              {
                width: 54,
                flex: Platform.OS === 'android' ? 0 : 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 0,
                flexDirection: 'row',
                backgroundColor: colors.cancel,
              },
              styles.cancelButton,
            ]}
          >
            {components.CancelIcon}
          </View>
        </Touchable>
      )}
      {!hideConfirm && (
        <Touchable
          accessibilityComponentType="button"
          onPress={_submitSelection}
          style={{ flex: 1 }}
        >
          <View
            style={[
              {
                flex: Platform.OS !== 'ios' ? 1 : 0,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 0,
                flexDirection: 'row',
                backgroundColor: colors.primary,
              },
              styles.button,
            ]}
          >
            <Text
              style={[
                { fontSize: 18, color: '#ffffff' },
                confirmFont,
                styles.confirmText,
              ]}
            >
              {confirmText}
            </Text>
          </View>
        </Touchable>
      )}
    </View>
  )
}
