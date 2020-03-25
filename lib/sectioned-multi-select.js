import * as React from 'react'
import { PropTypes } from 'prop-types'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  Platform,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import memoizeOne from 'memoize-one';
import { isEqual } from 'lodash'
// import Icon from 'react-native-vector-icons/MaterialIcons'
import { RowItem } from './components'
import { callIfFunction } from './helpers'

const Touchable =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity

const defaultStyles = {
  container: {},
  modalWrapper: {},
  selectToggle: {
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 4,
  },
  selectToggleText: {},
  item: {},
  subItem: {},
  itemText: {
    fontSize: 17,
  },
  subItemText: {
    fontSize: 15,
    paddingLeft: 8,
  },
  selectedItem: {},
  selectedSubItem: {},
  selectedItemText: {},
  selectedSubItemText: {},
  searchBar: {
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {},
  subSeparator: {
    height: 0,
  },
  chipsWrapper: {},
  chipContainer: {},
  chipText: {},
  chipIcon: {},
  searchTextInput: {},
  scrollView: {},
  button: {},
  cancelButton: {},
  confirmText: {},
  toggleIcon: {},
}

const defaultColors = {
  primary: '#3f51b5',
  success: '#4caf50',
  cancel: '#1A1A1A',
  text: '#2e2e2e',
  subText: '#848787',
  selectToggleTextColor: '#333',
  searchPlaceholderTextColor: '#999',
  searchSelectionColor: 'rgba(0,0,0,0.2)',
  chipColor: '#848787',
  itemBackground: '#fff',
  subItemBackground: '#ffffff',
  disabled: '#d7d7d7',
}

const ComponentContainer = ({ children }) => (
  <View
    style={{
      marginTop: 20,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </View>
)

const noResults = (
  <ComponentContainer>
    <Text>Sorry, no results</Text>
  </ComponentContainer>
)

const noItems = (
  <ComponentContainer>
    <Text>Sorry, no items</Text>
  </ComponentContainer>
)

const loadingComp = (
  <ComponentContainer>
    <ActivityIndicator />
  </ComponentContainer>
)

export const SMSContext = React.createContext({
  colors: defaultColors,
  styles: defaultStyles,
})

const SectionedMultiSelect = props => {
  const SMSState = useSectionedMultiSelect(props)

  const { chipsPosition } = props
  return props.children ? (
    <SMSContext.Provider value={SMSState}>{props.children}</SMSContext.Provider>
  ) : (
    <SMSContext.Provider value={SMSState}>
      <ScrollView>
        <SMSState.SelectModal>
          <SMSState._renderHeader />
          <SMSState.Search />
          <SMSState.Items />
          <SMSState._renderControls />
          <SMSState._renderStickyFooter />
        </SMSState.SelectModal>
        {chipsPosition === 'top' && <SMSState._renderChips />}
        {chipsPosition === 'top' && SMSState._customChipsRenderer()}
        <SMSState._renderSelector />
        {chipsPosition === 'bottom' && <SMSState._renderChips />}
        {chipsPosition === 'bottom' && SMSState._customChipsRenderer()}
      </ScrollView>
    </SMSContext.Provider>
  )
}

export default SectionedMultiSelect

function isControlledProp(props, key) {
  return props[key] !== undefined
}

// let date = new Date()

const itemsReducer = (state, action) => {
  console.log('reducer: ', state,action);
  
  switch (action.type) {
    case 'add':
      return [...state, action.item];
    case 'add-single':
      return [action.item];
    case 'remove':
      return [...state.filter(item => item !== action.item)];
      case 'replace-items':
      return [...action.items]
      case'add-items':
      return [...state, ...action.items]
      case'remove-items':
      return [...state.filter(item => !action.items.includes(item))];
    case 'remove-all':
      return [];   
    default:
      return state;
  }
}
const useItemsReducer = () => {  
  const { selectedItems } = useSMSContext()
  let count = 1;
  const [state, dispatch] = React.useReducer(itemsReducer, selectedItems || []);
  return [state, dispatch];
}

export const useSectionedMultiSelect = props => {
  const Icon = props.iconRenderer


  const getInitialState = React.useMemo(() => {
    return {
      styles: StyleSheet.flatten([defaultStyles, props.styles]),
      colors: StyleSheet.flatten([defaultColors, props.colors]),
    }
  }, [props.styles, props.colors])

  const state = getInitialState
  const initialProps = { ...SMSDefaultProps, ...props }
  const getProps = () => {
    return initialProps
  }

  const [selectedItemsInternal, dispatch] = useItemsReducer()

  // const [selectedItemsInternal, setSelectedItemsInternal] = React.useState(
  //   getProps().selectedItems
  // )

  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectIsVisible, setSelectIsVisible] = React.useState(false)
  const [highlightedChildren, setHighlightedChildren] = React.useState([])
  const [forceUpdate, setForceUpdate] = React.useState(false)
  console.log('select is visible:', selectIsVisible)

  // React.useEffect(() => {
  //   date = new Date();
  //   console.log(new Date().valueOf() - date.valueOf());
  // }, []);

  const getProp = (object, key) => object && object[key]

  const rejectProp = (items, fn) => items.filter(fn)

  const find = (id, items, isChild) => {
    if (!items) {
      return {}
    }
    const { getChildren, itemId, childItemId } = getProps()
    const getFn = isChild ? childItemId : itemId
    let i = 0
    let found
    for (; i < items.length; i += 1) {
      if (getFn(items[i]) === id) {
        return items[i]
      } else if (Array.isArray(getChildren(items[i]))) {
        found = find(id, getChildren(items[i]), true)
        if (found) {
          return found
        }
      }
    }
  }

  const findParent = item => {
      const { items, itemId, childItemId, getChildren } = getProps()
      if (!items) {
        return {}
      }
      const id = childItemId(item)
      console.log('find parent id', id)
      if (!id) {
        return {}
      }
      let i = 0
      let found
      for (; i < items.length; i += 1) {
        if (Array.isArray(getChildren(items[i]))) {
          found = find(id, getChildren(items[i]), true)
          if (found) {
            return items[i]
          }
        }
      }
    }

  // removes items that are in array from toSplice 
  // array = children
  // toSplice = current selected items
  const reduceSelected = (array, toSplice) => {
    const { childItemId } = getProps()
    array.reduce((prev, curr) => {
      // if a child item is selected
      toSplice.includes(childItemId(curr)) &&
        toSplice.splice(
          // remove it
          toSplice.findIndex(el => el === childItemId(curr)),
          1
        )
    }, {})
    return toSplice
  }

  const _forceUpdate = () => {
    setForceUpdate(!forceUpdate)
  }

  const _getSelectLabel = () => {
    const {
      selectText,
      selectedText,
      single,
      selectedItems,
      displayKey,
      alwaysShowSelectText,
      renderSelectText,
      selectLabelNumberOfLines,
    } = getProps()
    const { colors, styles } = state
    let customSelect = null

    if (renderSelectText) {
      customSelect = renderSelectText(getProps())
      if (typeof customSelect !== 'string') {
        return customSelect
      }
    }

    let label = `${selectText} (${selectedItemsInternal.length} ${selectedText})`

    if (!single && alwaysShowSelectText) {
      label = selectText
    }
    if (!selectedItemsInternal || selectedItemsInternal.length === 0) {
      label = selectText
    } else if (single || selectedItemsInternal.length === 1) {
      const item = selectedItemsInternal[0]
      const foundItem = _findItem(item)
      console.log('selectlabel item', foundItem)

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
            color: colors.selectToggleTextColor,
          },
          styles.selectToggleText,
        ]}
      >
        {label}
      </Text>
    )
  }

  const _filterItems = searchTerm => {
    const {
      items,
      subKey,
      itemId,
      childItemId,
      getChildren,
      displayKey,
      filterItems,
    } = getProps()

    if (filterItems) {
      return filterItems(searchTerm, items, getProps())
    }
    let filteredItems = []
    let newFilteredItems = []

    items &&
      items.forEach(item => {
        const parts = searchTerm
          .replace(/[\^$\\.*+?()[\]{}|]/g, '\\$&')
          .trim()
          .split(' ')
        const regex = new RegExp(`(${parts.join('|')})`, 'i')

        if (regex.test(getProp(item, displayKey))) {
          filteredItems.push(item)
        }
        if (getChildren(item)) {
          const newItem = Object.assign({}, item)
          newItem[subKey] = []
          getChildren(item).forEach(sub => {
            if (regex.test(getProp(sub, displayKey))) {
              newItem[subKey] = [...getChildren(newItem), sub]
              newFilteredItems = rejectProp(
                filteredItems,
                singleItem => childItemId(item) !== childItemId(singleItem)
              )
              newFilteredItems.push(newItem)
              filteredItems = newFilteredItems
            }
          })
        }
      })

    return filteredItems
  }
  const onSelectedItemsChangeInternal = items => {
    console.log('items passed to onSelInt', items);
    
    const { onSelectedItemsChange } = getProps()
    // setSelectedItemsInternal(items)
    onSelectedItemsChange(items)
  }

  const checkIsParent = item => {
    const { getChildren, items } = getProps()
    
    if (getChildren(item)) {
      return true;
    }
    // this should probably return true
    // if it's a top-level item with no children
    // for (let i = 0; i < items.length; i++) {
    //   if (items[i] === item) {
    //     return true;
    //   }
    // }
  }
  const _checkIsParent = memoizeOne(checkIsParent)
  
  const _removeItem = item => {
    const {
      itemId,
      childItemId,
      selectedItems,
      onSelectedItemsChange,
      parentsHighlightAllChildren,
      onSelectedItemObjectsChange,
    } = getProps()
    console.log('checkisparent in _removeItem')

    const itemToRemove = _checkIsParent(item)
      ? itemId(item)
      : childItemId(item)
    const newItems = rejectProp(
      selectedItemsInternal,
      singleItem => itemToRemove !== singleItem
    )

    dispatch({type: 'remove', item: itemToRemove})

    parentsHighlightAllChildren && _unHighlightChildren(itemToRemove)
    onSelectedItemObjectsChange && _broadcastItemObjects(newItems)
      console.log('remove item triggered');
      
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(newItems)
  }

  const _removeAllItems = () => {
    console.log('remove all items triggered');

    const { onSelectedItemObjectsChange } = getProps()
    // broadcast new selected items state to parent component
    dispatch({type: 'remove-all'})
    onSelectedItemsChangeInternal([])
    setHighlightedChildren([])
    _forceUpdate()
    onSelectedItemObjectsChange && _broadcastItemObjects([])
  }

  const _selectAllItems = () => {
    const {
      items,
      itemId,
      getChildren,
      childItemId,
      onSelectedItemObjectsChange,
      readOnlyHeadings,
    } = getProps()
    console.log('select all triggered');

    let newItems = []
    items &&
      items.forEach(item => {
        if (!readOnlyHeadings) {
          newItems = [...newItems, itemId(item)]
        }
        Array.isArray(getChildren(item)) &&
          getChildren(item).forEach(sub => {
            newItems = [...newItems, childItemId(sub)]
          })
      })
    dispatch({type: 'replace-items', items: newItems})
    onSelectedItemsChangeInternal(newItems)
    _forceUpdate()
    onSelectedItemObjectsChange && onSelectedItemObjectsChange(items)
  }

  const _toggleSelect = () => {
    const { onToggleSelect } = getProps()
    const isVisible = !selectIsVisible
    setSelectIsVisible(isVisible)
    onToggleSelect && onToggleSelect(isVisible)
  }

  const _closeSelect = () => {
    const { onToggleSelect } = getProps()
    setSelectIsVisible(false)
    setSearchTerm('')
    onToggleSelect && onToggleSelect(false)
  }
  const _submitSelection = () => {
    const { onConfirm } = getProps()
    _toggleSelect()
    // reset searchTerm
    setSearchTerm('')
    onConfirm && onConfirm()
  }

  const _cancelSelection = () => {
    const { onCancel } = getProps()
    // _removeAllItems()
    _toggleSelect()
    setSearchTerm('')
    onCancel && onCancel()
  }

  const _itemSelected = item => {
    return selectedItemsInternal.includes(item)
  }

  const _toggleChildren = item => {
    console.log('toggling children of ', item, selectedItemsInternal);
    
    const { onSelectedItemObjectsChange, itemId } = getProps()
    const parentItem = itemId(item)
    const selected = _itemSelected(parentItem)
    let newItems = []
    // the children of this item
    const childItems = _getChildIdsArray(parentItem)
    console.log('childItems', childItems);
    
    if (selected) {
      // newItems = [..._rejectChildren(parentItem)]
      // newItems = rejectProp(newItems, singleItem => parentItem !== singleItem)
      newItems = [..._rejectChildren(parentItem)]

      dispatch({type: 'remove-items', items: childItems})

    } else {
      
      newItems = [..._selectChildren(parentItem)]
      dispatch({type: 'add-items', items: childItems})
    }
    console.log('toggle children triggered', childItems);
    onSelectedItemsChangeInternal(newItems)
    onSelectedItemObjectsChange && _broadcastItemObjects(newItems)
  }

  const _toggleItem = item => {
    const {
      single,
      itemId,
      childItemId,
      parentsSelectAllChildren,
      parentsHighlightAllChildren,
      onSelectedItemObjectsChange,
    } = getProps()
    console.group('_toggleItem')

    const isParent = _checkIsParent(item)
    const itemToToggle = getItemId(item)
    console.log('toggling', itemToToggle, 'isparent?', isParent)

    if (single) {
      _submitSelection()
      dispatch({type: 'add-single', item: itemToToggle})
      onSelectedItemsChangeInternal([itemToToggle])
      onSelectedItemObjectsChange && _broadcastItemObjects([itemToToggle])
    } else {
      const selected = _itemSelected(itemToToggle)
      console.log('selected', selected);
      console.log('items internal before toggle', selectedItemsInternal);
      const selectedItems = [...selectedItemsInternal]
      let newItems = []
      if (selected) {
        if (isParent) {
          if (parentsSelectAllChildren) {
            // remove children
            // newItems = [..._rejectChildren(itemToToggle)]
            // console.log('parentsSelectAllChildren', newItems);
            // //remove parent item
            // newItems = rejectProp(
            //   newItems,
            //   singleItem => itemToToggle !== singleItem
            // )
            // toggling parent when using parentsSelectAll... could be optional here
            _toggleChildren(item)
            dispatch({type: 'remove', item: itemToToggle})
          } else if (parentsHighlightAllChildren) {
            console.log('parentsHighlightAllChildren');

            _unHighlightChildren(itemToToggle)
            // newItems = rejectProp(
            //   selectedItemsInternal,
            //   singleItem => itemToToggle !== singleItem
            // )
            dispatch({type: 'remove', item: itemToToggle})

          } else {
            console.log('newItems selected parent', newItems);

            dispatch({type: 'remove', item: itemToToggle})

            // newItems = rejectProp(
            //   selectedItemsInternal,
            //   singleItem => itemToToggle !== singleItem
            //   )
              console.log('newItems after reject', newItems);
          }
        } else {
          console.log('selected && !isParent', newItems);
          dispatch({type: 'remove', item: itemToToggle})

          // newItems = rejectProp(
          //   selectedItemsInternal,
          //   singleItem => itemToToggle !== singleItem
          // )
          console.log('selected && !isParent', newItems);

          // make parent items deselect when a sub item is deselected
          // const parent = findParent(item)
          // if (parent && true) { newItems = rejectProp(newItems, singleItem => itemId(parent) !== singleItem) }
        }
      } else {
        newItems = [...selectedItems, itemToToggle]

        if (isParent) {
          if (parentsSelectAllChildren) {
            console.log('parentsSelectAllChildren (add)1', newItems);

            newItems = [...newItems, ..._selectChildren(itemToToggle)]
            console.log('parentsSelectAllChildren (add)', newItems);
            _toggleChildren(item)              
            dispatch({type: 'add', item: itemToToggle})

          } else if (parentsHighlightAllChildren) {
            _highlightChildren(itemToToggle)
            dispatch({type: 'add', item: itemToToggle})

          } else {
            dispatch({type: 'add', item: itemToToggle})
          }
        } else {
          dispatch({type: 'add', item: itemToToggle})
        }
      }
      console.groupEnd()

      // broadcast new selected items state to parent component
      onSelectedItemsChangeInternal(newItems)
      onSelectedItemObjectsChange && _broadcastItemObjects(newItems)
    }
  }
  const _removeParent = item => {
    const parent = findParent(item)
    console.log('parent to remove', parent)

    parent && _removeItem(parent)
  }
  const findItem = id => {
    const { items } = getProps()
    return find(id, items)
  }
  const _findItem = memoizeOne(findItem)

  const _highlightChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps()
    const highlighted = [...highlightedChildren]
    if (!items) return
    let i = 0
    for (; i < items.length; i += 1) {
      if (itemId(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !highlighted.includes(childItemId(sub)) &&
            highlighted.push(childItemId(sub))
        })
      }
    }
    console.log('highlighted', highlighted)

    setHighlightedChildren(highlighted)
  }

  const _unHighlightChildren = id => {
    const { items, itemId, getChildren } = getProps()
    const highlighted = [...highlightedChildren]

    const array = items.filter(item => itemId(item) === id)

    if (!array['0']) {
      return
    }
    if (array['0'] && !getChildren(array['0'])) {
      return
    }

    const newHighlighted = reduceSelected(getChildren(array['0']), highlighted)

    setHighlightedChildren(newHighlighted)
  }

  const _selectChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps()
    if (!items) return
    let i = 0
    const selected = []
    for (; i < items.length; i += 1) {
      if (itemId(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !selectedItemsInternal.includes(childItemId(sub)) &&
            selected.push(childItemId(sub))
        })
      }
    }

    // so we have them in state for SubRowItem should update checks
    _highlightChildren(id)
    console.log('selected children to push', selected);
    
    return selected
  }

  const _getChildIdsArray = id => {
    const { items, childItemId, getChildren, itemId } = getProps();
    let newItems = []
    const item = items.filter(item => itemId(item) === id)
    console.log('> item', item);
    if (!item[0]) {
      return newItems;
    }
    const children = getChildren(item[0])
    if (!children) {
      return newItems;
    }
    for (let i = 0; i < children.length; i++) {
      newItems.push(childItemId(children[i]))
    }
    return newItems;
  }

  const _rejectChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps()
    const arrayOfChildren = items.filter(item => itemId(item) === id)
    const selected = [...selectedItemsInternal]
    console.log('was is dis', arrayOfChildren['0']);
    
    if (!arrayOfChildren['0']) {
      return
    }
    if (arrayOfChildren['0'] && !getChildren(arrayOfChildren['0'])) {
      return
    }

    const newSelected = reduceSelected(
      getChildren(arrayOfChildren['0']),
      selected
    )
    console.log('_rejectChildren new selected', getChildren(arrayOfChildren['0']), selected, newSelected);
    

    // update state for SubRowItem component should update checks
    _unHighlightChildren(id)
    return newSelected
  }

  const _getSearchTerm = () => searchTerm

  // get the items back as their full objects instead of an array of ids.
  const _broadcastItemObjects = newItems => {
    const { onSelectedItemObjectsChange } = getProps()

    const fullItems = []
    newItems.forEach(singleSelectedItem => {
      const item = _findItem(singleSelectedItem)
      fullItems.push(item)
    })
    onSelectedItemObjectsChange(fullItems)
  }

  const _customChipsRenderer = () => {
    const { styles, colors } = state
    const { displayKey, items, customChipsRenderer } = getProps()

    return (
      customChipsRenderer &&
      customChipsRenderer({
        colors,
        displayKey,
        items,
        selectedItems: selectedItemsInternal,
        styles,
      })
    )
  }

  const _renderChips = ({ children }) => {
    const { styles, colors } = state
    const {
      single,
      customChipsRenderer,
      showRemoveAll,
      removeAllText,
      showChips,
    } = getProps()
    const removeAll = () =>
      selectedItemsInternal.length > 1 && showRemoveAll ? (
        <View
          style={[
            {
              overflow: 'hidden',
              justifyContent: 'center',
              height: 34,
              borderColor: colors.chipColor,
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 10,
              margin: 3,
              paddingTop: 0,
              paddingRight: 10,
              paddingBottom: 0,
              borderRadius: 20,
              borderWidth: 1,
            },
            styles.chipContainer,
            styles.removeAllChipContainer,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              _removeAllItems()
            }}
            style={[
              {
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
              },
              styles.chipTouchable,
              styles.removeAllChipTouchable,
            ]}
          >
            <Text
              style={[
                {
                  color: colors.chipColor,
                  fontSize: 13,
                  marginRight: 0,
                },
                styles.chipText,
                textStyle,
                styles.removeAllChipText,
              ]}
            >
              {removeAllText}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null

    return children ? (
      children()
    ) : selectedItemsInternal.length > 0 &&
      !single &&
      showChips &&
      !customChipsRenderer ? (
      <View
        style={[
          {
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
          },
          styles.chipsWrapper,
        ]}
      >
        {removeAll()}
        {_displaySelectedChips()}
      </View>
    ) : null
  }

  const _displaySelectedChips = () => {
    return selectedItemsInternal.map(id => (
       <Chip key={id} id={id} />
    ))
  }

  const _renderSeparator = () => {
    const { styles } = state
    return (
      <View
        style={[
          {
            flex: 1,
            height: StyleSheet.hairlineWidth,
            alignSelf: 'stretch',
            backgroundColor: '#dadada',
          },
          styles.separator,
        ]}
      />
    )
  }

  const _renderFooter = () => {
    const { footerComponent } = getProps()
    return <View>{callIfFunction(footerComponent)}</View>
  }

  const _renderHeader = () => {
    const { headerComponent } = getProps()
    return callIfFunction(headerComponent)
  }

  const _renderStickyFooter = () => {
    const { stickyFooterComponent } = getProps()
    return callIfFunction(stickyFooterComponent)
  }

  const _renderSelector = () => {
    const {
      hideSelect,
      disabled,
      selectLabelNumberOfLines,
      selectToggleIconComponent,
      iconNames,
    } = getProps()
    const { styles, colors } = state
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
          {_getSelectLabel()}
          {callIfFunction(selectToggleIconComponent) || (
            <Icon
              size={24}
              name={iconNames.arrowDown}
              style={{ color: colors.selectToggleTextColor }}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    ) : null
  }

  const _renderControls = () => {
    const {
      confirmText,
      confirmFontFamily,
      hideConfirm,
      cancelIconComponent,
      showCancelButton,
    } = getProps()

    const { styles, colors } = state
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
              {callIfFunction(cancelIconComponent) || (
                <Icon
                  size={24}
                  name={iconNames.cancel}
                  style={{ color: 'white' }}
                />
              )}
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
                  flex: Platform.OS === 'android' ? 1 : 0,
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
  const _renderItemFlatList = ({ item }) => {
    const { styles, colors } = state
    // const isParent = _checkIsParent(item)
    return (
      <View>
        <RowItem
          iconRenderer={Icon}
          item={item}
          _itemSelected={_itemSelected}
          // isParent={isParent}
          searchTerm={searchTerm}
          _toggleItem={_toggleItem}
          highlightedChildren={highlightedChildren}
          forceUpdate={forceUpdate}
          {...getProps()}
          styles={styles}
          colors={colors}
          selectedItems={selectedItemsInternal}
        />
      </View>
    )
  }

  const getItemId = item => {
    const { itemId, childItemId } = getProps()
    console.log('checkisparent in getItemId')
    return _checkIsParent(item) ? itemId(item) : childItemId(item)
  }

  const _getItemProps = ({ id }) => {
    const { parentChipsRemoveChildren } = getProps()
    // get the item object
    const item = _findItem(id)
    if (!item) {
      return null
    }

    const itemKey = getItemId(item)
    // check if item has children
    console.log('checkisparent in getItemProps()')

    const isParent = _checkIsParent(item)
    // get the parent id if it's a child item
    // const parentItem = isParent ? undefined : findParent(item)
    const onPress = () =>
      isParent && parentChipsRemoveChildren
        ? _toggleChildren(item)
        : _toggleItem(item)
    return {
      id,
      item,
      itemKey,
      isParent,
      // parentItem,
      onPress,
    }
  }
  const getItemProps = memoizeOne(_getItemProps)
  const getModalProps = () => {
    const { modalSupportedOrientations, modalAnimationType } = getProps()
    return {
      supportedOrientations: modalSupportedOrientations,
      animationType: modalAnimationType,
      transparent: true,
      visible: selectIsVisible,
      onRequestClose: _closeSelect,
    }
  }
  const getStateAndHelpers = () => {
    const { styles, colors } = state
    const { items } = getProps()

    console.log('searchTerm', searchTerm)

    const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items

    return {
      // helper functions
      _toggleSelect,
      _closeSelect,
      _cancelSelection,
      _displaySelectedChips,
      _getSearchTerm,
      _itemSelected,
      _removeAllItems,
      _removeItem,
      _toggleItem,
      _selectAllItems,
      _findItem,
      _filterItems,
      getModalProps,
      getItemProps,
      setSearchTerm,
      // components
      _checkIsParent,
      _renderItemFlatList,
      _renderSeparator,
      _renderFooter,
      _renderChips,
      _renderControls,
      _renderHeader,
      _renderStickyFooter,
      _renderSelector,
      _customChipsRenderer,
      Search,
      SelectModal,
      Items,
      Chip,
      Icon,

      // props
      ...getProps(),
      selectedItems: selectedItemsInternal,

      //state
      searchTerm,
      selectIsVisible,

      styles,
      colors,

      // items to render
      renderItems,
    }
  }

  return getStateAndHelpers()
}
export const useSMSContext = () => React.useContext(SMSContext)

export const Search = () => {
  const {
    hideSearch,
    searchIconComponent,
    searchPlaceholderText,
    searchTextFont,
    Icon,
    searchAdornment,
    autoFocus,
    searchTerm,
    setSearchTerm,
    _submitSelection,
    iconNames,
    colors,
    styles,
  } = useSMSContext()
  return !hideSearch ? (
    <View
      style={[{ flexDirection: 'row', paddingVertical: 5 }, styles.searchBar]}
    >
      <View style={styles.center}>
        {callIfFunction(searchIconComponent) || (
          <Icon
            name={iconNames.search}
            size={18}
            style={{ marginHorizontal: 15 }}
          />
        )}
      </View>
      <TextInput
        value={searchTerm}
        selectionColor={colors.searchSelectionColor}
        onChangeText={searchTerm => setSearchTerm(searchTerm)}
        placeholder={searchPlaceholderText}
        autoFocus={autoFocus}
        selectTextOnFocus
        placeholderTextColor={colors.searchPlaceholderTextColor}
        underlineColorAndroid="transparent"
        style={[
          {
            flex: 1,
            fontSize: 17,
            paddingVertical: 8,
          },
          searchTextFont,
          styles.searchTextInput,
        ]}
      />
      {searchAdornment && searchAdornment(searchTerm, _submitSelection)}
    </View>
  ) : null
}
export const Items = ({ flatListProps: flatListPropsFromComponent }) => {
  const {
    items,
    selectedItems,
    noResultsComponent,
    loadingComponent,
    loading,
    noItemsComponent,
    stickyFooterComponent,
    chipsPosition,
    autoFocus,
    disabled,
    itemsFlatListProps,
    _renderItemFlatList,
    flatListProps: flatListPropsFromContext,
    itemId,
    searchTerm,
    _filterItems,
    _renderSeparator,
    _renderFooter,
    styles,
    colors,
  } = useSMSContext()

  const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items
  const flatListProps = {
    ...flatListPropsFromContext,
    ...flatListPropsFromComponent,
  }
  return (
    <View
      keyboardShouldPersistTaps="always"
      style={[{ paddingHorizontal: 12, flex: 1 }, styles.scrollView]}
    >
      <View>
        {loading ? (
          callIfFunction(loadingComponent)
        ) : (
          <View>
            {!renderItems || (!renderItems.length && !searchTerm)
              ? callIfFunction(noItemsComponent)
              : null}
            {items && renderItems && renderItems.length ? (
              <View>
                <FlatList
                  keyboardShouldPersistTaps="always"
                  removeClippedSubviews
                  initialNumToRender={15}
                  data={renderItems}
                  extraData={selectedItems}
                  keyExtractor={item => `${itemId(item)}`}
                  ItemSeparatorComponent={_renderSeparator}
                  ListFooterComponent={_renderFooter}
                  renderItem={_renderItemFlatList}
                  {...flatListProps}
                />
              </View>
            ) : searchTerm ? (
              callIfFunction(noResultsComponent)
            ) : null}
          </View>
        )}
      </View>
    </View>
  )
}
export const Chip = ({ id, styles: stylesFromProps }) => {
  const {
    styles: stylesFromContext,
    colors,
    displayKey,
    Icon,
    chipRemoveIconComponent,
    hideChipRemove,
    hideParentChips,
    iconNames,
    getItemProps,
  } = useSMSContext()
  const itemProps = getItemProps({ id })
  if (!itemProps) return null;
  const { item, itemKey, isParent, onPress } = itemProps

  const hideChip = isParent && hideParentChips
  if (!item || !item[displayKey] || hideChip) return null
  const styles = {
    ...stylesFromContext,
    ...stylesFromProps,
  }
  return (
    <View
      style={[
        {
          overflow: 'hidden',
          justifyContent: 'center',
          height: 30,
          borderColor: colors.chipColor,
          borderWidth: 1,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 10,
          margin: 4,
          paddingTop: 0,
          paddingRight: hideChipRemove ? 10 : 0,
          paddingBottom: 0,
        },
        styles.chipContainer,
        isParent && styles.parentChipContainer,
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          {
            color: colors.chipColor,
            fontSize: 13,
            marginRight: 0,
          },
          styles.chipText,
          isParent && styles.parentChipText,
        ]}
      >
        {item[displayKey]}
      </Text>
      {!hideChipRemove && (
        <TouchableOpacity
          onPress={onPress}
          style={{
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          {callIfFunction(chipRemoveIconComponent) || (
            <Icon
              name={iconNames.close}
              style={[
                {
                  color: colors.chipColor,
                  fontSize: 16,
                  marginHorizontal: 6,
                  marginVertical: 7,
                },
                styles.chipIcon,
              ]}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}
export const SelectModal = ({ children }) => {
  const {
    _closeSelect,
    getModalProps,
    modalAnimationType,
    modalSupportedOrientations,
    modalWithSafeAreaView,
    modalWithTouchable,
    selectIsVisible,
    styles,
  } = useSMSContext()
  console.log('is vis in modal', selectIsVisible)

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
    <Modal {...getModalProps()}>
      <Component
        style={[
          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
          styles.modalWrapper,
        ]}
      >
        <Backdrop
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0,0,0,0.2)',
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
    </Modal>
  )
}

const SMSPropTypes = {
  single: PropTypes.bool,
  selectedItems: PropTypes.array,
  items: PropTypes.array,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  childItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  getChildren: PropTypes.func,
  displayKey: PropTypes.string,
  subKey: PropTypes.string,
  iconNames: PropTypes.object,
  onSelectedItemsChange: PropTypes.func.isRequired,
  showDropDowns: PropTypes.bool,
  showChips: PropTypes.bool,
  readOnlyHeadings: PropTypes.bool,
  selectText: PropTypes.string,
  selectedText: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  renderSelectText: PropTypes.func,
  confirmText: PropTypes.string,
  hideConfirm: PropTypes.bool,
  styles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  colors: PropTypes.shape({
    primary: PropTypes.string,
    success: PropTypes.string,
    cancel: PropTypes.string,
    text: PropTypes.string,
    subText: PropTypes.string,
    selectToggleTextColor: PropTypes.string,
    searchPlaceholderTextColor: PropTypes.string,
    searchSelectionColor: PropTypes.string,
    chipColor: PropTypes.string,
    itemBackground: PropTypes.string,
    subItemBackground: PropTypes.string,
    disabled: PropTypes.string,
  }),
  searchPlaceholderText: PropTypes.string,
  noResultsComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  loadingComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  loading: PropTypes.bool,
  subItemFontFamily: PropTypes.object,
  itemFontFamily: PropTypes.object,
  searchTextFontFamily: PropTypes.object,
  confirmFontFamily: PropTypes.object,
  showRemoveAll: PropTypes.bool,
  removeAllText: PropTypes.string,
  modalSupportedOrientations: PropTypes.arrayOf(PropTypes.string),
  modalAnimationType: PropTypes.string,
  modalWithSafeAreaView: PropTypes.bool,
  modalWithTouchable: PropTypes.bool,
  hideSearch: PropTypes.bool,
  footerComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  stickyFooterComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  selectToggleIconComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  cancelIconComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  searchIconComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  selectedIconComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  unselectedIconComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  dropDownToggleIconUpComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  dropDownToggleIconDownComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  chipRemoveIconComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  parentsSelectAllChildren: PropTypes.bool,
  parentsHighlightAllChildren: PropTypes.bool,
  onSelectedItemObjectsChange: PropTypes.func,
  itemNumberOfLines: PropTypes.number,
  selectLabelNumberOfLines: PropTypes.number,
  showCancelButton: PropTypes.bool,
  hideSelect: PropTypes.bool,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  headerComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  alwaysShowSelectText: PropTypes.bool,
  searchAdornment: PropTypes.func,
  expandDropDowns: PropTypes.bool,
  animateDropDowns: PropTypes.bool,
  customLayoutAnimation: PropTypes.object,
  filterItems: PropTypes.func,
  onToggleSelect: PropTypes.func,
  noItemsComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  customChipsRenderer: PropTypes.func,
  chipsPosition: PropTypes.oneOf(['top', 'bottom']),
  hideChipRemove: PropTypes.bool,
  autoFocus: PropTypes.bool,
  iconKey: PropTypes.string,
  disabled: PropTypes.bool,
  selectedIconPosition: PropTypes.string,
  itemIconPosition: PropTypes.string,
  parentChipsRemoveChildren: PropTypes.bool,
  iconRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  itemsFlatListProps: PropTypes.object,
  subItemsFlatListProps: PropTypes.object,
}

const SMSDefaultProps = {
  single: false,
  selectedItems: [],
  itemId: item => `parent-${item.id}`,
  childItemId: item => `child-${item.id}`,
  getChildren: item => item.children && item.children,
  displayKey: 'name',
  iconNames: {
    close: 'close',
    cancel: 'cancel',
    arrowDown: 'keyboard-arrow-down',
    arrowUp: 'keyboard-arrow-up',
    search: 'search',
  },
  showDropDowns: true,
  showChips: true,
  readOnlyHeadings: false,
  selectText: 'Select',
  selectedText: 'selected',
  confirmText: 'Confirm',
  hideConfirm: false,
  searchPlaceholderText: 'Search categories...',
  noResultsComponent: noResults,
  loadingComponent: loadingComp,
  loading: false,
  styles: {},
  colors: {},
  itemFontFamily: {
    fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir',
    fontWeight: 'bold',
  },
  subItemFontFamily: {
    fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir',
    fontWeight: '200',
  },
  searchTextFontFamily: {
    fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir',
    fontWeight: '200',
  },
  confirmFontFamily: {
    fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir',
    fontWeight: 'bold',
  },
  removeAllText: 'Remove all',
  showRemoveAll: false,
  modalSupportedOrientations: ['portrait', 'landscape'],
  modalAnimationType: 'fade',
  modalWithSafeAreaView: false,
  modalWithTouchable: false,
  hideSearch: false,
  parentsSelectAllChildren: false,
  parentsHighlightAllChildren: false,
  itemNumberOfLines: null,
  selectLabelNumberOfLines: 1,
  showCancelButton: false,
  hideSelect: false,
  alwaysShowSelectText: false,
  expandDropDowns: false,
  animateDropDowns: true,
  filterItems: null,
  noItemsComponent: noItems,
  chipsPosition: 'bottom',
  hideChipRemove: false,
  autoFocus: false,
  disabled: false,
  selectedIconPosition: 'right',
  itemIconPosition: 'left',
  parentChipsRemoveChildren: false,
  itemsFlatListProps: {},
  subItemsFlatListProps: {},
}

SectionedMultiSelect.defaultProps = SMSDefaultProps
SectionedMultiSelect.propTypes = SMSPropTypes
