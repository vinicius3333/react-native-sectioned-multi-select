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
import {isEqual} from 'lodash'
import RowSubItem from './RowSubItem'
import ItemIcon from './ItemIcon'
import { callIfFunction } from '../helpers'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const shouldNotRerender = (prevProps, nextProps) => {

  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
  if (!isEqual(prevProps.styles, nextProps.styles)) {
    console.log('should Re-render ', 'styles equal', prevProps.selectedItems);

    return false
  }

  if (nextProps.selectedItems !== prevProps.selectedItems) {

      // propagate updates to child items
      // when adding/removing child items when
      // parent isn't selected

      // a subitem of this item  gets deselected
      if (
        prevProps.item[prevProps.subKey] &&
        prevProps.item[prevProps.subKey].some(el => 
           nextProps.selectedItems.includes(prevProps.childItemId(el)) && !prevProps.selectedItems.includes(prevProps.childItemId(el)) 
        )
      ) {
        console.log('should Rerender ', 'subitem selected', nextProps.selectedItems);

        return false
      }
      // a subitem of this item gets deselected
      if (
        prevProps.item[prevProps.subKey] &&
        prevProps.item[prevProps.subKey].some(el => 
          prevProps.selectedItems.includes(prevProps.childItemId(el)) && !nextProps.selectedItems.includes(prevProps.childItemId(el)) 
          )
      ) {
 
        console.log('should Rerender ', 'subitem deselected', nextProps.selectedItems);

        return false
      }
      if (
        prevProps.selectedItems.includes(
          prevProps.itemId(prevProps.item)
        ) &&
        nextProps.selectedItems.includes(prevProps.itemId(prevProps.item))
      ) {
        console.log('shouldNotRerender ', 'item selected', prevProps.item);
        
        return true
      }
      if (
        !prevProps.selectedItems.includes(
          prevProps.itemId(prevProps.item)
        ) &&
        !nextProps.selectedItems.includes(prevProps.itemId(prevProps.item))
      ) {
        console.log('shouldNotRerender ', 'item not selected', prevProps.item);

        return true
      }

    }
    console.log('should Rerender ', nextProps.item);
    return false;
    
}

