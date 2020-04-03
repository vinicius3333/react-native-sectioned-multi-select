import * as React from 'react'
import { StyleSheet, View, FlatList, Platform } from 'react-native'
import useSMSContext from '../context/useSMSContext'
// const getItemProps = ({ id }) => {
//   const {
//     itemId,
//     childItemId,
//     _checkIsParent,
//     _toggleItem,
//     _findItem,
//     _toggleChildren
//   } = useSMSContext()
//   // get the item object
//   const item = React.useMemo(() => _findItem(id), [id])
//   if (!item) {
//     return null
//   }
//   // check if item has children
//   const isParent = React.useMemo(() => _checkIsParent(item), [id])
//   const itemKey = isParent ? itemId(item) : childItemId(item)
//   // get the parent id if it's a child item
//   // const parentItem = isParent ? undefined : findParent(item)
//   const onPress = () => _toggleItem(item)
//   return {
//     id,
//     item,
//     itemKey,
//     isParent,
//     onPress,
//   }
// }

export const ItemSeparator = ({ children, style, ...rest }) => {
  const {
    styles: { separator },
  } = useSMSContext()
  return React.useMemo(() => {
    console.log('ItemSep render')

    return (
      <View
        style={[
          {
            // flex: 1,
            // alignSelf: 'stretch',
            height: StyleSheet.hairlineWidth,
            backgroundColor: '#dadada',
          },
          separator,
          style,
        ]}
        {...rest}
      >
        {children && children}
      </View>
    )
  }, [children, style, separator])
}

export const SubItemSeparator = ({ children, style, ...rest }) => {
  const {
    styles: { subSeparator },
  } = useSMSContext()

  return React.useMemo(() => {
    console.log('subItem sep render')
    return (
      <View
        style={[
              {
                // flex: 1,
                // alignSelf: 'stretch',
                height: StyleSheet.hairlineWidth,
                backgroundColor: '#dadada',
              },
              subSeparator,
              style,
            ]}
        {...rest}
      >
        {children && children}
      </View>
    )
  }, [children, style, subSeparator])
}

const Items = ({ flatListProps: flatListPropsFromComponent }) => {
  const {
    components,
    items,
    selectedItems,
    loading,
    _renderItemFlatList,
    itemsFlatListProps: flatListPropsFromContext,
    itemId,
    searchTerm,
    _filterItems,
    styles,
  } = useSMSContext()
  const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items
  const flatListProps = {
    ...flatListPropsFromContext,
    ...flatListPropsFromComponent,
  }
  return (
    <View
      keyboardShouldPersistTaps="always"
      style={[
      { paddingHorizontal: 12, flex: 1, },
        Platform.OS === 'web' && { overflowY: 'auto' },
        styles.scrollView,
      ]}
    >
      <View>
        {loading ? (
          <components.Loading />
        ) : (
          <View>
            {!renderItems || (!renderItems.length && !searchTerm) ? (
              <components.NoItems />
            ) : null}
            {items && renderItems && renderItems.length ? (
              <View>
                <FlatList
                  keyboardShouldPersistTaps="always"
                  removeClippedSubviews
                  initialNumToRender={15}
                  data={renderItems}
                  extraData={selectedItems}
                  keyExtractor={item => `${itemId(item)}`}
                  ItemSeparatorComponent={components.ItemSeparator}
                  ListFooterComponent={components.ItemsFooter}
                  renderItem={_renderItemFlatList}
                  {...flatListProps}
                />
              </View>
            ) : searchTerm ? (
              <components.NoResults />
            ) : null}
          </View>
        )}
      </View>
    </View>
  )
}

export default Items
