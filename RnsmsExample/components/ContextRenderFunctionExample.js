import * as React from 'react';
import {
  Platform,
  Text,
  View,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Modal
} from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select/dist/lib/sectioned-multi-select';

import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import WebModal from 'modal-enhanced-react-native-web';

let date = new Date();

class ContextRenderFunctionExample extends React.Component {
  constructor() {
    super();
    this.state = {
      currentSelection: [
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

  updateItemsExternal = () => {
    // zoop
    // need to dispatch here
    this.setState({
      selectedItems: ['child--Classic cheeseburger', 'child--Seltzer Water']
    });
  };

  onSelectedItemsChange = action => (dispatch, getState) => {
    const prevItems = getState();
    console.log(
      '...thunk',
      prevItems,
      action,
      prevItems.length + action.count || 0
    );
    const count = prevItems.length + (action.count || 0);
    this.setState({
      message: `${count} selected`
    });
    console.log('message', this.state.message);

    const limit = 5;
    if (action.count && prevItems.length + action.count > limit) {
      this.setState({message: 'Please select 5 or less items'});
      dispatch({});
      return;
    }
    dispatch(action).then(() => {
      console.log('items updated', getState());
      this.setState({
        message: `${getState().length} selected`
      });
      // if chips were removed we want
      // that to be reflected in the current selected Items
      // otherwise you could remove chips, open select,
      // press cancel, then get the selected items before
      // the chips were removed
      if (action.origin === 'chip') {
        this.setState({
          currentSelection: getState()
        });
      }
    });
  };

  onCancel = (items, dispatch) => {
    console.log('currentSelection', this.state.currentSelection);
    dispatch({
      type: 'replace-items',
      items: this.state.currentSelection,
      origin: 'cancel'
    });
    this.setState({
      message: `${this.state.currentSelection.length} selected`
    });
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
          headerComponent={() => (
            <Text style={{textAlign: 'center', padding: 4}}>
              {this.state.message}
            </Text>
          )}
          iconNames={{
            search: 'magnify',
            close: 'close',
            cancel: 'cancel',
            checkMark: 'check',
            arrowDown: 'chevron-down',
            arrowUp: 'chevron-up'
          }}
          modalWithSafeAreaView={true}
          {...this.props}
          debug
          onCancel={this.onCancel}
          onConfirm={items => this.setState({currentSelection: items})}
          onSelectedItemsChange={this.onSelectedItemsChange}
          initialSelectedItems={this.state.currentSelection}
          // selectedItems={this.state.selectedItems}
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
          // cancelIconComponent={
          //   <Icon size={20} name="close" style={{color: 'white'}} />
          // }
          modalProps={{
            style: {margin: 0}
            // propagateSwipe: true,
            // hasBackdrop: false,
            // deviceWidth: 100,
            // deviceHeight: 100
          }}
          modalComponent={Platform.OS === 'web' ? WebModal : Modal}>
          {ctx => {
            const {
              selectedItems,
              _selectAllItems,
              _removeAllItems,
              colors,
              components: {
                ModalHeader,
                SelectModal,
                ModalControls,
                Selector,
                Chip,
                Chips,
                Items,
                Search
              }
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
                            backgroundColor: colors.success
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
                                        backgroundColor: colors.primary,
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
                    <Search />
                    <ModalControls />
                  </React.Fragment>
                </SelectModal>
                <Selector />
              </React.Fragment>
            );
          }}
        </SectionedMultiSelect>
      </View>
    );
  }
}

export default ContextRenderFunctionExample;
