import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  UIManager,
  LayoutAnimation,
  FlatList,
  StyleSheet,
} from 'react-native'
import { isEqual } from 'lodash'
import RowSubItem from './RowSubItem'
import ItemIcon from './ItemIcon'
import { callIfFunction } from '../helpers'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}
const shouldNotRerender = (prevProps, nextProps) => {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
 const { getChildren, item, childItemId, itemId } = prevProps;

  if (nextProps.selectedItems !== prevProps.selectedItems) {
    // a subitem of this item  gets deselected
    if (
       getChildren(item) &&
       getChildren(item).some(
        el =>
        !prevProps.selectedItems.includes(childItemId(el)) &&
        nextProps.selectedItems.includes(childItemId(el))
      )
    ) {
    console.log('--row render: next !sub inc, prev sub !inc', prevProps.item);

      return false
    }
    // a subitem of this item gets selected
    if (
       getChildren(item) &&
       getChildren(item).some(
        el =>
          prevProps.selectedItems.includes(childItemId(el)) &&
          !nextProps.selectedItems.includes(childItemId(el))
      )
    ) {
      console.log('--row render: prev sub inc, next sub inc', prevProps.item);

      return false
    }
    if (
      prevProps.selectedItems.includes(itemId(item)) &&
      !nextProps.selectedItems.includes(itemId(item))
    ) {
      console.log('--row render: next !inc, prev !inc', prevProps.item);

      return false
    }
    if (
      !prevProps.selectedItems.includes(itemId(item)) &&
      nextProps.selectedItems.includes(itemId(item))
    ) {
      console.log('--row render: next inc, prev !inc', prevProps.item);

      return false
    }
  }
  if (!isEqual(prevProps.styles, nextProps.styles)) {
    console.log('--row render: styles !== styles', prevProps.item);
    return false
  }
  if (!isEqual(prevProps.colors, nextProps.colors)) {
    console.log('--row render: styles !== styles', prevProps.item);
    return false
  }
  return false
}