const RowItem = React.memo((props) => {

    const [subToggled, setSubToggled] = React.useState(null)
    const [showSubCategories, setShowSubCategories] = React.useState(null)

    const {
      item,
      customLayoutAnimation,      
      readOnlyHeadings,
      animateDropDowns, 
      _toggleItem, 
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
      dropDownToggleIconUpComponent,
      dropDownToggleIconDownComponent,
      unselectedIconComponent,
      selectedIconComponent,
      itemNumberOfLines,
      displayKey,
      selectedItems,
      iconKey,
      iconNames,
      iconRenderer: Icon,
      subItemsFlatListProps,
    } = props
    
    
    //expand dropdowns on mount if prop is set
    React.useEffect(() => {
      if (expandDropDowns) {
        setShowSubCategories(true)
      }
    }, [])

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextProps.selectedItems !== props.selectedItems) {
  //     if (
  //       props.selectedItems.includes(
  //         props.itemId(props.item)
  //       ) &&
  //       !nextProps.selectedItems.includes(props.itemId(props.item))
  //     ) {
  //       return true
  //     }
  //     if (
  //       !props.selectedItems.includes(
  //         props.itemId(props.item)
  //       ) &&
  //       nextProps.selectedItems.includes(props.itemId(props.item))
  //     ) {
  //       return true
  //     }

  //     if (subToggled !== nextState.subToggled) {
  //       return true
  //     }

  //     // propagate updates to child items
  //     // when adding/removing child items when
  //     // parent isn't selected

  //     if (
  //       props.item[props.subKey] &&
  //       props.item[props.subKey].findIndex(el =>
  //         nextProps.selectedItems.includes(props.itemId(el))
  //       ) !== -1
  //     ) {
  //       return true
  //     }
  //     if (
  //       props.item[props.subKey] &&
  //       props.item[props.subKey].findIndex(el =>
  //         props.selectedItems.includes(props.itemId(el))
  //       ) !== -1
  //     ) {
  //       return true
  //     }
  //   }

  //   if (props.searchTerm !== nextProps.searchTerm) {
  //     return true
  //   }
  //   if (showSubCategories !== nextState.showSubCategories) {
  //     return true
  //   }
  //   if (props.styles !== nextProps.styles) {
  //     return true
  //   }
  //       if (props.forceUpdate !== nextProps.forceUpdate) {
  //         return true
  //       }
  //   return false
  // }

    
  const itemSelected = () => {
    return selectedItems.includes(itemId(item))
  }

  const toggleItem = (item) => {
    _toggleItem(item)
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
    _toggleItem(item)
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

  const hasChildren = () => {
    // check if the children array is empty
    // so we can not show the dropdown toggle
    const hasChildren = getChildren(item) && getChildren(item).length > 0
    return hasChildren
  }

  const dropDownOrToggle = () => {
    if (readOnlyHeadings && hasChildren() && showDropDowns) {
      toggleDropDown()
    } else if (readOnlyHeadings) {
    } else {
      toggleItem(item)
    }
  }

  const renderSubItemFlatList = ({ item: subItem }) => (
    <RowSubItem
      _toggleSubItem={toggleSubItem}
      subItem={subItem}
      highlightedChildren={highlightedChildren}
      {...props}
    />
  )

  const renderSubSeparator = () => (
    <View
      style={[
        {
          flex: 1,
          height: StyleSheet.hairlineWidth,
          alignSelf: 'stretch',
          backgroundColor: '#dadada',
        },
        styles.subSeparator,
      ]}
    />
  )
  const renderSelectedIcon = () => {
    return itemSelected()
      ? callIfFunction(selectedIconComponent) || (
          <Icon
            name="check"
            style={{
              fontSize: 16,
              color: colors.success,
              paddingLeft: 10,
            }}
          />
        )
      : callIfFunction(unselectedIconComponent) || null
  }

 
  const hasDropDown = hasChildren() && showDropDowns
  console.log('row render', item);
  
    return (
      <View>
        <View
          style={[
            {
              flexDirection: 'row',
              flex: 1,
              backgroundColor: colors.itemBackground,
            },
            styles.itemWrapper
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
                style={styles.itemIconStyle}
              />
            )}
            <Text
              numberOfLines={itemNumberOfLines}
              style={[
                {
                  flex: 1,
                  color: item.disabled
                    ? colors.disabled
                    : colors.text,
                },
                itemFontFamily,
                styles.itemText,
                itemSelected() && styles.selectedItemText,
              ]}
            >
              {item[displayKey]}
            </Text>
            {itemIconPosition === 'right' && iconKey && item[iconKey] && (
              <ItemIcon
                iconRenderer={Icon}
                iconKey={iconKey}
                icon={item[iconKey]}
                style={styles.itemIconStyle}
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
                  {callIfFunction(dropDownToggleIconUpComponent) || (
                    <Icon
                    name={iconNames.arrowUp}
                    size={22}
                      style={{
                        color: colors.primary,
                      }}
                    />
                  )}
                </View>
              ) : (
                <View>
                  {callIfFunction(dropDownToggleIconDownComponent) || (
                    <Icon
                      name={iconNames.arrowDown}
                      size={22}
                      style={{
                        color: colors.primary,
                      }}
                    />
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
        {getChildren(item) && showSubCategoryDropDown() && (
          <FlatList
            keyExtractor={item => `${childItemId(item)}`}
            data={getChildren(item)}
            ItemSeparatorComponent={renderSubSeparator}
            renderItem={renderSubItemFlatList}
            initialNumToRender={20}
            {...subItemsFlatListProps}
          />
        )}
      </View>
    )

}, shouldNotRerender)

export default RowItem
