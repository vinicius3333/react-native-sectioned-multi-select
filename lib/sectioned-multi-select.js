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
import { isEqual } from 'lodash'
// import Icon from 'react-native-vector-icons/MaterialIcons'
import { RowItem, } from './components'
import { SelectModal, ModalHeader, ModalFooter, ModalControls } from './components/SelectModal'
import { callIfFunction, getProp, rejectProp, removeDuplicates } from './helpers'
import { useItemsReducer, loggerMiddleware, thunkMiddleware } from './reducer'


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
  subItem: {
    // height: 35,
  },
  itemText: {
    fontSize: 17,
  },
  itemIcon: {},
  itemIconSelected: {},
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
  ...SMSDefaultProps,
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
          <SelectModal>
            <ModalHeader />
            <Search />
            <Items />
            <ModalControls />
            <ModalFooter />
          </SelectModal>
          {chipsPosition === 'top' && <Chips />}
          {chipsPosition === 'top' && _customChipsRenderer()}
          <Selector />
          {chipsPosition === 'bottom' && <Chips />}
          {chipsPosition === 'bottom' && SMSState._customChipsRenderer()}
        </ScrollView>
      </SMSContext.Provider>
    )
}

export default SectionedMultiSelect

function isControlledProp(props, key) {
  console.log(props, key);
  
  return props[key] !== undefined
}

// let date = new Date()

const itemsReducer = (state, action) => {
  console.log('reducer prev state', state);
  
  switch (action.type) {
    case 'add':
      return [...state, action.item];
    case 'add-single':
      return [action.item];
    case 'remove':
      return [...state.filter(item => item !== action.item)];
    case 'replace-items':
      return [...action.items]
    case 'add-items':
      return [...state, ...action.items]
    case 'remove-items':
      return [...state.filter(item => !action.items.includes(item))];
    case 'remove-all':
      return [];
    default:
      return state;
  }
}

