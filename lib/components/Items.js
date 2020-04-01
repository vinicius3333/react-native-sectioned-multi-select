import * as React from 'react'
import { View, FlatList, Platform } from 'react-native';
import { callIfFunction } from '../helpers';
import useSMSContext from '../context/useSMSContext';
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
const Items = ({ flatListProps: flatListPropsFromComponent }) => {
  const { components, items, selectedItems, loading, chipsPosition, autoFocus, disabled,
    _renderItemFlatList,
    itemsFlatListProps: flatListPropsFromContext, itemId, searchTerm, _filterItems, _renderSeparator, _renderFooter, styles, colors, } = useSMSContext();
  const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items;
  const flatListProps = {
    ...flatListPropsFromContext,
    ...flatListPropsFromComponent,
  };
  return (<View keyboardShouldPersistTaps="always" style={[{ paddingHorizontal: 12, flex: 1 }, styles.scrollView, Platform.OS === 'web' && { overflowY: 'auto'}]}>
    <View>
      {loading ? <components.Loading/> : (<View>
        {!renderItems || (!renderItems.length && !searchTerm)
          ? <components.NoItems/>
          : null}
        {items && renderItems && renderItems.length ? (<View>
          <FlatList
            keyboardShouldPersistTaps="always"
            removeClippedSubviews
            initialNumToRender={15}
            data={renderItems}
            extraData={selectedItems}
            keyExtractor={item => `${itemId(item)}`}
            ItemSeparatorComponent={_renderSeparator}
            ListFooterComponent={components.ItemsFooter}
            renderItem={_renderItemFlatList} {...flatListProps}
            />
        </View>) : searchTerm ? <components.NoResults/> : null}
      </View>)}
    </View>
  </View>);
};


export default Items