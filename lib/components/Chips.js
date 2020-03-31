import * as React from 'react'
import { PropTypes } from 'prop-types';
import { View, TouchableOpacity, Text } from 'react-native';
import { isEqual } from 'lodash';
import { callIfFunction } from '../helpers';
import useSMSContext from '../useSMSContext';

export const Chips = ({ children }) => {
  // const { styles, colors } = state
  const { styles, colors, single, _removeAllItems, customChipsRenderer, selectedItems, showRemoveAll, removeAllText, showChips, } = useSMSContext();
  const removeAll = () => selectedItems.length > 1 && showRemoveAll ? (<View style={[
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
  ]}>
    <TouchableOpacity onPress={() => _removeAllItems('chips-remove-all')} style={[
      {
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
      },
      styles.chipTouchable,
      styles.removeAllChipTouchable,
    ]}>
      <Text style={[
        {
          color: colors.chipColor,
          fontSize: 13,
          marginRight: 0,
        },
        styles.chipText,
        styles.removeAllChipText,
      ]}>
        {removeAllText}
      </Text>
    </TouchableOpacity>
  </View>) : null;
  return children ? (children) : selectedItems.length > 0 &&
    !single &&
    showChips &&
    !customChipsRenderer ? (<View style={[
      {
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
      },
      styles.chipsWrapper,
    ]}>
      {removeAll()}
      {selectedItems && selectedItems.length > 0 && selectedItems.map(id => {
        return <Chip key={id} id={id} selectedItems={selectedItems} />;
      })}
    </View>) : null;
};


const ChipWrapper = (Comp) => (props) => {
  const { items, styles: stylesFromContext, colors, displayKey, Icon, chipRemoveIconComponent, hideChipRemove, hideParentChips, iconNames, selectedItems, _toggleChildren, _toggleItem, getChildren, itemId, childItemId, _checkIsParent, } = useSMSContext();
  const { styles: stylesFromProps, id } = props;
  const styles = {
    ...stylesFromContext,
    ...stylesFromProps,
  };
  // this is repeated from above because
  // the props (in find) weren't defined on first render
  const _findItem = id => {
    return find(id, items);
  };
  const find = (id, items, isChild) => {
    if (!items) {
      return {};
    }
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
  };
  const item = React.useMemo(() => _findItem(id), [id, items]);
  if (!item) {
    return null;
  }
  // check if item has children
  const isParent = React.useMemo(() => _checkIsParent(item), [id]);
  // get the parent id if it's a child item
  // const parentItem = isParent ? undefined : findParent(item)
  const onPress = () => _toggleItem(item, 'chip');
  const hideChip = isParent && hideParentChips;
  if (!item || !item[displayKey] || hideChip)
    return null;
  return (<Comp onPress={onPress} styles={styles} colors={colors} displayKey={displayKey} Icon={Icon} isParent={isParent} chipRemoveIconComponent={chipRemoveIconComponent} hideChipRemove={hideChipRemove} hideParentChips={hideParentChips} iconNames={iconNames} item={item} selectedItems={selectedItems} />);
};

export const Chip = ChipWrapper(React.memo((props) => {
  const { styles, colors, displayKey, item, onPress, Icon, chipRemoveIconComponent, hideChipRemove, iconNames, isParent, } = props;
  console.log('chip render', item);
  return (<View style={[
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
  ]}>
    <Text numberOfLines={2} style={[
      {
        textAlignVertical: 'center',
        color: colors.chipColor,
        lineHeight: 13,
        fontSize: 13,
        marginRight: 0,
      },
      styles.chipText,
      isParent && styles.parentChipText,
    ]}>
      {item[displayKey]}
    </Text>
    {!hideChipRemove && (<TouchableOpacity onPress={onPress} style={{
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    }}>
      {callIfFunction(chipRemoveIconComponent) || (<Icon name={iconNames.close} style={[
        {
          color: colors.chipColor,
          fontSize: 16,
          marginHorizontal: 6,
          marginVertical: 7,
        },
        styles.chipIcon,
      ]} />)}
    </TouchableOpacity>)}
  </View>);
}, (prevProps, nextProps) => {
  // return false;
  if (!isEqual(prevProps.styles, nextProps.styles)) {
    // console.log('should Re-render ', 'styles not equal', prevProps.selectedItems);
    return false;
  }
  if (prevProps.selectedItems.includes(prevProps.id) &&
    nextProps.selectedItems.includes(prevProps.id)) {
    // console.log('Chip shouldNotRerender ', 'item selected', prevProps.item);
    return true;
  }
  if (!prevProps.selectedItems.includes(prevProps.id) &&
    !nextProps.selectedItems.includes(prevProps.id)) {
    // console.log('Chip shouldNotRerender ', 'item not selected', prevProps.item);
    return true;
  }
  return false;
}));
Chip.propTypes = {
  styles: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
