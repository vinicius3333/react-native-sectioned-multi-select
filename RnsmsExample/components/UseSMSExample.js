import * as React from 'react';
import {Text, View, ScrollView, TouchableOpacity} from 'react-native';
import {
  useSectionedMultiSelect,
  SMSContext,
  Chip,
  Items
} from 'react-native-sectioned-multi-select/lib/sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UseSMSExample = () => {
  const [state, _setState] = React.useState({
    loading: false,
    selectedItems2: [],
    selectedItemObjects: [],
    currentItems: [],
    showDropDowns: false,
    single: false,
    readOnlyHeadings: false,
    parentsHighlightAllChildren: false,
    parentsSelectAllChildren: false,
    hideChipRemove: false,
    hasErrored: false
  });
  const setState = newState => _setState({...state, ...newState});
  const termId = 100;
  const maxItems = 5;
  const onSelectedItemObjectsChange = objs =>
    setState({selectedItemObjects: objs});
  const [selectedItems1, setSelectedItems1] = React.useState([]);

  const onSelectedItemsChange = items => {
    // setSelectedItems1(items);
    console.log('selected items changee!', items);
  };

  const SMSState = useSectionedMultiSelect({
    items,
    displayKey: 'title',
    iconKey: 'icon',
    subKey: 'children',
    childItemId: item => item.title,
    onSelectedItemsChange: onSelectedItemsChange,
    modalWithTouchable: true,
    modalWithSafeAreaView: true,
    iconRenderer: Icon,
    selectedItems: selectedItems1,
    showDropDowns: state.showDropDowns,
    single: state.single,
    readOnlyHeadings: state.readOnlyHeadings,
    expandDropDowns: state.expandDropDowns,
    parentsHighlightAllChildren: state.parentsHighlightAllChildren,
    parentsSelectAllChildren: state.parentsSelectAllChildren,
    hideChipRemove: state.hideChipRemove,
    iconNames: {
      search: 'magnify',
      close: 'close',
      checkMark: 'check',
      arrowDown: 'chevron-down',
      arrowUp: 'chevron-up'
    }
  });
  const {
    // selectedItems,
    Search: SearchBox,
    SelectModal,
    renderItems,
    _renderControls: Controls,
    Items,
    _renderSelector: Selector,
    _renderChips: Chips,
    _renderHeader: Header,
    _selectAllItems,
    _removeAllItems,
    _toggleItem,
    _checkIsParent,
    _findItem,
    _displaySelectedItems,
    subKey,
    displayKey,
    selectedItems,
    getModalProps,
    colors
  } = SMSState;

  const onSwitchToggle = k => {
    const v = !state[k];
    setState({[k]: v});
  };

  return (
    <SMSContext.Provider value={SMSState}>
      <Chips />
      <SelectModal>
        <React.Fragment>
          <Header />
          <SearchBox />
          <View
            style={{
              height: 50,
              borderBottomWidth: 1,
              borderBottomColor: 'lightgrey'
            }}>
            {/*
                      showing the chips inside the SmsModal
                      in a horizontal ScrollView,
                      with a select/remove all button
                    */}
            <ScrollView
              horizontal
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'nowrap',
                paddingHorizontal: 10
              }}>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  height: 24,
                  borderWidth: 0,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  flex: 1,
                  backgroundColor: colors.primary
                }}
                onPress={
                  selectedItems.length ? _removeAllItems : _selectAllItems
                }>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                  {selectedItems.length ? 'Remove' : 'Select'} all
                </Text>
              </TouchableOpacity>

              <View style={{flex: 1, flexDirection: 'row'}}>
                {selectedItems.map(id => {
                  const item = _findItem(id);
                  console.log(item, id);
                  if (!item || !item[displayKey]) return null;
                  // if (item[subKey] && item[subKey].length) return null;
                  return customChip({
                    id: id,
                    text: item[displayKey],
                    onPress: () => _toggleItem(item)
                  });
                })}
              </View>
            </ScrollView>
          </View>

          <Items
            flatListProps={{
              initialNumToRender: 2
              // renderItem: ({ item }) => (
              //   <TouchableOpacity style={{padding: 5}} onPress={() => _toggleItem(item, true)}>
              //     <Text>{item.title}</Text>
              //   </TouchableOpacity>
              // ),
            }}
          />
          <Controls />
        </React.Fragment>
      </SelectModal>
      <Selector />
    </SMSContext.Provider>
  );
};

export default UseSMSExample;
