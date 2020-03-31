import * as React from 'react'
import { View, StyleSheet } from 'react-native';
import { RowItem } from './components';
import { callIfFunction, getProp, rejectProp, removeDuplicates } from './helpers';
import useItemsReducer, { loggerMiddleware, thunkMiddleware } from './useItemsReducer';
import itemsReducer from './itemsReducer';
import { defaultStyles, defaultColors, SMSDefaultProps } from './sectioned-multi-select';

export const useSectionedMultiSelect = props => {
  const Icon = props.iconRenderer;
  const initialState = () => {
    return {
      styles: StyleSheet.flatten([defaultStyles, props.styles]),
      colors: StyleSheet.flatten([defaultColors, props.colors]),
    };
  };
  const [state,] = React.useState(initialState);
  const initialProps = { ...SMSDefaultProps, ...props };
  // const [getProps,] = React.useState(initialProps);
  const getProps = React.useMemo(() => {
    return initialProps;
  });
  // if onSelectedItemsChange function is passed in as a prop, we'll call it
  // via the thunk middleware (see onSelectedItemsChangeInternal)
  const middleware = [...(getProps.debug ? [loggerMiddleware] : []), ...(getProps.onSelectedItemsChange ? [thunkMiddleware] : [])];
  const [selectedItems, dispatch] = useItemsReducer(itemsReducer, props.initialSelectedItems, middleware);
  console.log('SELECTED ITEMS', selectedItems);
  React.useEffect(() => {
    // if single is changed, make sure only 1 item is selected
    if (getProps.single) {
      dispatch({ type: 'replace-items', items: selectedItems[0] ? [selectedItems[0]] : [] });
    }
  }, [getProps.single]);
  // React.useEffect(() => {
  //   // could change items from selectedItems prop like this...
  //   if (getProps.selectedItems) {        
  //       dispatch({type: 'replace-items', items: getProps.selectedItems })
  //   }
  // }, [getProps.selectedItems])
  const onSelectedItemsChangeInternal = (action) => {
    const { onSelectedItemsChange } = getProps;
    console.log('dispatch', dispatch);
    // update items state if uncontrolled
    dispatch(onSelectedItemsChange ? onSelectedItemsChange(action) : action);
    // pass dispatch/params so item updates can be controlled externally
    // onSelectedItemsChange(selectedItems, dispatch, action)
  };
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectIsVisible, setSelectIsVisible] = React.useState(false);
  const [highlightedChildren, setHighlightedChildren] = React.useState([]);
  const _filterItems = searchTerm => {
    const { items, subKey, itemId, childItemId, getChildren, displayKey, filterItems, } = getProps;
    if (filterItems) {
      return filterItems(searchTerm, items, getProps);
    }
    let filteredItems = [];
    let newFilteredItems = [];
    items &&
      items.forEach(item => {
        const parts = searchTerm
          .replace(/[\^$\\.*+?()[\]{}|]/g, '\\$&')
          .trim()
          .split(' ');
        const regex = new RegExp(`(${parts.join('|')})`, 'i');
        if (regex.test(getProp(item, displayKey))) {
          filteredItems.push(item);
        }
        if (getChildren(item)) {
          const newItem = Object.assign({}, item);
          newItem[subKey] = [];
          getChildren(item).forEach(sub => {
            if (regex.test(getProp(sub, displayKey))) {
              newItem[subKey] = [...getChildren(newItem), sub];
              newFilteredItems = rejectProp(filteredItems, singleItem => childItemId(item) !== childItemId(singleItem));
              newFilteredItems.push(newItem);
              filteredItems = newFilteredItems;
            }
          });
        }
      });
    return filteredItems;
  };
  const _checkIsParent = item => {
    const { getChildren, items } = getProps;
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
  };
  const _removeItem = (item, origin) => {
    const { itemId, childItemId, parentsHighlightChildren, onSelectedItemObjectsChange, } = getProps;
    const itemToRemove = React.useCallback(() => _checkIsParent(item), [item])
      ? itemId(item)
      : childItemId(item);
    const newItems = rejectProp(selectedItems, singleItem => itemToRemove !== singleItem);
    const dispatchParams = { type: 'remove', item: itemToRemove, origin, };
    parentsHighlightChildren && _unHighlightChildren(itemToRemove);
    onSelectedItemObjectsChange && _broadcastItemObjects(newItems);
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(dispatchParams);
  };
  const _removeAllItems = (origin) => {
    const dispatchParams = { type: 'remove-all', origin, };
    const { onSelectedItemObjectsChange } = getProps;
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(dispatchParams);
    setHighlightedChildren([]);
    onSelectedItemObjectsChange && _broadcastItemObjects();
  };
  const _selectAllItems = (origin) => {
    const { items, itemId, getChildren, childItemId, onSelectedItemObjectsChange, parentsToggleChildrenOnly, readOnlyHeadings, } = getProps;
    let newItems = [];
    items &&
      items.forEach(item => {
        if (!readOnlyHeadings || !parentsToggleChildrenOnly) {
          newItems.push(itemId(item));
        }
        Array.isArray(getChildren(item)) &&
          getChildren(item).forEach(childItem => {
            newItems.push(childItemId(childItem));
          });
      });
    const dispatchParams = { type: 'replace-items', items: newItems, origin, count: newItems.length };
    onSelectedItemsChangeInternal(dispatchParams);
    onSelectedItemObjectsChange && onSelectedItemObjectsChange(items);
  };
  // maybe put toggle/search state in the reducer too
  const _toggleSelect = () => {
    const { onToggleSelect } = getProps;
    const isVisible = !selectIsVisible;
    setSelectIsVisible(isVisible);
    onToggleSelect && onToggleSelect(isVisible);
  };
  const _closeSelect = () => {
    const { onToggleSelect } = getProps;
    setSelectIsVisible(false);
    setSearchTerm('');
    onToggleSelect && onToggleSelect(false);
  };
  const _submitSelection = () => {
    const { onConfirm } = getProps;
    _toggleSelect();
    // reset searchTerm
    setSearchTerm('');
    onConfirm && onConfirm();
  };
  const _cancelSelection = () => {
    const { onCancel } = getProps;
    _toggleSelect();
    setSearchTerm('');
    onCancel && onCancel();
  };
  const _itemSelected = item => {
    return selectedItems.includes(item);
  };
  const _toggleChildren = (item, includeParent, isSelected) => {
    const { onSelectedItemObjectsChange, itemId } = getProps;
    const parentItem = itemId(item);
    const selected = _itemSelected(parentItem) || isSelected;
    // the children of this item
    const childItems = _getChildIdsArray(parentItem);
    const removedDuplicates = removeDuplicates(childItems, selectedItems);
    let dispatchParams;
    if (selected) {
      const itemsToDispatch = [...childItems, ...(includeParent ? [parentItem] : [])];
      // don't care about duplicates when removing
      dispatchParams = { type: 'remove-items', items: itemsToDispatch, };
    }
    else {
      const itemsToDispatch = [...removedDuplicates, ...(includeParent ? [parentItem] : [])];
      dispatchParams = { type: 'add-items', items: itemsToDispatch, count: itemsToDispatch.length };
    }
    onSelectedItemsChangeInternal(dispatchParams);
    onSelectedItemObjectsChange && _broadcastItemObjects();
  };
  // item: item object
  // origin?: string to notify dispatch what caused the toggle
  const _toggleItem = (item, origin) => {
    const { single, itemId, childItemId, parentsToggleChildren, parentsHighlightChildren, onSelectedItemObjectsChange, singleShouldSubmit } = getProps;
    console.group('_toggleItem');
    const isParent = _checkIsParent(item);
    const itemToToggle = isParent ? itemId(item) : childItemId(item);
    // const itemToToggle = getItemId(item)
    let dispatchParams;
    const selected = _itemSelected(itemToToggle);
    dispatchParams = selected ? { type: 'remove', item: itemToToggle, origin, } : { type: 'add', item: itemToToggle, origin, count: 1, };
    if (single) {
      // toggling the selected single item should remove it?
      // maybe needs to be optional.
      dispatchParams = selected ? { type: 'remove-all', origin, } : { type: 'add-single', item: itemToToggle, origin, count: 1, };
      onSelectedItemsChangeInternal(dispatchParams);
      onSelectedItemObjectsChange && _broadcastItemObjects();
      singleShouldSubmit && _submitSelection();
      console.groupEnd();
      return;
    }
    if (isParent) {
      if (parentsToggleChildren) {
        // toggle children runs a onSelectedItemsChangeInternal & onSelectedItemObjectsChange! 
        // (2nd arg = also toggle parent item)
        _toggleChildren(item, true);
        return;
      }
      else if (parentsHighlightChildren) {
        selected ? _unHighlightChildren(itemToToggle) : _highlightChildren(itemToToggle);
      }
    }
    console.log('toggle end dispatch params', dispatchParams);
    console.groupEnd();
    // broadcast new selected items state to parent component
    onSelectedItemsChangeInternal(dispatchParams);
    onSelectedItemObjectsChange && _broadcastItemObjects();
  };
  const _removeParent = item => {
    const parent = findParent(item);
    console.log('parent to remove', parent);
    parent && _removeItem(parent);
  };
  const _findItem = id => {
    const { items } = getProps;
    return find(id, items);
  };
  function find(id, items, isChild) {
    if (!items) {
      return {};
    }
    const { getChildren, itemId, childItemId } = getProps;
    const getFn = isChild ? childItemId : itemId;
    let i = 0;
    let found;
    for (; i < items.length; i += 1) {
      if (getFn(items[i]) === id) {
        return items[i];
      }
      else if (Array.isArray(getChildren(items[i]))) {
        found = find(id, getChildren(items[i]), true);
        if (found) {
          return found;
        }
      }
    }
  }
  function findParent(item) {
    const { items, itemId, childItemId, getChildren } = getProps;
    if (!items) {
      return {};
    }
    const id = childItemId(item);
    if (!id) {
      return {};
    }
    let i = 0;
    let found;
    for (; i < items.length; i += 1) {
      if (Array.isArray(getChildren(items[i]))) {
        found = find(id, getChildren(items[i]), true);
        if (found) {
          return items[i];
        }
      }
    }
  }
  // removes items that are in array from toSplice 
  // array = children item objects
  // toSplice = current selected item keys
  function reduceSelected(array, toSplice) {
    const { childItemId } = getProps;
    array.reduce((prev, curr) => {
      // if a child item is selected
      toSplice.includes(childItemId(curr)) &&
        toSplice.splice(
          // remove it
          toSplice.findIndex(el => el === childItemId(curr)), 1);
    }, {});
    return toSplice;
  }
  const _highlightChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps;
    const highlighted = [...highlightedChildren];
    if (!items)
      return;
    let i = 0;
    for (; i < items.length; i += 1) {
      if (itemId(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !highlighted.includes(childItemId(sub)) &&
            highlighted.push(childItemId(sub));
        });
      }
    }
    setHighlightedChildren(highlighted);
  };
  const _unHighlightChildren = id => {
    const { items, itemId, getChildren } = getProps;
    const highlighted = [...highlightedChildren];
    const array = items.filter(item => itemId(item) === id);
    if (!array['0']) {
      return;
    }
    if (array['0'] && !getChildren(array['0'])) {
      return;
    }
    const newHighlighted = reduceSelected(getChildren(array['0']), highlighted);
    setHighlightedChildren(newHighlighted);
  };
  const _selectChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps;
    if (!items)
      return;
    let i = 0;
    const selected = [];
    for (; i < items.length; i += 1) {
      if (itemId(items[i]) === id && Array.isArray(getChildren(items[i]))) {
        getChildren(items[i]).forEach(sub => {
          !selectedItems.includes(childItemId(sub)) &&
            selected.push(childItemId(sub));
        });
      }
    }
    // so we have them in state for SubRowItem should update checks
    _highlightChildren(id);
    return selected;
  };
  const _getChildIdsArray = id => {
    const { items, childItemId, getChildren, itemId } = getProps;
    let newItems = [];
    const item = items.filter(item => itemId(item) === id);
    if (!item[0]) {
      return newItems;
    }
    const children = getChildren(item[0]);
    if (!children) {
      return newItems;
    }
    for (let i = 0; i < children.length; i++) {
      newItems.push(childItemId(children[i]));
    }
    return newItems;
  };
  const _rejectChildren = id => {
    const { items, itemId, childItemId, getChildren } = getProps;
    const arrayOfChildren = items.filter(item => itemId(item) === id);
    const selected = [...selectedItems];
    if (!arrayOfChildren['0']) {
      return;
    }
    if (arrayOfChildren['0'] && !getChildren(arrayOfChildren['0'])) {
      return;
    }
    const newSelected = reduceSelected(getChildren(arrayOfChildren['0']), selected);
    // update state for SubRowItem component should update checks
    _unHighlightChildren(id);
    return newSelected;
  };
  const _getSearchTerm = () => searchTerm;
  // get the items back as their full objects instead of an array of ids.
  const _broadcastItemObjects = () => {
    // const { onSelectedItemObjectsChange } = getProps
    // const fullItems = []
    // selectedItems.forEach(singleSelectedItem => {
    //   const item = _findItem(singleSelectedItem)
    //   fullItems.push(item)
    // })
    // onSelectedItemObjectsChange(fullItems)
  };
  const _customChipsRenderer = () => {
    const { styles, colors } = state;
    const { displayKey, items, customChipsRenderer } = getProps;
    return (customChipsRenderer &&
      customChipsRenderer({
        colors,
        displayKey,
        items,
        selectedItems,
        styles,
      }));
  };
  const _renderSeparator = () => {
    const { styles } = state;
    return (<View style={[
      {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: '#dadada',
      },
      styles.separator,
    ]} />);
  };
  const _renderFooter = () => {
    const { footerComponent } = getProps;
    return <View>{callIfFunction(footerComponent)}</View>;
  };

  const getItemId = item => {
    const { itemId, childItemId } = getProps;
    return _checkIsParent(item) ? itemId(item) : childItemId(item);
  };
  const getModalProps = () => {
    const { modalSupportedOrientations, modalAnimationType } = getProps;
    return {
      supportedOrientations: modalSupportedOrientations,
      animationType: modalAnimationType,
      transparent: true,
      visible: selectIsVisible,
      onRequestClose: _closeSelect,
    };
  };
  const getStateAndHelpers = () => {
    const { styles, colors } = state;
    const { items } = getProps;
    const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items;
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
      // getItemProps,
      setSearchTerm,
      // components
      // _renderItemFlatList,
      _renderSeparator,
      _renderFooter,
      // Chips,
      // ModalControls,
      // ModalHeader,
      // ModalFooter,
      // Selector,
      _customChipsRenderer,
      // Search,
      // SelectModal,
      // Items,
      // Chip,
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
    };
  };
  return getStateAndHelpers();
};
