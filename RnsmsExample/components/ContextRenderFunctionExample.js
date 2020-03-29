import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import SectionedMultiSelect, {
  SMSContext,
  Chip,
  Items
} from 'react-native-sectioned-multi-select/lib/sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialIcons';

let date = new Date();

class ContextRenderFunctionExample extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedItems: [
        'child--Avocado burger',
        'child--Diet Coke',
        'child--Coke',
        'child--Classic cheeseburger',
        'child--Seltzer Water'
      ]
    };
    this.termId = 100;
    this.maxItems = 5;
  }

  componentWillUpdate() {
    date = new Date();
  }
  componentDidUpdate() {
    // date = new Date()
    console.log(new Date().valueOf() - date.valueOf());
  }
  itemsReducer = (state, action) => {
    console.log('reducer: ', state, action);

    switch (action.type) {
      case 'add':
        return [...state, action.item];
      case 'add-single':
        return [action.item];
      case 'remove':
        return [...state.filter(item => item !== action.item)];
      case 'replace-items':
        return [...action.items];
      case 'add-items':
        return [...state, ...action.items];
      case 'remove-items':
        return [...state.filter(item => !action.items.includes(item))];
      case 'remove-all':
        return [];
      default:
        return state;
    }
  };
  updateItemsExternal = () => {
    // zoop
    // need to dispatch here
    this.setState({
      selectedItems: ['child--Classic cheeseburger', 'child--Seltzer Water']
    });
  };

  limitItems = (limit, action) => (dispatch, state) => {
    console.log('...thunk', state, action.count, limit);

    if (state && state.length + action.count > limit) {
      return;
    }
    dispatch(action);
  };
  // selected items are previous selectedItems (when using selectedItems prop)
  onSelectedItemsChange = (selectedItems, dispatch, params) => {
    console.log(
      'App: dispatch params',
      params,
      selectedItems.length,
      selectedItems,
      params.count && params.count + selectedItems.length
    );
    //  const state = this.itemsReducer(selectedItems, params);
    // // this.setState({selectedItems: state});

    // // const dispatchesThatAdd = ['add-items', 'add-single']
    // // shitty attempt at an 'item limit'
    // if (params.count && params.count + selectedItems.length > 5) {
    //   console.log(
    //     'App: not dispatching because total selected would be over 5!'
    //   );

    //   return;
    // }
    dispatch(this.limitItems(5, params));
  };
  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.updateItemsExternal}>
          <Text>UPDATE EXTERNAL</Text>
        </TouchableOpacity>

        <SectionedMultiSelect
          itemId={item => `item--${item.title}`}
          getChildren={item => item.children}
          childItemId={item => `child--${item.title}`}
          subKey="children"
          displayKey="title"
          iconKey="icon"
          iconRenderer={Icon}
          iconNames={{
            search: 'magnify',
            close: 'close',
            checkMark: 'check',
            arrowDown: 'chevron-down',
            arrowUp: 'chevron-up'
          }}
          modalWithSafeAreaView={true}
          {...this.props}
          onSelectedItemsChange={this.onSelectedItemsChange}
          initialSelectedItems={this.state.selectedItems}
          selectedItems={this.state.selectedItems}
          styles={{
            // chipText: {
            //   maxWidth: Dimensions.get('screen').width - 90,
            // },
            // itemText: {
            //   color: this.props.selectedItems.length ? 'black' : 'lightgrey'
            // },
            scrollView: {
              paddingHorizontal: 0
            },
            item: {
              paddingHorizontal: 20
            },
            subItem: {
              paddingHorizontal: 10
            },
            parentChipText: {
              fontWeight: 'bold'
            },
            removeAllChipContainer: {
              backgroundColor: 'grey'
            },
            removeAllChipText: {
              color: 'white'
            },
            itemIcon: {
              fontSize: 24,
              marginRight: 8,
              color: 'silver'
            },
            selectToggle: {
              borderWidth: 0.5,
              borderRadius: 8,
              borderColor: 'silver',
              paddingHorizontal: 16,
              paddingVertical: 8
            },
            selectedItem: {
              backgroundColor: undefined
            },

            selectedItemText: {
              color: 'black',
              fontWeight: 'bold'
            },
            selectedSubItemText: {
              color: 'black',
              fontWeight: 'bold'
            },
            selectedIcon: {
              color: 'purple'
            },
            itemIconSelected: {
              color: 'purple'
            },

            // subItemText: {
            //   color: this.props.selectedItems.length ? 'black' : 'lightgrey'
            // },
            selectedSubItem: {
              // backgroundColor: '#dadada'
            }
          }}
          selectedIconComponent={() => {}}
          showCancelButton
          cancelIconComponent={
            <Icon size={20} name="close" style={{color: 'white'}} />
          }>
          <SMSContext.Consumer>
            {ctx => {
              const {
                selectedItems,
                Search,
                SelectModal,
                ModalControls,
                Selector,
                Chips,
                ModalHeader,
                _selectAllItems,
                _removeAllItems,
                colors
              } = ctx;
              return (
                <React.Fragment>
                  <Chips />
                  <SelectModal>
                    <React.Fragment>
                      <ModalHeader />
                      {/*   <SearchBox /> */}
                      <View
                        style={{
                          height: 50,
                          borderBottomWidth: 1,
                          borderBottomColor: 'lightgrey'
                        }}>
                        {/*
                      showing the chips inside the SelectModal
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
                            onPress={() =>
                              selectedItems.length
                                ? _removeAllItems('modal-horizontal-chips')
                                : _selectAllItems('modal-horizontal-chips')
                            }>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>
                              {selectedItems.length ? 'Remove' : 'Select'} all
                            </Text>
                          </TouchableOpacity>

                          <View style={{flex: 1, flexDirection: 'row'}}>
                            {selectedItems.length && selectedItems.length > 0
                              ? selectedItems.map(id => {
                                  return (
                                    <Chip
                                      items={selectedItems}
                                      key={id}
                                      id={id}
                                      styles={{
                                        chipContainer: {
                                          backgroundColor: 'orange',
                                          borderColor: 'yellow',
                                          height: 24,
                                          alignSelf: 'center',

                                          borderWidth: 0,
                                          borderRadius: 20,
                                          paddingHorizontal: 10
                                        },
                                        chipText: {
                                          color: 'white'
                                        },
                                        chipIcon: {
                                          color: 'white'
                                        }
                                      }}
                                    />
                                  );
                                })
                              : null}
                          </View>
                        </ScrollView>
                      </View>
                      <Items />
                      <ModalControls />
                    </React.Fragment>
                  </SelectModal>
                  <Selector />
                </React.Fragment>
              );
            }}
          </SMSContext.Consumer>
        </SectionedMultiSelect>
      </View>
    );
  }
}

export default ContextRenderFunctionExample;
