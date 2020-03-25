import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, TouchableOpacity, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ItemIcon from './ItemIcon'
import { callIfFunction } from '../helpers'

class RowSubItem extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.selectedItems !== this.props.selectedItems) {
      if (
        this.props.selectedItems.includes(this.props.childItemId(this.props.subItem)) &&
        !nextProps.selectedItems.includes(this.props.childItemId(this.props.subItem))
      ) {
        return true
      }
      if (
        !this.props.selectedItems.includes(this.props.childItemId(this.props.subItem)) &&
        nextProps.selectedItems.includes(this.props.childItemId(this.props.subItem))
      ) {
        return true
      }
      if (this.props.highlightChildren || this.props.selectChildren) {
        if (this.props.highlightedChildren.includes(this.props.childItemId(this.props.subItem))) {
          return true
        }
        if (nextProps.highlightedChildren.includes(this.props.childItemId(this.props.subItem))) {
          return true
        }
      }
    }
    if (this.props.styles !== nextProps.styles) {
      return true
    }

    return false
  }

  _itemSelected = () => {
    const { subItem, childItemId, selectedItems } = this.props
    return selectedItems.includes(childItemId(subItem))
  }

  _toggleItem = () => {
    const { subItem } = this.props
    this.props._toggleSubItem(subItem)
  }

  _renderSelectedIcon = () => {
    const {
      selectedIconComponent,
      unselectedIconComponent,
      colors,
      selectChildren,
      highlightedChildren,
      childItemId,
      subItem,
      iconRenderer: Icon,
    } = this.props
    const highlightChild = !selectChildren && highlightedChildren.includes(childItemId(subItem))
    const itemSelected = this._itemSelected()
    return itemSelected || highlightChild ? (
      <View>
        {selectedIconComponent ? (
          callIfFunction(selectedIconComponent)
        ) : (
          <Icon
            name="check"
            style={{
              fontSize: 16,
              color: highlightChild ? colors.disabled : colors.success,
              paddingLeft: 10,
            }}
          />
        )}
      </View>
    ) : unselectedIconComponent ? (
      callIfFunction(unselectedIconComponent)
    ) : null
  }

  render() {
    const {
      styles,
      colors,
      subItem,
      childItemId,
      subItemFontFamily,
      selectedIconComponent,
      selectChildren,
      selectedIconOnLeft,
      highlightedChildren,
      itemNumberOfLines,
      displayKey,
      iconKey,
        iconRenderer: Icon,
    } = this.props

    const highlightChild = !selectChildren && highlightedChildren.includes(childItemId(subItem))
    const itemSelected = this._itemSelected()
    // console.log('rowSubItem render', childItemId(subItem))

    return (
      <View
        key={childItemId(subItem)}
        style={{
          flexDirection: 'row',
          flex: 1,
          backgroundColor: colors.subItemBackground,
        }}
      >
        <TouchableOpacity
          disabled={highlightChild || subItem.disabled}
          onPress={this._toggleItem}
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingVertical: 6,
            },
            styles.subItem,
            (itemSelected || highlightChild) && styles.selectedItem,
            (itemSelected || highlightChild) && styles.selectedSubItem,
          ]}
        >
          {selectedIconOnLeft && this._renderSelectedIcon()}

          {iconKey && subItem[iconKey] && (
              <ItemIcon
                  iconRenderer={Icon}
                  iconKey={iconKey}
                  icon={subItem[iconKey]}
                  style={styles.itemIconStyle}
              />
          )}
          <Text
            numberOfLines={itemNumberOfLines}
            style={[
              {
                flex: 1,
                color: subItem.disabled ? colors.disabled : colors.subText,
              },
              subItemFontFamily,
              styles.subItemText,
              (itemSelected || highlightChild) && styles.selectedSubItemText,
            ]}
          >
            {subItem[displayKey]}
          </Text>
          {!selectedIconOnLeft && this._renderSelectedIcon()}
        </TouchableOpacity>
      </View>
    )
  }
}

export default RowSubItem
