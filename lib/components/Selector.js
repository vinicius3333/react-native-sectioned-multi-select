import * as React from 'react'
import { merge } from 'lodash'
import { View, TouchableWithoutFeedback, Text } from 'react-native'
import { getProp } from '../helpers'
import { useSMSContext } from '../../'

const Selector = ({ styles: stylesFromProps }) => {
  const {
    hideSelect,
    selectIsVisible,
    styles: stylesFromContext,
    disabled,
    _toggleSelect,
    components,
  } = useSMSContext()

  const styles = React.useMemo(
    () => merge({}, stylesFromContext, stylesFromProps),
    [stylesFromContext, stylesFromProps]
  )
  return !hideSelect ? (
    <TouchableWithoutFeedback onPress={_toggleSelect} disabled={disabled}>
      <View
        style={[
          {
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'center',
          },
          styles.selectToggle,
        ]}
      >
        {_getSelectLabel(styles)}
        {selectIsVisible ? (
          <components.SelectToggleOpenIcon />
        ) : (
          <components.SelectToggleIcon />
        )}
      </View>
    </TouchableWithoutFeedback>
  ) : null
}

const _getSelectLabel = styles => {
  const {
    colors,
    selectText,
    selectedText,
    single,
    selectedItems,
    displayKey,
    alwaysShowSelectText,
    renderSelectText,
    selectLabelNumberOfLines,
    _findItem,
  } = useSMSContext()
  let customSelect = null
  if (renderSelectText) {
    customSelect = renderSelectText(getProps)
    if (typeof customSelect !== 'string') {
      return customSelect
    }
  }
  let label = `${selectText} (${selectedItems.length} ${selectedText})`
  if (!single && alwaysShowSelectText) {
    label = selectText
  }
  if (!selectedItems || selectedItems.length === 0) {
    label = selectText
  } else if (single || selectedItems.length === 1) {
    const item = selectedItems[0]
    const foundItem = _findItem(item)
    label = getProp(foundItem, displayKey) || selectText
  }
  if (renderSelectText && customSelect && typeof customSelect === 'string') {
    label = customSelect
  }
  return (
    <Text
      numberOfLines={selectLabelNumberOfLines}
      style={[
        {
          flex: 1,
          fontSize: 16,
          color: colors.selectToggleText,
        },
        styles.selectToggleText,
      ]}
    >
      {label}
    </Text>
  )
}

export default Selector
