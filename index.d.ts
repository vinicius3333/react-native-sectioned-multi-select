import * as React from 'react';
import * as ReactNative from 'react-native';

export interface Styles {
  container?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  modalWrapper?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  selectToggle?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  selectToggleText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  item?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  itemWrapper?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  subItem?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  itemText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  itemIcon?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  itemIconSelected?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  selectedIcon:? ReactNative.StyleProp<ReactNative.ViewStyle>;
  selectedItemText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  selectedSubItemText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  highlightedItem?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  highlightedSubItem?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  subItemText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  searchBar?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  center?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  separator?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  subSeparator?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  chipsWrapper?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  chipContainer?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  chipText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  chipIcon?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  searchTextInput?: ReactNative.StyleProp<ReactNative.TextStyle>;
  scrollView?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  button?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  cancelButton?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  confirmText?: ReactNative.StyleProp<ReactNative.TextStyle>;
  toggleIcon?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  selectedItem?: ReactNative.StyleProp<ReactNative.ViewStyle>;
  selectedSubItem?: ReactNative.StyleProp<ReactNative.ViewStyle>;
}
export interface Components {
  NoResults?: (() => void) | JSX.Element;
  NoItems?: (() => void) | JSX.Element;
  Loading?: (() => void) | JSX.Element;
  ItemsFooter?: (() => void) | JSX.Element;
  ModalFooter?: (() => void) | JSX.Element;
  ModalHeader?: (() => void) | JSX.Element;
  SelectToggleIcon?: (() => void) | JSX.Element;
  CancelIcon?: (() => void) | JSX.Element;
  SearchIcon?: (() => void) | JSX.Element;
  SelectedIcon?: (() => void) | JSX.Element;
  UnselectedIcon?: (() => void) | JSX.Element;
  DropDownToggleIconUp?: (() => void) | JSX.Element;
  DropDownToggleIconDown?: (() => void) | JSX.Element;
  ChipRemoveIcon?: (() => void) | JSX.Element;
}

export interface Colors {
  primary?: string;
  success?: string;
  cancel?: string;
  light?: string;
  text?: string;
  subText?: string;
  selectToggleText?: string;
  searchPlaceholderText?: string;
  searchSelection?: string;
  chip?: string;
  itemBackground?: string;
  subItemBackground?: string;
  disabled?: string;
}

export interface SectionedMultiSelectProps<ItemType> {
  single?: boolean;
  singleShouldSubmit?: boolean;
  selectedItems?: any[];
  items?: ItemType[];
  displayKey?: string;
  uniqueKey: string;
  subKey?: string;
  iconNames?: {
    close: string;
    cancel: string;
    search: string;
    checkMark: string;
    arrowDown: string;
    arrowUp:string;
  };
  onSelectedItemsChange: (action: object) => (dispatch: () => void, getState: () => void) => void;
  showDropDowns?: boolean;
  showChips?: boolean;
  readOnlyHeadings?: boolean;
  selectText?: string;
  selectedText?: string | (() => void);
  renderSelectText?: (props: object) => void;
  confirmText?: string;
  hideConfirm?: boolean;
  styles?: Styles;
  colors?: Colors;
  components?: Components; 
  searchPlaceholderText?: string;
  loading?: boolean;
  subItemFontFamily?: object;
  itemFontFamily?: object;
  searchTextFontFamily?: object;
  confirmFontFamily?: object;
  showRemoveAll?: boolean;
  removeAllText?: string;
  modalProps?: ReactNative.ModalProps;
  modalWithSafeAreaView?: boolean;
  modalWithTouchable?: boolean;
  hideSearch?: boolean;
  parentsToggleChildren?: boolean;
  parentsToggleChildrenOnly?: boolean;
  parentsHighlightChildren?: boolean;
  onSelectedItemObjectsChange?: (items: ItemType[]) => void;
  itemNumberOfLines?: number;
  selectLabelNumberOfLines?: number;
  showCancelButton?: boolean;
  hideSelect?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  alwaysShowSelectText?: boolean;
  searchAdornment?: (searchText: string) => void;
  expandDropDowns?: boolean;
  animateDropDowns?: boolean;
  customLayoutAnimation?: object;
  filterItems?: (searchTerm: string) => void;
  onToggleSelector?: (selected: boolean) => void;
  chipsPosition?: 'top' | 'bottom';
  autoFocus?: boolean;
  iconKey?: string;
  disabled?: boolean;
  selectedIconPosition?: 'left' | 'right';
  itemIconPosition?: 'left' | 'right';
  parentChipsRemoveChildren?: boolean;
  iconRenderer?: (() => void) | JSX.Element;
  itemsFlatListProps?: Omit<ReactNative.FlatListProps<T>, 'data' | 'renderItem'>;
  subItemsFlatListProps?: Omit<ReactNative.FlatListProps<T>, 'data' | 'renderItem'>;
}
export default class SectionedMultiSelect<ItemType> extends React.Component<
  SectionedMultiSelectProps<ItemType>
> {}

export interface UseSectionedMultiSelect extends SectionedMultiSelectProps<ItemType> {
  _toggleSelect: () => void;
  _toggleChildren: () => void;
  _closeSelect: () => void;
  _submitSelection: () => void;
  _cancelSelection: () => void;
  _getSearchTerm: () => void;
  _itemSelected: () => void;
  _removeAllItems: () => void;
  _removeItem: () => void;
  _toggleItem: () => void;
  _selectAllItems: () => void;
  _findItem: () => void;
  _filterItems: () => void;
  _checkIsParent: () => void;
  getModalProps: () => void;
  setSearchTerm: () => void;
  _renderItemFlatList: () => void;
  _renderSeparator: () => void;
  _renderFooter: () => void;
  Icon: (() => void) | JSX.Element;

  selectedItems: ItemType[];
  //state
  searchTerm: string,
  selectIsVisible: boolean,
  // items to render
  renderItems: [],
}
export function useSectionedMultiSelect({}: SectionedMultiSelectProps<ItemType>): UseSectionedMultiSelect;