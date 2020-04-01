import { PropTypes } from 'prop-types'
import * as React from 'react';

import {
  View,
  Text,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
// import { Selector, Search, Items, Chips } from './components'
// import { SelectModal, ModalHeader, ModalFooter, ModalControls } from './components/SelectModal'
import SMSContext from './context/SMSContext'
import { useSectionedMultiSelect } from './useSectionedMultiSelect'


export const defaultStyles = {
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
  chipsWrapper: {marginVertical: 10},
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

export const defaultColors = {
  primary: '#3f51b5',
  success: '#4caf50',
  cancel: '#1A1A1A',
  light: '#ffffff',
  text: '#2e2e2e',
  subText: '#848787',
  selectToggleText: '#333',
  searchPlaceholderText: '#999',
  searchSelection: 'rgba(0,0,0,0.2)',
  searchIcon: '#3f51b5',
  chip: '#848787',
  itemBackground: '#fff',
  subItemBackground: '#ffffff',
  disabled: '#d7d7d7',
}

const SectionedMultiSelect = props => {
  const SMSState = useSectionedMultiSelect(props)

  const { chipsPosition } = props
  const { SelectModal, ModalHeader, Search, Items, ModalControls, ModalFooter, Selector, Chips,} = SMSState.components;
  //either return a default layout or just the context/children
  return props.children ? (
    <SMSContext.Provider value={SMSState}>{props.children(SMSState)}</SMSContext.Provider>
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
    light: PropTypes.string,
    text: PropTypes.string,
    subText: PropTypes.string,
    selectToggleText: PropTypes.string,
    searchPlaceholderText: PropTypes.string,
    searchSelection: PropTypes.string,
    chip: PropTypes.string,
    itemBackground: PropTypes.string,
    subItemBackground: PropTypes.string,
    disabled: PropTypes.string,
  }),
  searchPlaceholderText: PropTypes.string,
  // noResultsComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  // loadingComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
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
  modalComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  hideSearch: PropTypes.bool,
  // footerComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  // stickyFooterComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
  // selectToggleIconComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
  // cancelIconComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  // searchIconComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  // selectedIconComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
  // unselectedIconComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
  // dropDownToggleIconUpComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
  // dropDownToggleIconDownComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
  // chipRemoveIconComponent: PropTypes.oneOfType([
  //   PropTypes.func,
  //   PropTypes.object,
  // ]),
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
  // headerComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  alwaysShowSelectText: PropTypes.bool,
  searchAdornment: PropTypes.func,
  expandDropDowns: PropTypes.bool,
  animateDropDowns: PropTypes.bool,
  customLayoutAnimation: PropTypes.object,
  filterItems: PropTypes.func,
  onToggleSelect: PropTypes.func,
  // noItemsComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  // customChipsRenderer: PropTypes.func,
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

export const SMSDefaultProps = {
  single: false,
  singleShouldSubmit: true,
  initialSelectedItems: [],
  itemId: item => `parent-${item.id}`,
  childItemId: item => `child-${item.id}`,
  getChildren: item => item.children && item.children,
  displayKey: 'name',
  iconNames: {
    close: 'close',
    checkMark: 'check',
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
  // noResultsComponent: noResults,
  // loadingComponent: loadingComp,
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
  modalProps: {
    modalSupportedOrientations: ['portrait', 'landscape'],
    modalAnimationType: 'fade',
  },
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
  // noItemsComponent: noItems,
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
