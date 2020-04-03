import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { isEqual } from 'lodash'
import { View, TouchableOpacity, Text } from 'react-native'
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
    }
    
    if (this.props.parentsHighlightChildren) {
      console.log('parentsHighlightChildren true');
      
      if (this.props.highlightedChildren.includes(this.props.childItemId(this.props.subItem))) {
        console.log('subitem parents highlight all this', this.props.highlightedChildren);
        
        return true
      }
      if (nextProps.highlightedChildren.includes(this.props.childItemId(this.props.subItem))) {
        console.log('subitem parents highlight all next', nextProps.highlightedChildren);

        return true
      }
    }
    if (!isEqual(this.props.styles, nextProps.styles)) {
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
      components,
      colors,
      parentsToggleChildren,
      highlightedChildren,
      childItemId,
      subItem,
      iconRenderer: Icon,
    } = this.props
    const highlightChild = !parentsToggleChildren && highlightedChildren.includes(childItemId(subItem))
    console.log('highlightChild', highlightChild);
    
    const itemSelected = this._itemSelected()
    return itemSelected || highlightChild ?  <components.SelectedIcon highlighted={highlightChild}/> : <components.UnselectedIcon />
  }

  render() {
    const {
      styles,
      colors,
      subItem,
      childItemId,
      subItemFontFamily,
      parentsToggleChildren,
      selectedIconOnLeft,
      highlightedChildren,
      itemNumberOfLines,
      displayKey,
      iconKey,
        iconRenderer: Icon,
    } = this.props
    console.log('highlighted in subs?', highlightedChildren)

    const highlightChild = !parentsToggleChildren && highlightedChildren.includes(childItemId(subItem))
    const itemSelected = this._itemSelected()
    console.log('rowSubItem render', childItemId(subItem))

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
            itemSelected && styles.selectedItem,
            itemSelected && styles.selectedSubItem,
            highlightChild && styles.highlightedItem,
            highlightChild && styles.highlightedSubItem
          ]}
        >
          {selectedIconOnLeft && this._renderSelectedIcon()}

          {iconKey && subItem[iconKey] && (
              <ItemIcon
                iconRenderer={Icon}
                iconKey={iconKey}
                icon={subItem[iconKey]}
                style={[styles.itemIcon, itemSelected() && styles.itemIconSelected]}
              />
          )}
          <View style={styles.subItemTextContainer}>
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
          {subItem.description && <Text style={
            [
              {
                flex: 1,
                fontSize: 12,
                color: subItem.disabled ? colors.disabled : colors.subText,
              },
              subItemFontFamily,
              styles.descriptionText,
            ]
          }>{subItem.description}</Text>}
          </View>
          {!selectedIconOnLeft && this._renderSelectedIcon()}
        </TouchableOpacity>
      </View>
    )
  }
}

export default RowSubItem
