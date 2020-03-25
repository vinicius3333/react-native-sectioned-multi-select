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
    this.termId = 100;
    this.maxItems = 5;
  }

  componentDidMount() {
    this.pretendToLoad();
    // programatically opening the select
    // this.SectionedMultiSelect._toggleSelector()
  }
  componentWillUpdate() {
    date = new Date();
  }
  componentDidUpdate() {
    // date = new Date()
    console.log(new Date().valueOf() - date.valueOf());
  }

  render() {
    return (
      <SectionedMultiSelect
        items={this.props.items}
        itemId={item => `item--${item.id}`}
        getChildren={item => item.children}
        childItemId={item => `child--${item.id}`}
        iconRenderer={Icon}
        subKey="children"
        displayKey="title"
        iconKey="icon"
        modalWithSafeAreaView={true}
        chipComponent={customChip}
        searchAdornment={this.searchAdornment}
        renderSelectText={this.renderSelectText}
        hideChipRemove={this.props.hideChipRemove}
        showDropDowns={this.props.showDropDowns}
        expandDropDowns={this.props.expandDropDowns}
        readOnlyHeadings={this.props.readOnlyHeadings}
        single={this.props.single}
        parentsSelectAllChildren={this.props.selectChildren}
        parentsHighlightAllChildren={this.props.highlightChildren}
        onSelectedItemsChange={this.onSelectedItemsChange}
        onSelectedItemObjectsChange={this.onSelectedItemObjectsChange}
        onCancel={this.onCancel}
        onConfirm={this.onConfirm}
        selectedItems={this.props.selectedItems}
        colors={{primary: 'crimson'}}
        itemNumberOfLines={3}
        selectLabelNumberOfLines={3}
        parentChipsRemoveChildren={this.props.parentChipsRemoveChildren}
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
          selectToggle: {
            borderWidth: 1,
            borderRadius: 8,
            borderColor: 'silver',
            paddingHorizontal: 16,
            paddingVertical: 8
          },
          selectedItem: {
            backgroundColor: '#f8f8f8'
          },

          selectedItemText: {
            color: 'black'
          },
          selectedSubItemText: {
            color: 'crimson'
          },
          // subItemText: {
          //   color: this.props.selectedItems.length ? 'black' : 'lightgrey'
          // },
          selectedSubItem: {
            backgroundColor: '#dadada'
          }
        }}
        cancelIconComponent={
          <Icon size={20} name="close" style={{color: 'white'}} />
        }>
        <SMSContext.Consumer>
          {({
            selectedItems,
            _renderSearch: SearchBox,
            SelectModal,
            _renderControls: Controls,
            _renderSelector: Selector,
            _renderChips: Chips,
            _renderHeader: Header,
            _selectAllItems,
            selectIsVisible,
            _findItem,
            _removeAllItems,
            _toggleItem,
            getModalProps,
            _displaySelectedItems,
            subKey,
            displayKey,
            getItemProps,
            colors
          }) => (
            <ScrollView
              keyboardShouldPersistTaps="always"
              style={{backgroundColor: '#f8f8f8'}}
              contentContainerStyle={styles.container}>
              <Text style={styles.welcome}>
                React native sectioned multi select example.
              </Text>
              <React.Fragment>
                <Chips />
                <SelectModal>
                  <React.Fragment>
                    <Header />
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
                          onPress={
                            selectedItems.length
                              ? _removeAllItems
                              : _selectAllItems
                          }>
                          <Text style={{color: 'white', fontWeight: 'bold'}}>
                            {selectedItems.length ? 'Remove' : 'Select'} all
                          </Text>
                        </TouchableOpacity>

                        <View style={{flex: 1, flexDirection: 'row'}}>
                          {selectedItems.map(id => {
                            return (
                              <Chip
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
                                key={id}
                                id={id}
                              />
                            );
                          })}
                        </View>
                      </ScrollView>
                    </View>
                    <Items />
                    <Controls />
                  </React.Fragment>
                </SelectModal>
                <Selector />
              </React.Fragment>
            </ScrollView>
          )}
        </SMSContext.Consumer>
      </SectionedMultiSelect>
    );
  }
}

export default ContextRenderFunctionExample;
