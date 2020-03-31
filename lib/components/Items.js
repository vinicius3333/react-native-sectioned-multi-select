import { View, FlatList } from 'react-native';
import { callIfFunction } from '../helpers';
import useSMSContext from '../useSMSContext';
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
  const { items, selectedItems, noResultsComponent, loadingComponent, loading, noItemsComponent, stickyFooterComponent, chipsPosition, autoFocus, disabled,
    // _renderItemFlatList,
    itemsFlatListProps: flatListPropsFromContext, itemId, searchTerm, _filterItems, _renderSeparator, _renderFooter, styles, colors, } = useSMSContext();
  const renderItems = searchTerm ? _filterItems(searchTerm.trim()) : items;
  const flatListProps = {
    ...flatListPropsFromContext,
    ...flatListPropsFromComponent,
  };
  return (<View keyboardShouldPersistTaps="always" style={[{ paddingHorizontal: 12, flex: 1 }, styles.scrollView]}>
    <View>
      {loading ? (callIfFunction(loadingComponent)) : (<View>
        {!renderItems || (!renderItems.length && !searchTerm)
          ? callIfFunction(noItemsComponent)
          : null}
        {items && renderItems && renderItems.length ? (<View>
          <FlatList keyboardShouldPersistTaps="always" removeClippedSubviews initialNumToRender={15} data={renderItems} extraData={selectedItems} keyExtractor={item => `${itemId(item)}`} ItemSeparatorComponent={_renderSeparator} ListFooterComponent={_renderFooter} renderItem={_renderItemFlatList} {...flatListProps} />
        </View>) : searchTerm ? (callIfFunction(noResultsComponent)) : null}
      </View>)}
    </View>
  </View>);
};
const _renderItemFlatList = ({ item }) => {
  const { styles, colors, _toggleItem, searchTerm, _toggleChildren, highlightedChildren, selectedItems, } = useSMSContext();
  // const isParent = _checkIsParent(item)
  return (<View>
    <RowItem iconRenderer={Icon} item={item} _itemSelected={_itemSelected}
      // isParent={isParent}
      searchTerm={searchTerm} _toggleItem={_toggleItem} _toggleChildren={_toggleChildren} highlightedChildren={highlightedChildren} {...getProps} styles={styles} colors={colors} selectedItems={selectedItems} />
  </View>);
};

export default Items