const RowItem = React.memo(props => {
  const [toggled, setToggled] = React.useState(false)
  const [subToggled, setSubToggled] = React.useState(null)
  const [showSubCategories, setShowSubCategories] = React.useState(null)

  const {
    item,
    customLayoutAnimation,
    readOnlyHeadings,
    animateDropDowns,
    _toggleItem,
    _toggleChildren,
    highlightedChildren,
    searchTerm,
    styles,
    colors,
    itemId,
    childItemId,
    getChildren,
    showDropDowns,
    expandDropDowns,
    itemFontFamily,
    selectedIconPosition,
    itemIconPosition,
    parentsToggleChildrenOnly,
    itemNumberOfLines,
    displayKey,
    selectedItems,
    iconKey,
    iconRenderer: Icon,
    subItemsFlatListProps,
    components,
  } = props
  
  //expand dropdowns on mount if prop is set
  React.useEffect(() => {
    if (expandDropDowns) {
      setShowSubCategories(true)
    }
  }, [])

  const itemSelected = () => {
    return selectedItems.includes(itemId(item))
  }

  const toggleItem = item => {
    _toggleItem(item, 'parent-item')
  }

  const toggleSubItem = item => {
    // we are only concerned about
    // triggering shouldComponentUpdate
    const id = itemId(item)
    if (subToggled === itemId(item)) {
      setSubToggled(false)
    } else {
      setSubToggled(id)
    }
    _toggleItem(item, 'child-item')
  }

  const toggleDropDown = () => {
    const animation =
      customLayoutAnimation || LayoutAnimation.Presets.easeInEaseOut
    animateDropDowns && LayoutAnimation.configureNext(animation)
    setShowSubCategories(!showSubCategories)
  }

  const showSubCategoryDropDown = () => {
    if (searchTerm.length) {
      return true
    }
    if (showDropDowns) {
      return showSubCategories
    }

    return true
  }

  const hasChildren = React.useMemo(() => {
    // check if the children array is empty
    // so we can not show the dropdown toggle
    const hasChildren = getChildren(item) && getChildren(item).length > 0
    return hasChildren
  })


  const dropDownOrToggle = () => {
    if (readOnlyHeadings && hasChildren && showDropDowns) {
      toggleDropDown()
    } else if (hasChildren && parentsToggleChildrenOnly) {
      // we need to keep track of whether
      // the parent is toggled even though
      // we're not actually toggling it
      setToggled(!toggled)
      _toggleChildren(item, false, toggled)
    } else {
      toggleItem(item)
    }
  }

  const renderSubItemFlatList = ({ item: subItem }) => (
    <components.RowSubItem
      _toggleSubItem={toggleSubItem}
      subItem={subItem}
      highlightedChildren={highlightedChildren}
      {...props}
    />
  )

  // const renderSubSeparator = () => (
  //   <View
  //     style={[
  //       {
  //         flex: 1,
  //         height: StyleSheet.hairlineWidth,
  //         alignSelf: 'stretch',
  //         backgroundColor: '#dadada',
  //       },
  //       styles.subSeparator,
  //     ]}
  //   />
  // )

  const renderSelectedIcon = () => {    
    return itemSelected()
      ? <components.SelectedIcon />
      : <components.UnselectedIcon />
  }

  const hasDropDown = hasChildren && showDropDowns
  console.log('row render2', item)

  return (
    <View>
      <View
        style={[
          {
            flexDirection: 'row',
            flex: 1,
            backgroundColor: colors.itemBackground,
          },
          styles.itemWrapper,
        ]}
      >
        <TouchableOpacity
          disabled={(readOnlyHeadings && !showDropDowns) || item.disabled}
          onPress={dropDownOrToggle}
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingVertical: 6,
            },
            styles.item,
            itemSelected() && styles.selectedItem,
          ]}
        >
          {selectedIconPosition === 'left' && renderSelectedIcon()}
          {itemIconPosition === 'left' && iconKey && item[iconKey] && (
            <ItemIcon
              iconRenderer={Icon}
              iconKey={iconKey}
              icon={item[iconKey]}
              style={[
                styles.itemIcon,
                itemSelected() && styles.itemIconSelected,
              ]}
            />
          )}
          <View style={styles.itemTextContainer}>
          <Text
            numberOfLines={itemNumberOfLines}
            style={[
              {
                flex: 1,
                color: item.disabled ? colors.disabled : colors.text,
              },
              itemFontFamily,
              styles.itemText,
              itemSelected() && styles.selectedItemText,
            ]}
          >
            {item[displayKey]}
          </Text>
          {item.description && <Text style={
            [
              {
                flex: 1,
                fontSize: 12,
                color: item.disabled ? colors.disabled : colors.subText,
              },
              itemFontFamily,
              styles.descriptionText,
            ]
          }>{item.description}</Text>}
          </View>
          {itemIconPosition === 'right' && iconKey && item[iconKey] && (
            <ItemIcon
              iconRenderer={Icon}
              iconKey={iconKey}
              icon={item[iconKey]}
              style={styles.itemIcon}
            />
          )}
          {selectedIconPosition === 'right' && renderSelectedIcon()}
        </TouchableOpacity>
        {hasDropDown && (
          <TouchableOpacity
            style={[
              {
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingHorizontal: 10,
                backgroundColor: 'transparent',
              },
              styles.toggleIcon,
            ]}
            onPress={toggleDropDown}
          >
            {showSubCategoryDropDown() ? (
              <View>
                <components.DropDownToggleIconDown/>
              </View>
            ) : (
              <View>
                <components.DropDownToggleIconUp/>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
      {getChildren(item) && showSubCategoryDropDown() && (
        <FlatList
          keyExtractor={item => `${childItemId(item)}`}
          data={getChildren(item)}
          extraData={selectedItems}
          ItemSeparatorComponent={components.SubItemSeparator}
          renderItem={renderSubItemFlatList}
          initialNumToRender={20}
          {...subItemsFlatListProps}
        />
      )}
    </View>
  )
}, shouldNotRerender)

export default RowItem