export const useSectionedMultiSelect = props => {
  const Icon = props.iconRenderer


  const initialState = () => {
    return {
      styles: StyleSheet.flatten([defaultStyles, props.styles]),
      colors: StyleSheet.flatten([defaultColors, props.colors]),
    }
  }
  const [state,] = React.useState(initialState);

  const initialProps = { ...SMSDefaultProps, ...props }
  // const [getProps,] = React.useState(initialProps);

  const getProps = React.useMemo(() => {
    return initialProps
  })

  // @todo selectedItems is just a boolean for whether the dispatch
  // is handled by the user on onSelectedItemsChange now.
  // we could probably just skip all this
  // and have a thunk/callback function prop that is passed to
  // dispatch in onSelectedItemsChangeInternal
  // e.g dispatch( callback ? callback(dispatchParams) : dispatchParams)

  // if selectedItems is passed in as a prop, we'll defer
  // internal state updates, passing dispatch function, item(s) & type to onSelectedItemsChange
  // const itemsControlled = isControlledProp(getProps, 'selectedItems')
  // console.log('ITEMS CONTROLLED', itemsControlled);

  const middleware = [...(getProps.debug ? [loggerMiddleware] : []), ...(getProps.onSelectedItemsChange ? [thunkMiddleware] : [])]
  const [selectedItems, dispatch] = useItemsReducer(itemsReducer, props.initialSelectedItems, middleware)

  console.log('SELECTED ITEMS', selectedItems); 
  
  React.useEffect(() => {
    // if single is changed, make sure only 1 item is selected
    if (getProps.single) {        
        dispatch({type: 'replace-items', items: selectedItems[0] ? [selectedItems[0]] : [] })
    }
  }, [getProps.single])



  // React.useEffect(() => {
  //   // could change items from selectedItems prop like this...
  //   if (getProps.selectedItems) {        
  //       dispatch({type: 'replace-items', items: getProps.selectedItems })
  //   }
  // }, [getProps.selectedItems])

  const onSelectedItemsChangeInternal = (action) => {
    const { onSelectedItemsChange } = getProps
    console.log('dispatch', dispatch
    );
    
    // update items state if uncontrolled
    dispatch(onSelectedItemsChange ? onSelectedItemsChange(action) : action)
    // pass dispatch/params so item updates can be controlled externally
    // onSelectedItemsChange(selectedItems, dispatch, action)
  };
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectIsVisible, setSelectIsVisible] = React.useState(false)
  const [highlightedChildren, setHighlightedChildren] = React.useState([])

  const _filterItems = searchTerm => {
    const {
      items,
      subKey,
      itemId,
      childItemId,
      getChildren,
      displayKey,
      filterItems,
    } = getProps

    if (filterItems) {
      return filterItems(searchTerm, items, getProps)
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

  const _checkIsParent = item => {
    const { getChildren, items } = getProps

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

  const _removeItem = (item, origin) => {
    const {
      itemId,
      childItemId,
      parentsHighlightChildren,
      onSelectedItemObjectsChange,
    } = getProps

    const itemToRemove = React.useCallback(() => _checkIsParent(item), [item])
      ? itemId(item)
      : childItemId(item)
    const newItems = rejectProp(
      selectedItems,
      singleItem => itemToRemove !== singleItem
    )

    const dispatchParams = { type: 'remove', item: itemToRemove, origin,  };

    parentsHighlightChildren && _unHighlightChildren(itemToRemove)
    onSelectedItemObjectsChange && _broadcastItemObjects(newItems)


    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(dispatchParams)
  }

  const _removeAllItems = (origin) => {
    const dispatchParams = { type: 'remove-all', origin, };
    const { onSelectedItemObjectsChange } = getProps
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(dispatchParams)
    setHighlightedChildren([])
    onSelectedItemObjectsChange && _broadcastItemObjects()
  }

  const _selectAllItems = (origin) => {
    const {
      items,
      itemId,
      getChildren,
      childItemId,
      onSelectedItemObjectsChange,
      readOnlyHeadings,
    } = getProps

    let newItems = []
    items &&
      items.forEach(item => {
        if (!readOnlyHeadings) {
          newItems.push(itemId(item))
        }
        Array.isArray(getChildren(item)) &&
          getChildren(item).forEach(sub => {
            newItems.push(childItemId(sub))
          })
      })
    const dispatchParams = { type: 'replace-items', items: newItems, origin, count: newItems.length }
    onSelectedItemsChangeInternal(dispatchParams)
    onSelectedItemObjectsChange && onSelectedItemObjectsChange(items)
  }

  const _toggleSelect = () => {
    const { onToggleSelect } = getProps
    const isVisible = !selectIsVisible
    setSelectIsVisible(isVisible)
    onToggleSelect && onToggleSelect(isVisible)
  }

  const _closeSelect = () => {
    const { onToggleSelect } = getProps
    setSelectIsVisible(false)
    setSearchTerm('')
    onToggleSelect && onToggleSelect(false)
  }
  const _submitSelection = () => {
    const { onConfirm } = getProps
    _toggleSelect()
    // reset searchTerm
    setSearchTerm('')
    onConfirm && onConfirm()
  }

  const _cancelSelection = () => {
    const { onCancel } = getProps
    _toggleSelect()
    setSearchTerm('')
    onCancel && onCancel()
  }

  const _itemSelected = item => {
    return selectedItems.includes(item)
  }

  const _toggleChildren = (item, includeParent, isSelected) => {

    const { onSelectedItemObjectsChange, itemId } = getProps
    const parentItem = itemId(item)
    const selected = _itemSelected(parentItem) || isSelected
    // the children of this item
    const childItems = _getChildIdsArray(parentItem)
    const removedDuplicates = removeDuplicates(childItems, selectedItems)
    let dispatchParams;
    if (selected) {
      const itemsToDispatch = [...childItems, ...(includeParent ? [parentItem] : [])];
      // don't care about duplicates when removing
      dispatchParams = { type: 'remove-items', items: itemsToDispatch,};

    } else {
      const itemsToDispatch = [...removedDuplicates, ...(includeParent ? [parentItem] : [])];
      dispatchParams = { type: 'add-items', items: itemsToDispatch, count: itemsToDispatch.length }
    }
    onSelectedItemsChangeInternal(dispatchParams)
    onSelectedItemObjectsChange && _broadcastItemObjects()
  }

  // item: item object
  // origin?: string to notify dispatch what caused the toggle
  const _toggleItem = (item, origin) => {
    const {
      single,
      itemId,
      childItemId,
      parentsToggleChildren,
      parentsHighlightChildren,
      onSelectedItemObjectsChange,
      singleShouldSubmit
    } = getProps
    console.group('_toggleItem')
    const isParent = _checkIsParent(item)
    const itemToToggle = isParent ? itemId(item) : childItemId(item)
    // const itemToToggle = getItemId(item)
    let dispatchParams;
    
    const selected = _itemSelected(itemToToggle)

    dispatchParams = selected ? { type: 'remove', item: itemToToggle, origin, } : { type: 'add', item: itemToToggle, origin, count: 1, }
    if (single) {
      // toggling the selected single item should remove it?
      // maybe needs to be optional.
      dispatchParams = selected ? { type: 'remove-all', origin,  } : { type: 'add-single', item: itemToToggle, origin, count: 1, };
      onSelectedItemsChangeInternal(dispatchParams)
      onSelectedItemObjectsChange && _broadcastItemObjects()
      singleShouldSubmit && _submitSelection()
      console.groupEnd()

      return;
    }

    if (isParent) {
      if (parentsToggleChildren) {
        // toggle children runs a onSelectedItemsChangeInternal & onSelectedItemObjectsChange! 
        // (2nd arg = also toggle parent item)
        _toggleChildren(item, true)
        return;
      } else if (parentsHighlightChildren) {
        selected ? _unHighlightChildren(itemToToggle) : _highlightChildren(itemToToggle)
      }
    }
    console.log('toggle end dispatch params', dispatchParams);
    console.groupEnd()
    
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(dispatchParams)
    onSelectedItemObjectsChange && _broadcastItemObjects()
  }

  const _removeParent = item => {
    const parent = findParent(item)
    console.log('parent to remove', parent)

    parent && _removeItem(parent)
  }

  const _findItem = id => {
    
    const { items } = getProps
    return find(id, items)
  }

  function find(id, items, isChild) {
    if (!items) {
      return {}
    }
    const { getChildren, itemId, childItemId } = getProps
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

  function findParent(item) {
    const { items, itemId, childItemId, getChildren } = getProps
    if (!items) {
      return {}
    }
    const id = childItemId(item)
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
  // array = children item objects
  // toSplice = current selected item keys
  function reduceSelected(array, toSplice) {
    const { childItemId } = getProps
    
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

  const _highlightChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps
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

    setHighlightedChildren(highlighted)
  }

  const _unHighlightChildren = id => {
    const { items, itemId, getChildren } = getProps
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
    const { items, itemId, childItemId, getChildren } = getProps
    if (!items) return
    let i = 0
    const selected = []
    for (; i < items.length; i += 1) {
      if (itemId(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !selectedItems.includes(childItemId(sub)) &&
            selected.push(childItemId(sub))
        })
      }
    }

    // so we have them in state for SubRowItem should update checks
    _highlightChildren(id)

    return selected
  }

  const _getChildIdsArray = id => {
    const { items, childItemId, getChildren, itemId } = getProps;
    let newItems = []
    const item = items.filter(item => itemId(item) === id)
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
    const { items, itemId, childItemId, getChildren } = getProps
    const arrayOfChildren = items.filter(item => itemId(item) === id)
    const selected = [...selectedItems]

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

    // update state for SubRowItem component should update checks
    _unHighlightChildren(id)
    return newSelected
  }

  const _getSearchTerm = () => searchTerm

  // get the items back as their full objects instead of an array of ids.
  const _broadcastItemObjects = () => {
    // const { onSelectedItemObjectsChange } = getProps

    // const fullItems = []
    // selectedItems.forEach(singleSelectedItem => {
    //   const item = _findItem(singleSelectedItem)
    //   fullItems.push(item)
    // })
    // onSelectedItemObjectsChange(fullItems)
  }

  const _customChipsRenderer = () => {
    const { styles, colors } = state
    const { displayKey, items, customChipsRenderer } = getProps

    return (
      customChipsRenderer &&
      customChipsRenderer({
        colors,
        displayKey,
        items,
        selectedItems,
        styles,
      })
    )
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
    const { footerComponent } = getProps
    return <View>{callIfFunction(footerComponent)}</View>
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
          _toggleChildren={_toggleChildren}
          highlightedChildren={highlightedChildren}
          {...getProps}
          styles={styles}
          colors={colors}
          selectedItems={selectedItems}
        />
      </View>
    )
  }

  const getItemId = item => {
    const { itemId, childItemId } = getProps
    return _checkIsParent(item) ? itemId(item) : childItemId(item)
  }


  const getModalProps = () => {
    const { modalSupportedOrientations, modalAnimationType } = getProps
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
    const { items } = getProps


    const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items

    return {
      // helper functions
      _toggleSelect,
      _toggleChildren,
      _closeSelect,
      _submitSelection,
      _cancelSelection,
      _getSearchTerm,
      _itemSelected,
      _removeAllItems,
      _removeItem,
      _toggleItem,
      _selectAllItems,
      _findItem,
      _filterItems,
      _checkIsParent,
      getModalProps,
      getItemProps,
      setSearchTerm,

      // components
      _renderItemFlatList,
      _renderSeparator,
      _renderFooter,
      Chips,
      ModalControls,
      ModalHeader,
      ModalFooter,
      Selector,
      _customChipsRenderer,
      Search,
      SelectModal,
      Items,
      Chip,
      Icon,

      // props
      ...getProps,
      selectedItems,

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


const _getSelectLabel = () => {

  const {
    colors,
    styles,
    selectText,
    selectedText,
    single,
    selectedItems,
    displayKey,
    alwaysShowSelectText,
    renderSelectText,
    selectLabelNumberOfLines,
    _findItem
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
          color: colors.selectToggleTextColor,
        },
        styles.selectToggleText,
      ]}
    >
      {label}
    </Text>
  )
}

const Selector = () => {
  const {
    hideSelect,
    styles,
    colors,
    disabled,
    Icon,
    _toggleSelect,
    selectToggleIconComponent,
    iconNames,
  } = useSMSContext()
  return !hideSelect ? (
    <TouchableWithoutFeedback
      onPress={_toggleSelect}
      disabled={disabled}>
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

const getItemProps = ({ id }) => {
  const {
    itemId,
    childItemId,
    _checkIsParent,
    _toggleItem,
    _findItem,
    _toggleChildren
  } = useSMSContext()
  // get the item object
  const item = React.useMemo(() => _findItem(id), [id])
  if (!item) {
    return null
  }
  // check if item has children

  const isParent = React.useMemo(() => _checkIsParent(item), [id])

  const itemKey = isParent ? itemId(item) : childItemId(item)

  // get the parent id if it's a child item
  // const parentItem = isParent ? undefined : findParent(item)
  const onPress = () => _toggleItem(item)
  return {
    id,
    item,
    itemKey,
    isParent,
    onPress,
  }
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
    _renderItemFlatList,
    itemsFlatListProps: flatListPropsFromContext,
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


export const Chips = ({ children }) => {
  // const { styles, colors } = state
  const {
    styles,
    colors,
    single,
    _removeAllItems,
    customChipsRenderer,
    selectedItems,
    showRemoveAll,
    removeAllText,
    showChips,
  } = useSMSContext()

  const removeAll = () =>
    selectedItems.length > 1 && showRemoveAll ? (
      <View
        style={[
          {
            overflow: 'hidden',
            justifyContent: 'center',
            borderColor: colors.chipColor,
            flexDirection: 'row',
            alignItems: 'center',
            height: 28,
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 10,
            margin: 4,
          },
          styles.chipContainer,
          styles.removeAllChipContainer,
        ]}
      >
        <TouchableOpacity
          onPress={() => _removeAllItems('chips-remove-all')}
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
              styles.removeAllChipText,
            ]}
          >
            {removeAllText}
          </Text>
        </TouchableOpacity>
      </View>
    ) : null

  return children ? (
    children
  ) : selectedItems.length > 0 &&
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
          {selectedItems && selectedItems.length > 0 && selectedItems.map(id => {
            return <Chip key={id} id={id} selectedItems={selectedItems} />
          })}
        </View>
      ) : null
}

export const ChipWrapper = (Comp) => (props) => {
  const {
    items,
    styles: stylesFromContext,
    colors,
    displayKey,
    Icon,
    chipRemoveIconComponent,
    hideChipRemove,
    hideParentChips,
    iconNames,
    selectedItems,
    getItemProps,
    _toggleChildren,
    _toggleItem,
    getChildren, itemId, childItemId,
    _checkIsParent,
  } = useSMSContext()
  const { styles: stylesFromProps, id } = props
  const styles = {
    ...stylesFromContext,
    ...stylesFromProps,
  }
  // this is repeated from above because
  // the props (in find) weren't defined on first render
  const _findItem = id => {
    return find(id, items)
  }
  const find = (id, items, isChild) => {
    if (!items) {
      return {}
    }
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

  const item = React.useMemo(() => _findItem(id), [id, items])
  
  if (!item) {
    return null
  }
  // check if item has children

  const isParent = React.useMemo(() => _checkIsParent(item), [id])


  // get the parent id if it's a child item
  // const parentItem = isParent ? undefined : findParent(item)
  const onPress = () => _toggleItem(item, 'chip')


  const hideChip = isParent && hideParentChips
  if (!item || !item[displayKey] || hideChip) return null
  return (
    <Comp
      onPress={onPress}
      styles={styles}
      colors={colors}
      displayKey={displayKey}
      Icon={Icon}
      isParent={isParent}
      chipRemoveIconComponent={chipRemoveIconComponent}
      hideChipRemove={hideChipRemove}
      hideParentChips={hideParentChips}
      iconNames={iconNames}
      getItemProps={getItemProps}
      item={item}
      selectedItems={selectedItems}
    />
  )

}


export const Chip = ChipWrapper(React.memo((props) => {
  const {
    styles,
    colors,
    displayKey,
    item,
    onPress,
    Icon,
    chipRemoveIconComponent,
    hideChipRemove,
    iconNames,
    isParent,
  } = props
  console.log('chip render', item);

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          height: 28,
          borderWidth: 1,
          borderRadius: 20,
          paddingLeft: 10,
          margin: 4,
          borderColor: colors.chipColor,
          paddingRight: hideChipRemove ? 10 : 0,
        },
        styles.chipContainer,
        isParent && styles.parentChipContainer,
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          {
            textAlignVertical: 'center',
            color: colors.chipColor,
            lineHeight: 13,
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
}, (prevProps, nextProps) => {
  // return false;
  if (!isEqual(prevProps.styles, nextProps.styles)) {
    // console.log('should Re-render ', 'styles not equal', prevProps.selectedItems);
    return false
  }
  if (
    prevProps.selectedItems.includes(
      prevProps.id
    ) &&
    nextProps.selectedItems.includes(prevProps.id)
  ) {
    // console.log('Chip shouldNotRerender ', 'item selected', prevProps.item);

    return true
  }
  if (
    !prevProps.selectedItems.includes(
      prevProps.id
    ) &&
    !nextProps.selectedItems.includes(prevProps.id)
  ) {
    // console.log('Chip shouldNotRerender ', 'item not selected', prevProps.item);

    return true
  }
  return false
}))

Chip.propTypes = {
  styles: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}
// export class Chip extends React.Component {
//   shouldComponentUpdate(nextProps) {
//     // console.log('items should', this.props.items, nextProps.items);

//     if (nextProps.items !== this.props.items) {
//       if (
//         this.props.items.includes(this.props.id) &&
//         !nextProps.items.includes(this.props.id)
//       ) {
//         return true
//       }
//       if (
//         !this.props.items.includes(this.props.id) &&
//         nextProps.items.includes(this.props.id)
//       ) {
//         return true
//       }
//     }
//     if (this.props.styles !== nextProps.styles) {
//       return true
//     }
//     return false;
//   }
//   render () {
//   const {
//     styles: stylesFromContext,
//     colors,
//     displayKey,
//     Icon,
//     chipRemoveIconComponent,
//     hideChipRemove,
//     hideParentChips,
//     iconNames,
//     _findItem,
//     _toggleItem,
//     _checkIsParent,
//   } = this.props
//   const { styles: stylesFromProps, id, } = this.props;
//   // const itemProps = getItemProps({id})
//   const item = _findItem(id)

//   console.log('chip render', this.props);
//   const isParent = _checkIsParent(id)
//   // const { item, itemKey, isParent, onPress } = itemProps

//   const hideChip = isParent && hideParentChips
//   if (!item || !item[displayKey] || hideChip) return null
//   const styles = {
//     ...stylesFromContext,
//     ...stylesFromProps,
//   }
//   return (
//     <View
//       style={[
//         {
//           overflow: 'hidden',
//           justifyContent: 'center',
//           height: 30,
//           borderColor: colors.chipColor,
//           borderWidth: 1,
//           borderRadius: 20,
//           flexDirection: 'row',
//           alignItems: 'center',
//           paddingLeft: 10,
//           margin: 4,
//           paddingTop: 0,
//           paddingRight: hideChipRemove ? 10 : 0,
//           paddingBottom: 0,
//         },
//         styles.chipContainer,
//         isParent && styles.parentChipContainer,
//       ]}
//     >
//       <Text
//         numberOfLines={2}
//         style={[
//           {
//             color: colors.chipColor,
//             fontSize: 13,
//             marginRight: 0,
//           },
//           styles.chipText,
//           isParent && styles.parentChipText,
//         ]}
//       >
//         {item[displayKey]}
//       </Text>
//       {!hideChipRemove && (
//         <TouchableOpacity
//           onPress={() => _toggleItem(item)}
//           style={{
//             borderTopRightRadius: 20,
//             borderBottomRightRadius: 20,
//           }}
//         >
//           {callIfFunction(chipRemoveIconComponent) || (
//             <Icon
//               name={iconNames.close}
//               style={[
//                 {
//                   color: colors.chipColor,
//                   fontSize: 16,
//                   marginHorizontal: 6,
//                   marginVertical: 7,
//                 },
//                 styles.chipIcon,
//               ]}
//             />
//           )}
//         </TouchableOpacity>
//       )}
//     </View>
//   )
// }
// }



const SMSPropTypes = {
  single: PropTypes.bool,
  singleShouldSubmit: PropTypes.bool,
  initialSelectedItems: PropTypes.array,
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
  parentsToggleChildren: PropTypes.bool,
  parentsToggleChildrenOnly: PropTypes.bool,
  parentsHighlightChildren: PropTypes.bool,
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
  iconRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  itemsFlatListProps: PropTypes.object,
  subItemsFlatListProps: PropTypes.object,
}

const SMSDefaultProps = {
  single: false,
  singleShouldSubmit: true,
  initialSelectedItems: [],
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
  parentsToggleChildren: false,
  parentsToggleChildrenOnly: false,
  parentsHighlightChildren: false,
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
  itemsFlatListProps: {},
  subItemsFlatListProps: {},
}

SectionedMultiSelect.defaultProps = SMSDefaultProps
SectionedMultiSelect.propTypes = SMSPropTypes
