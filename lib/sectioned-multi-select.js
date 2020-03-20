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

// let date = new Date()

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

export const useSectionedMultiSelect = props => {
  const Icon = props.iconRenderer // require('react-native-vector-icons/MaterialIcons').default

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

  const [selectedItemsInternal, setSelectedItemsInternal] = React.useState(
    getProps().selectedItems
  )

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
    const { getChildren, getItem, getChildItem } = getProps()
    const getFn = isChild ? getChildItem : getItem
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

  const findParent = item =>
    React.useMemo(() => {
      const { items, getItem, getChildItem, getChildren } = getProps()
      if (!items) {
        return {}
      }
      const id = getChildItem(item)
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
    }, [item])

  const reduceSelected = (array, toSplice) => {
    const { getChildItem } = getProps()
    array.reduce((prev, curr) => {
      toSplice.includes(getChildItem(curr)) &&
        toSplice.splice(
          toSplice.findIndex(el => el === getChildItem(curr)),
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
      getItem,
      getChildItem,
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
                singleItem => getChildItem(item) !== getChildItem(singleItem)
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
    const { onSelectedItemsChange } = getProps()
    setSelectedItemsInternal(items)
    onSelectedItemsChange(items)
  }
  const _checkIsParent = item => {
    const { getChildren } = getProps()
    return Boolean(getChildren(item) && getChildren(item).length)
  }

  const _removeItem = item => {
    const {
      getItem,
      getChildItem,
      selectedItems,
      onSelectedItemsChange,
      parentsHighlightAllChildren,
      onSelectedItemObjectsChange,
    } = getProps()

    const itemToRemove = _checkIsParent(item)
      ? getItem(item)
      : getChildItem(item)
    const newItems = rejectProp(
      selectedItemsInternal,
      singleItem => itemToRemove !== singleItem
    )

    parentsHighlightAllChildren && _unHighlightChildren(itemToRemove)
    onSelectedItemObjectsChange && _broadcastItemObjects(newItems)

    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(newItems)
  }

  const _removeAllItems = () => {
    const { onSelectedItemObjectsChange } = getProps()
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal([])
    setHighlightedChildren([])
    _forceUpdate()
    onSelectedItemObjectsChange && _broadcastItemObjects([])
  }

  const _selectAllItems = () => {
    const {
      items,
      getItem,
      getChildren,
      getChildItem,
      onSelectedItemObjectsChange,
      readOnlyHeadings,
    } = getProps()

    let newItems = []
    items &&
      items.forEach(item => {
        if (!readOnlyHeadings) {
          newItems = [...newItems, getItem(item)]
        }
        Array.isArray(getChildren(item)) &&
          getChildren(item).forEach(sub => {
            newItems = [...newItems, getChildItem(sub)]
          })
      })
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
    const { onSelectedItemObjectsChange, getItem } = getProps()
    const parentItem = getItem(item)
    const selected = _itemSelected(parentItem)
    let newItems = []
    if (selected) {
      newItems = [..._rejectChildren(parentItem)]
      newItems = rejectProp(newItems, singleItem => parentItem !== singleItem)
    } else {
      newItems = [...newItems, ..._selectChildren(parentItem)]
    }

    onSelectedItemsChangeInternal(newItems)
    onSelectedItemObjectsChange && _broadcastItemObjects(newItems)
  }

  const _toggleItem = item => {
    const {
      single,
      getItem,
      getChildItem,
      parentsSelectAllChildren,
      parentsHighlightAllChildren,
      onSelectedItemObjectsChange,
    } = getProps()
    const isParent = _checkIsParent(item)
    const itemToToggle = getItemKey(item)
    console.log('toggling', itemToToggle, 'isparent', isParent)

    if (single) {
      _submitSelection()
      onSelectedItemsChangeInternal([itemToToggle])
      onSelectedItemObjectsChange && _broadcastItemObjects([itemToToggle])
    } else {
      const selected = _itemSelected(itemToToggle)
      let newItems = []
      if (selected) {
        if (isParent) {
          if (parentsSelectAllChildren) {
            newItems = [..._rejectChildren(itemToToggle)]

            newItems = rejectProp(
              newItems,
              singleItem => itemToToggle !== singleItem
            )
          } else if (parentsHighlightAllChildren) {
            _unHighlightChildren(itemToToggle)
            newItems = rejectProp(
              selectedItemsInternal,
              singleItem => itemToToggle !== singleItem
            )
          } else {
            newItems = rejectProp(
              selectedItemsInternal,
              singleItem => itemToToggle !== singleItem
            )
          }
        } else {
          newItems = rejectProp(
            selectedItemsInternal,
            singleItem => itemToToggle !== singleItem
          )
          // make parent items deselect when a sub item is deselected
          // const parent = findParent(item)
          // if (parent && true) { newItems = rejectProp(newItems, singleItem => getItem(parent) !== singleItem) }
        }
      } else {
        newItems = [...selectedItemsInternal, itemToToggle]
        if (isParent) {
          if (parentsSelectAllChildren) {
            newItems = [...newItems, ..._selectChildren(itemToToggle)]
          } else if (parentsHighlightAllChildren) {
            _highlightChildren(itemToToggle)
          }
        }
      }
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
  const _findItem = id => {
    const { items } = getProps()
    return find(id, items)
  }

  const _highlightChildren = id => {
    const { items, getItem, getChildItem, getChildren } = getProps()
    const highlighted = [...highlightedChildren]
    if (!items) return
    let i = 0
    for (; i < items.length; i += 1) {
      if (getItem(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !highlighted.includes(getChildItem(sub)) &&
            highlighted.push(getChildItem(sub))
        })
      }
    }
    console.log('highlighted', highlighted)

    setHighlightedChildren(highlighted)
  }

  const _unHighlightChildren = id => {
    const { items, getItem, getChildren } = getProps()
    const highlighted = [...highlightedChildren]

    const array = items.filter(item => getItem(item) === id)

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
    const { items, getItem, getChildItem, getChildren } = getProps()
    if (!items) return
    let i = 0
    const selected = []
    for (; i < items.length; i += 1) {
      if (getItem(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !selectedItemsInternal.includes(getChildItem(sub)) &&
            selected.push(getChildItem(sub))
        })
      }
    }

    // so we have them in state for SubRowItem should update checks
    _highlightChildren(id)
    return selected
  }

  const _rejectChildren = id => {
    const { items, getItem, getChildItem, getChildren } = getProps()
    const arrayOfChildren = items.filter(item => getItem(item) === id)
    const selected = [...selectedItemsInternal]
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
    return selectedItemsInternal.map(id => {
      const itemProps = getItemProps({ id })
      console.log('itemProps b4 <Chip/>', itemProps)

      return itemProps ? <Chip key={id} id={id} /> : null
    })
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

    return (
      <View>
        <RowItem
          iconRenderer={Icon}
          item={item}
          mergedStyles={styles}
          mergedColors={colors}
          _itemSelected={_itemSelected}
          searchTerm={searchTerm}
          _toggleItem={_toggleItem}
          highlightedChildren={highlightedChildren}
          forceUpdate={forceUpdate}
          {...getProps()}
          selectedItems={selectedItemsInternal}
        />
      </View>
    )
  }

  const getItemKey = item => {
    const { getItem, getChildItem } = getProps()
    return _checkIsParent(item) ? getItem(item) : getChildItem(item)
  }

  const getItemProps = ({ id }) => {
    const { parentChipsRemoveChildren } = getProps()
    // get the item object
    const item = _findItem(id)
    if (!item) {
      return null
    }

    const itemKey = getItemKey(item)
    // check if item has children
    const isParent = _checkIsParent(item)
    // get the parent id if it's a child item
    const parentItem = isParent ? undefined : findParent(item)
    const onPress = () =>
      isParent && parentChipsRemoveChildren
        ? _toggleChildren(item)
        : _toggleItem(item)
    return {
      id,
      item,
      itemKey,
      isParent,
      parentItem,
      onPress,
    }
  }

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
  } = React.useContext(SMSContext)
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
    getItem,
    searchTerm,
    _filterItems,
    _renderSeparator,
    _renderFooter,
    styles,
    colors,
  } = React.useContext(SMSContext)

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
                  keyExtractor={item => `${getItem(item)}`}
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
  } = React.useContext(SMSContext)
  const itemProps = getItemProps({ id })
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
  } = React.useContext(SMSContext)
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
  getItems: PropTypes.func,
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
  selectedIconOnLeft: PropTypes.bool,
  parentChipsRemoveChildren: PropTypes.bool,
  iconRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  itemsFlatListProps: PropTypes.object,
  subItemsFlatListProps: PropTypes.object,
}

const SMSDefaultProps = {
  single: false,
  selectedItems: [],
  getItem: item => `parent-${item.id}`,
  getChildItem: item => `child-${item.id}`,
  getChildren: item => item.children && item.children,
  displayKey: 'name',
  iconNames: {
    close: 'close',
    cancel: 'cancel',
    arrowDown: 'keyboard-arrow-down',
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
  selectedIconOnLeft: false,
  parentChipsRemoveChildren: false,
  itemsFlatListProps: {},
  subItemsFlatListProps: {},
}

SectionedMultiSelect.defaultProps = SMSDefaultProps
SectionedMultiSelect.propTypes = SMSPropTypes
