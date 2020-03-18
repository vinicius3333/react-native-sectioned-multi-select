import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  Switch,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  FlatList,
} from 'react-native';
import SectionedMultiSelect, {
  useSectionedMultiSelect,
  SMSContext,
} from 'react-native-sectioned-multi-select/lib/sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RowItem } from 'react-native-sectioned-multi-select/lib/components';

const img = require('./z.jpg');

// Sorry for the mess

const items = [
  {
    title: 'Fruits',
    id: 0,

    children: [
      {
        title: 'Apple',
        id: 0,
      },
      {
        title: 'Strawberry',
        id: 1,
      },
      {
        title: 'Pineapple',
        id: 2,
      },
      {
        title: 'Banana',
        id: 3,
      },
      {
        title: 'Wátermelon',
        id: 15,
      },
      {
        title: 'אבטיח',
        id: 17,
      },
      {
        title: 'Raspberry',
        id: 18,
      },
      {
        title: 'Orange',
        id: 19,
      },
      {
        title: 'Mandarin',
        id: 20,
      },
      {
        title: 'Papaya',
        id: 21,
      },
      {
        title: 'Lychee',
        id: 22,
      },
      {
        title: 'Cherry',
        id: 23,
      },
      {
        title: 'Peach',
        id: 24,
      },
      {
        title: 'Apricot',
        id: 25,
      },
    ],
  },
  {
    title: 'Gèms',
    id: 1,
    icon: 'cake',
    children: [
      {
        title: 'Quartz',
        id: 26,
      },
      {
        title: 'Zircon',
        id: 27,
      },
      {
        title: 'Sapphirè',
        id: 28,
      },
      {
        title: 'Topaz',
        id: 29,
      },
    ],
  },
  {
    title: 'Plants',
    id: 2,
    icon: img,

    children: [
      {
        title: "Mother In Law's Tongue",
        id: 30,
      },
      {
        title: 'Yucca',
        id: 31,
      },
      {
        title: 'Monsteria',
        id: 32,
      },
      {
        title: 'Palm',
        id: 33,
      },
    ],
  },
  {
    title: 'No child',
    id: 34,
  },
];
console.log(items);

// const items2 =
//   [{
//     title: 'Plants',
//     id: 2,
//     children: [
//       {
//         title: "Mother In Law's Tongue",
//         id: 30,
//       },
//       {
//         title: 'Yucca',
//         id: 31,
//       },
//       {
//         title: 'Monsteria',
//         id: 32,
//       },
//       {
//         title: 'Palm',
//         id: 33,
//       },

//     ],
//   }]
const items2 = [];
for (let i = 0; i < 100; i++) {
  items2.push({
    id: i,
    title: `item ${i}`,
    children: [
      {
        id: `10${i}`,
        title: `child 10${i}`,
      },
      {
        id: `11${i}`,
        title: `child 11${i}`,
      },
      {
        id: `12${i}`,
        title: `child 12${i}`,
      },
    ],
  });
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#333',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
  },
  label: {
    fontWeight: 'bold',
  },
  switch: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});
const accentMap = {
  â: 'a',
  Â: 'A',
  à: 'a',
  À: 'A',
  á: 'a',
  Á: 'A',
  ã: 'a',
  Ã: 'A',
  ê: 'e',
  Ê: 'E',
  è: 'e',
  È: 'E',
  é: 'e',
  É: 'E',
  î: 'i',
  Î: 'I',
  ì: 'i',
  Ì: 'I',
  í: 'i',
  Í: 'I',
  õ: 'o',
  Õ: 'O',
  ô: 'o',
  Ô: 'O',
  ò: 'o',
  Ò: 'O',
  ó: 'o',
  Ó: 'O',
  ü: 'u',
  Ü: 'U',
  û: 'u',
  Û: 'U',
  ú: 'u',
  Ú: 'U',
  ù: 'u',
  Ù: 'U',
  ç: 'c',
  Ç: 'C',
};
const tintColor = '#174A87';

const Loading = (props) =>
  props.hasErrored ? (
    <TouchableWithoutFeedback onPress={props.fetchCategories}>
      <View style={styles.center}>
        <Text>oops... something went wrong. Tap to reload</Text>
      </View>
    </TouchableWithoutFeedback>
  ) : (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );

const Toggle = (props) => (
  <TouchableWithoutFeedback onPress={() => props.onPress(!props.val)} disabled={props.disabled}>
    <View style={styles.switch}>
      <Text style={styles.label}>{props.name}</Text>
      <Switch
        trackColor={tintColor}
        onValueChange={(v) => props.onPress(v)}
        value={props.val}
        disabled={props.disabled}
      />
    </View>
  </TouchableWithoutFeedback>
);

const customIconRenderer = ({ name, size = 18, style }) => {
  // flatten the styles
  const flat = StyleSheet.flatten(style);
  // remove out the keys that aren't accepted on View
  const { color, fontSize, ...styles } = flat;

  let iconComponent;
  // the colour in the url on this site has to be a hex w/o hash
  const iconColor = color && color.substr(0, 1) === '#' ? `/${color.substr(1)}/` : '/';

  const Search = (
    <Image
      source={{ uri: `https://png.icons8.com${iconColor}ios/search/` }}
      style={{ width: size, height: size }}
    />
  );
  const Down = (
    <Image
      source={{ uri: `https://png.icons8.com${iconColor}ios/down/` }}
      style={{ width: size, height: size }}
    />
  );
  const Up = (
    <Image
      source={{ uri: `https://png.icons8.com${iconColor}ios/up/` }}
      style={{ width: size, height: size }}
    />
  );
  const Close = (
    <Image
      source={{ uri: `https://png.icons8.com/${iconColor}ios/multiply/` }}
      style={{ width: size, height: size }}
    />
  );

  const Check = (
    <Image
      source={{ uri: `https://png.icons8.com/${iconColor}android/checkmark/` }}
      style={{ width: size / 1.5, height: size / 1.5 }}
    />
  );
  const Cancel = (
    <Image
      source={{ uri: `https://png.icons8.com/${iconColor}ios/cancel/` }}
      style={{ width: size, height: size }}
    />
  );

  switch (name) {
    case 'search':
      iconComponent = Search;
      break;
    case 'keyboard-arrow-up':
      iconComponent = Up;
      break;
    case 'keyboard-arrow-down':
      iconComponent = Down;
      break;
    case 'close':
      iconComponent = Close;
      break;
    case 'check':
      iconComponent = Check;
      break;
    case 'cancel':
      iconComponent = Cancel;
      break;
    default:
      iconComponent = null;
      break;
  }
  return <View style={styles}>{iconComponent}</View>;
};

const ZApp = () => {
  const [state, _setState] = React.useState({
    loading: false,
    selectedItems2: [],
    selectedItemObjects: [],
    currentItems: [],
    showDropDowns: false,
    single: false,
    readOnlyHeadings: false,
    highlightChildren: false,
    selectChildren: false,
    hideChipRemove: false,
    hasErrored: false,
  });
  const setState = (newState) => _setState({ ...state, ...newState });
  const termId = 100;
  const maxItems = 5;
  const onSelectedItemObjectsChange = (objs) => setState({ selectedItemObjects: objs });
  const [selectedItems1, setSelectedItems1] = React.useState([1]);

  const onSelectedItemsChange = (items) => {
    // setSelectedItems1(items);
    console.log('selected items changee!', items);
  };

  const SMSState = useSectionedMultiSelect({
    items,
    displayKey: 'title',
    uniqueKey: 'id',
    iconKey: 'icon',
    subKey: 'children',
    onSelectedItemsChange: onSelectedItemsChange,
    modalWithTouchable: true,
    modalWithSafeAreaView: true,
    iconRenderer: customIconRenderer,
    selectedItems: selectedItems1,
    showDropDowns: state.showDropDowns,
    single: state.single,
    readOnlyHeadings: state.readOnlyHeadings,
    expandDropDowns: state.expandDropDowns,
    highlightChildren: state.highlightChildren,
    selectChildren: state.selectChildren,
    hideChipRemove: state.hideChipRemove,
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
    colors,
  } = SMSState;

  const onSwitchToggle = (k) => {
    const v = !state[k];
    setState({ [k]: v });
  };
  const customChip = ({ text, onPress, id }) => (
    <View
      key={id}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginHorizontal: 2,
      }}
    >
      <Text style={{ color: 'grey', fontWeight: 'bold' }}>{text}</Text>
      <TouchableOpacity style={{ marginLeft: 4 }} onPress={onPress}>
        <Icon name="close" color="grey" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      style={{ backgroundColor: '#f8f8f8' }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.welcome}>React native sectioned multi select example.</Text>
      <React.Fragment>
        <SMSContext.Provider value={SMSState}>
          <Chips />
          <SelectModal>
            <React.Fragment>
              <Header />
              <SearchBox />
              <View style={{ height: 50, borderBottomWidth: 1, borderBottomColor: 'lightgrey' }}>
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
                    paddingHorizontal: 10,
                  }}
                >
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
                      backgroundColor: colors.primary,
                    }}
                    onPress={selectedItems.length ? _removeAllItems : _selectAllItems}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      {selectedItems.length ? 'Remove' : 'Select'} all
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    {selectedItems.map((id) => {
                      const item = _findItem(id);
                      const isParent = _checkIsParent(item)
                      if (!item || !item[displayKey]) return null;
                      // if (item[subKey] && item[subKey].length) return null;
                      return customChip({
                        id: id,
                        text: item[displayKey],
                        onPress: () => _toggleItem(item, isParent),
                      });
                    })}
                  </View>
                </ScrollView>
              </View>

              <Items
                flatListProps={{
                  initialNumToRender: 2,
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
      </React.Fragment>

      <View>
        <View style={styles.border}>
          <Text style={styles.heading}>Settings</Text>
        </View>
        <Toggle name="Single" onPress={() => onSwitchToggle('single')} val={state.single} />
        <Toggle
          name="Read only headings"
          onPress={() => onSwitchToggle('readOnlyHeadings')}
          val={state.readOnlyHeadings}
        />
        <Toggle
          name="Expand dropdowns"
          onPress={() => onSwitchToggle('expandDropDowns')}
          val={state.expandDropDowns}
          disabled={!state.showDropDowns}
        />
        <Toggle
          name="Show dropdown toggles"
          onPress={() => onSwitchToggle('showDropDowns')}
          val={state.showDropDowns}
        />
        <Toggle
          name="Auto-highlight children"
          onPress={() => onSwitchToggle('highlightChildren')}
          val={state.highlightChildren}
          disabled={state.selectChildren}
        />
        <Toggle
          name="Auto-select children"
          onPress={() => onSwitchToggle('selectChildren')}
          disabled={state.highlightChildren}
          val={state.selectChildren}
        />
        <Toggle
          name="Hide Chip Remove Buttons"
          onPress={() => onSwitchToggle('hideChipRemove')}
          val={state.hideChipRemove}
        />
        <TouchableWithoutFeedback onPress={() => console.log('remove all items')}>
          <View style={styles.switch}>
            <Text style={styles.label}>Remove All</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </ScrollView>
  );
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      items: null,
      loading: false,
      selectedItems: [],
      selectedItems2: [],
      selectedItemObjects: [],
      currentItems: [],
      showDropDowns: false,
      single: false,
      readOnlyHeadings: false,
      highlightChildren: false,
      selectChildren: false,
      hideChipRemove: false,
      hasErrored: false,
    };
    this.termId = 100;
    this.maxItems = 5;
  }

  componentDidMount() {
    this.pretendToLoad();
    // programatically opening the select
    // this.SectionedMultiSelect._toggleSelector()
  }

  // custom icon renderer passed to iconRenderer prop
  // see the switch for possible icon name
  // values
  icon = ({ name, size = 18, style }) => {
    // flatten the styles
    const flat = StyleSheet.flatten(style);
    // remove out the keys that aren't accepted on View
    const { color, fontSize, ...styles } = flat;

    let iconComponent;
    // the colour in the url on this site has to be a hex w/o hash
    const iconColor = color && color.substr(0, 1) === '#' ? `${color.substr(1)}/` : '/';

    const Search = (
      <Image
        source={{ uri: `https://png.icons8.com/search/${iconColor}ios/` }}
        style={{ width: size, height: size }}
      />
    );
    const Down = (
      <Image
        source={{ uri: `https://png.icons8.com/down/${iconColor}ios/` }}
        style={{ width: size, height: size }}
      />
    );
    const Up = (
      <Image
        source={{ uri: `https://png.icons8.com/up/${iconColor}ios/` }}
        style={{ width: size, height: size }}
      />
    );
    const Close = (
      <Image
        source={{ uri: `https://png.icons8.com/multiply/${iconColor}ios/` }}
        style={{ width: size, height: size }}
      />
    );

    const Check = (
      <Image
        source={{ uri: `https://png.icons8.com/checkmark/${iconColor}android/` }}
        style={{ width: size / 1.5, height: size / 1.5 }}
      />
    );
    const Cancel = (
      <Image
        source={{ uri: `https://png.icons8.com/cancel/${iconColor}ios/` }}
        style={{ width: size, height: size }}
      />
    );

    switch (name) {
      case 'search':
        iconComponent = Search;
        break;
      case 'keyboard-arrow-up':
        iconComponent = Up;
        break;
      case 'keyboard-arrow-down':
        iconComponent = Down;
        break;
      case 'close':
        iconComponent = Close;
        break;
      case 'check':
        iconComponent = Check;
        break;
      case 'cancel':
        iconComponent = Cancel;
        break;
      default:
        iconComponent = null;
        break;
    }
    return <View style={styles}>{iconComponent}</View>;
  };

  getProp = (object, key) => object && this.removerAcentos(object[key]);

  rejectProp = (items, fn) => items.filter(fn);

  pretendToLoad = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, items });
    }, 0);
  };

  // testing a custom filtering function that ignores accents
  removerAcentos = (s) => s.replace(/[\W\[\] ]/g, (a) => accentMap[a] || a);

  filterItems = (searchTerm, items, { subKey, displayKey, uniqueKey }) => {
    let filteredItems = [];
    let newFilteredItems = [];
    items.forEach((item) => {
      const parts = this.removerAcentos(searchTerm.trim()).split(/[[ \][)(\\/?\-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'i');
      if (regex.test(this.getProp(item, displayKey))) {
        filteredItems.push(item);
      }
      if (item[subKey]) {
        const newItem = Object.assign({}, item);
        newItem[subKey] = [];
        item[subKey].forEach((sub) => {
          if (regex.test(this.getProp(sub, displayKey))) {
            newItem[subKey] = [...newItem[subKey], sub];
            newFilteredItems = this.rejectProp(
              filteredItems,
              (singleItem) => item[uniqueKey] !== singleItem[uniqueKey]
            );
            newFilteredItems.push(newItem);
            filteredItems = newFilteredItems;
          }
        });
      }
    });
    return filteredItems;
  };

  onSelectedItemsChange = (selectedItems) => {
    console.log(selectedItems, selectedItems.length);

    if (selectedItems.length >= this.maxItems) {
      if (selectedItems.length === this.maxItems) {
        this.setState({ selectedItems });
      }
      this.setState({
        maxItems: true,
      });
      return;
    }
    this.setState({
      maxItems: false,
    });

    const filteredItems = selectedItems.filter((val) => !this.state.selectedItems2.includes(val));
    this.setState({ selectedItems: filteredItems });
  };

  onSelectedItemsChange2 = (selectedItems) => {
    const filteredItems = selectedItems.filter((val) => !this.state.selectedItems.includes(val));
    this.setState({ selectedItems2: filteredItems });
  };

  onConfirm = () => {
    this.setState({ currentItems: this.state.selectedItems });
  };
  onCancel = () => {
    // this.SectionedMultiSelect._removeAllItems();

    this.setState({
      selectedItems: this.state.currentItems,
    });
    console.log(this.state.selectedItems);
  };
  onSelectedItemObjectsChange = (selectedItemObjects) => {
    // let id
    // selectedItemObjects.filter((item) => {
    //   console.log(item.children && item.id)
    //   if (item.children) {
    //     id = item.id
    //   }
    // })
    // console.log('parent', id)
    // const selected = this.state.selectedItems.filter(item => item !== id)

    this.setState({ selectedItemObjects });
    // this.setState(prevState => ({
    //   selectedItems: [...prevState.selectedItems.filter(item => item !== id)],
    // }))
    // this.onSelectedItemsChange(this.state.selectedItems)
    // console.log(selectedItemObjects)
  };

  onSwitchToggle = (k) => {
    const v = !this.state[k];
    this.setState({ [k]: v });
  };

  onToggleSwitch = (key, val) => this.setState({ [key]: val });

  fetchCategories = () => {
    this.setState({ hasErrored: false });
    fetch('http://www.mocky.io/v2/5a5573a22f00005c04beea49?mocky-delay=500ms', {
      headers: 'no-cache',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ cats: responseJson });
      })
      .catch((error) => {
        this.setState({ hasErrored: true });
        throw error.message;
      });
  };
  filterDuplicates = (items) =>
    items.sort().reduce((accumulator, current) => {
      const length = accumulator.length;
      if (length === 0 || accumulator[length - 1] !== current) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);

  noResults = (
    <View key="a" style={styles.center}>
      <Text>Sorry! No results...</Text>
    </View>
  );

  handleAddSearchTerm = (searchTerm, submit) => {
    const id = (this.termId += 1);
    if (
      searchTerm.length &&
      !(this.state.items || []).some((item) => item.title.includes(searchTerm))
    ) {
      const newItem = { id, title: searchTerm };
      this.setState((prevState) => ({
        items: [...(prevState.items || []), newItem],
      }));
      this.onSelectedItemsChange([...this.state.selectedItems, id]);
      submit();
    }
  };

  renderSelectText = ({ selectText, displayKey }) => {
    const { selectedItemObjects } = this.state;
    return selectedItemObjects && selectedItemObjects.length ? (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text>{selectedItemObjects[0][displayKey]}</Text>
        </View>
        <View style={{ flex: 0.2 }}>
          <Text style={{ flex: 1, fontSize: 10 }}>{selectText}</Text>
        </View>
      </View>
    ) : (
      selectText
    );
    // return selectedItemObjects.length
    //   ? `I like ${selectedItemObjects
    //       .map((item, i) => {
    //         let label = `${item.title}, `;
    //         if (i === selectedItemObjects.length - 2) label = `${item.title} and `;
    //         if (i === selectedItemObjects.length - 1) label = `${item.title}.`;
    //         return label;
    //       })
    //       .join('')}`
    //   : 'Select a fruit';
  };
  searchAdornment = (searchTerm, submit) =>
    searchTerm.length ? (
      <TouchableOpacity
        style={{ alignItems: 'center', justifyContent: 'center' }}
        onPress={() => this.handleAddSearchTerm(searchTerm, submit)}
      >
        <View>
          <Icon size={18} style={{ marginHorizontal: 15 }} name="add" />
        </View>
      </TouchableOpacity>
    ) : null;
  onToggleSelect = (toggled) => {
    console.log('select is ', toggled ? 'open' : 'closed');
  };
  customChipsRenderer = (props) => {
    console.log('props', props);
    return (
      <View style={{ backgroundColor: 'yellow', padding: 15 }}>
        <Text>Selected:</Text>
        {props.selectedItems.map((singleSelectedItem) => {
          const item = this.SectionedMultiSelect._findItem(singleSelectedItem);

          if (!item || !item[props.displayKey]) return null;
          if (item[props.subKey] && item[props.subKey].length) return null;
          return (
            <View
              key={item[props.uniqueKey]}
              style={{
                flex: 0,
                marginRight: 5,
                padding: 10,
                backgroundColor: 'orange',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.SectionedMultiSelect._removeItem(item);
                }}
              >
                <Text>{item[props.displayKey]}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  SelectOrRemoveAll = () => (
    <TouchableOpacity
      style={{
        justifyContent: 'center',
        height: 44,
        borderWidth: 0,
        paddingHorizontal: 10,
        backgroundColor: 'darkgrey',
        alignItems: 'center',
      }}
      onPress={this.SectionedMultiSelect._selectAllItems}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {this.state.selectedItems.length ? 'Remove' : 'Select'} all
      </Text>
    </TouchableOpacity>
  );

  getDisplayText = (item) => (item.title.en ? item.title.en : item.title);

  customChip = ({ text, onPress, id }) => (
    <View
      key={id}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#dadada',
        marginRight: 6,
      }}
    >
      <Text style={{ color: 'grey', fontWeight: 'bold' }}>{text}</Text>
      <TouchableOpacity style={{ marginLeft: 4 }} onPress={onPress}>
        <Icon name="close" color="grey" />
      </TouchableOpacity>
    </View>
  );

  render() {
    // const {
    //   selectedItems,
    //   _renderSearch: SearchBox,
    //   _renderModal: SmsModal,
    //   _renderControls: Controls,
    //   _ && renderItems.map(item => <View><Text>{item.title}</Text></View>): Items,
    //   _renderSelector: Selector,
    //   _renderChips: Chips,
    //   _renderHeader: Header,
    //   _selectAllItems,
    //   _removeAllItems,
    //   _toggleItem,
    //   _displaySelectedItems,
    //   subKey,
    //   displayKey,
    //   colors,
    // } = useSectionedMultiSelect({
    //   items: this.state.items,
    //   displayKey: 'title',
    //   uniqueKey: 'id',
    //   iconKey: 'icon',
    //   subKey: 'children',
    //   onSelectedItemsChange: this.onSelectedItemsChange,
    //   onSelectedItemObjectsChange: this.onSelectedItemObjectsChange,
    //   onCancel: this.onCancel,
    //   onConfirm: this.onConfirm,
    //   selectedItems: this.state.selectedItems,
    // });

    return (
      <View>
        <SectionedMultiSelect
          items={this.state.items}
          getItem={(item) => `item--${item.id}`}
          getChildren={(item) => item.children}
          getChildItem={(item) => `child--${item.id}`}
          uniqueKey="id"
          subKey="children"
          displayKey="title"
          iconKey="icon"
          // autoFocus
          // subDisplayKey={this.getDisplayText}
          // showCancelButton
          // headerComponent={this.SelectOrRemoveAll}
          stickyFooterComponent={
            <View style={{ padding: 15 }}>
              <Text style={{ textAlign: 'center' }}>Hi</Text>
            </View>
          }
          // hideConfirm
          loading={this.state.loading}
          // filterItems={this.filterItems}
          // alwaysShowSelectText
          // customChipsRenderer={this.customChipsRenderer}
          chipsPosition="top"
          chipComponent={this.customChip}
          searchAdornment={this.searchAdornment}
          renderSelectText={this.renderSelectText}
          // noResultsComponent={this.noResults}
          loadingComponent={
            <Loading hasErrored={this.state.hasErrored} fetchCategories={this.fetchCategories} />
          }
          selectedIconComponent={
            <Icon
              name="check"
              style={{
                fontSize: 16,
                color: 'black',
                // paddingHorizontal: 10,
              }}
            />
          }
          // chipRemoveIconComponent={
          //   <Icon
          //     style={{
          //       fontSize: 18,
          //       marginHorizontal: 6,
          //     }}
          //   >
          //     cancel
          //   </Icon>
          // }
          //  cancelIconComponent={<Text style={{color:'white'}}>Cancel</Text>}
          hideChipRemove={this.state.hideChipRemove}
          showDropDowns={this.state.showDropDowns}
          modalWithSafeAreaView={true}
          expandDropDowns={this.state.expandDropDowns}
          animateDropDowns={false}
          readOnlyHeadings={this.state.readOnlyHeadings}
          single={this.state.single}
          // showRemoveAll
          selectChildren={this.state.selectChildren}
          highlightChildren={this.state.highlightChildren}
          //  hideSearch
          //  itemFontFamily={fonts.boldCondensed}
          onSelectedItemsChange={this.onSelectedItemsChange}
          onSelectedItemObjectsChange={this.onSelectedItemObjectsChange}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          selectedItems={this.state.selectedItems}
          colors={{ primary: 'crimson' }}
          itemNumberOfLines={3}
          selectLabelNumberOfLines={3}
          parentChipsRemoveChildren={this.state.parentChipsRemoveChildren}
          styles={{
            // chipText: {
            //   maxWidth: Dimensions.get('screen').width - 90,
            // },
            // itemText: {
            //   color: this.state.selectedItems.length ? 'black' : 'lightgrey'
            // },
            scrollView: {
              paddingHorizontal: 0,
            },
            item: {
              paddingHorizontal: 20,
            },
            subItem: {
              paddingHorizontal: 10,
            },
            parentChipText: {
              fontWeight: 'bold',
            },
            removeAllChipContainer: {
              backgroundColor: 'grey',
            },
            removeAllChipText: {
              color: 'white',
            },
            selectToggle: {
              borderWidth: 1,
              borderRadius: 8,
              borderColor: 'silver',
              paddingHorizontal: 16,
              paddingVertical: 8,
              margin: 36,
            },
            selectedItem: {
              backgroundColor: '#f8f8f8',
            },

            selectedItemText: {
              color: 'black',
            },
            selectedSubItemText: {
              color: 'crimson',
            },
            // subItemText: {
            //   color: this.state.selectedItems.length ? 'black' : 'lightgrey'
            // },
            selectedSubItem: {
              backgroundColor: '#dadada',
            },
          }}
          cancelIconComponent={<Icon size={20} name="close" style={{ color: 'white' }} />}
        />
        <SectionedMultiSelect
          items={this.state.items}
          uniqueKey="id"
          subKey="children"
          displayKey="title"
          iconKey="icon"
          // autoFocus
          // subDisplayKey={this.getDisplayText}
          // showCancelButton
          // headerComponent={this.SelectOrRemoveAll}
          stickyFooterComponent={
            <View style={{ padding: 15 }}>
              <Text style={{ textAlign: 'center' }}>Hi</Text>
            </View>
          }
          // hideConfirm
          loading={this.state.loading}
          // filterItems={this.filterItems}
          // alwaysShowSelectText
          // customChipsRenderer={this.customChipsRenderer}
          chipsPosition="top"
          chipComponent={this.customChip}
          searchAdornment={this.searchAdornment}
          renderSelectText={this.renderSelectText}
          // noResultsComponent={this.noResults}
          loadingComponent={
            <Loading hasErrored={this.state.hasErrored} fetchCategories={this.fetchCategories} />
          }
          selectedIconComponent={
            <Icon
              name="check"
              style={{
                fontSize: 16,
                color: 'black',
                // paddingHorizontal: 10,
              }}
            />
          }
          // chipRemoveIconComponent={
          //   <Icon
          //     style={{
          //       fontSize: 18,
          //       marginHorizontal: 6,
          //     }}
          //   >
          //     cancel
          //   </Icon>
          // }
          //  cancelIconComponent={<Text style={{color:'white'}}>Cancel</Text>}
          hideChipRemove={this.state.hideChipRemove}
          showDropDowns={this.state.showDropDowns}
          modalWithSafeAreaView={true}
          expandDropDowns={this.state.expandDropDowns}
          animateDropDowns={false}
          readOnlyHeadings={this.state.readOnlyHeadings}
          single={this.state.single}
          // showRemoveAll
          selectChildren={this.state.selectChildren}
          highlightChildren={this.state.highlightChildren}
          //  hideSearch
          //  itemFontFamily={fonts.boldCondensed}
          onSelectedItemsChange={this.onSelectedItemsChange}
          onSelectedItemObjectsChange={this.onSelectedItemObjectsChange}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          selectedItems={this.state.selectedItems}
          colors={{ primary: 'crimson' }}
          itemNumberOfLines={3}
          selectLabelNumberOfLines={3}
          parentChipsRemoveChildren={this.state.parentChipsRemoveChildren}
          styles={{
            // chipText: {
            //   maxWidth: Dimensions.get('screen').width - 90,
            // },
            // itemText: {
            //   color: this.state.selectedItems.length ? 'black' : 'lightgrey'
            // },
            scrollView: {
              paddingHorizontal: 0,
            },
            item: {
              paddingHorizontal: 20,
            },
            subItem: {
              paddingHorizontal: 10,
            },
            parentChipText: {
              fontWeight: 'bold',
            },
            removeAllChipContainer: {
              backgroundColor: 'grey',
            },
            removeAllChipText: {
              color: 'white',
            },
            selectToggle: {
              borderWidth: 1,
              borderRadius: 8,
              borderColor: 'silver',
              paddingHorizontal: 16,
              paddingVertical: 8,
            },
            selectedItem: {
              backgroundColor: '#f8f8f8',
            },

            selectedItemText: {
              color: 'black',
            },
            selectedSubItemText: {
              color: 'crimson',
            },
            // subItemText: {
            //   color: this.state.selectedItems.length ? 'black' : 'lightgrey'
            // },
            selectedSubItem: {
              backgroundColor: '#dadada',
            },
          }}
          cancelIconComponent={<Icon size={20} name="close" style={{ color: 'white' }} />}
        >
          <SMSContext.Consumer>
            {({
              selectedItems,
              _renderSearch: SearchBox,
              SelectModal,
              _renderControls: Controls,
              Items,
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
              colors,
            }) => (
              <ScrollView
                keyboardShouldPersistTaps="always"
                style={{ backgroundColor: '#f8f8f8' }}
                contentContainerStyle={styles.container}
              >
                <Text style={styles.welcome}>React native sectioned multi select example.</Text>
                <React.Fragment>
                  <Chips />
                  <Modal {...getModalProps()}>
                    <SelectModal>
                      <React.Fragment>
                        <Header />
                        {/*   <SearchBox /> */}
                        <View
                          style={{
                            height: 50,
                            borderBottomWidth: 1,
                            borderBottomColor: 'lightgrey',
                          }}
                        >
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
                              paddingHorizontal: 10,
                            }}
                          >
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
                                backgroundColor: colors.primary,
                              }}
                              onPress={selectedItems.length ? _removeAllItems : _selectAllItems}
                            >
                              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                {selectedItems.length ? 'Remove' : 'Select'} all
                              </Text>
                            </TouchableOpacity>

                            <View style={{ flex: 1, flexDirection: 'row' }}>
                              {selectedItems.map((id) => {
                                const item = _findItem(id);

                                if (!item || !item[displayKey]) return null;
                                // if (item[subKey] && item[subKey].length) return null;
                                return (
                                  <this.customChip
                                    id={id}
                                    text={item[displayKey]}
                                    onPress={() => _toggleItem(item)}
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
                  </Modal>
                  <Selector />
                </React.Fragment>

                <View>
                  <View style={styles.border}>
                    <Text style={styles.heading}>Settings</Text>
                  </View>
                  <Toggle
                    name="Single"
                    onPress={() => this.onSwitchToggle('single')}
                    val={this.state.single}
                  />
                  <Toggle
                    name="Read only headings"
                    onPress={() => this.onSwitchToggle('readOnlyHeadings')}
                    val={this.state.readOnlyHeadings}
                  />
                  <Toggle
                    name="Expand dropdowns"
                    onPress={() => this.onSwitchToggle('expandDropDowns')}
                    val={this.state.expandDropDowns}
                    disabled={!this.state.showDropDowns}
                  />
                  <Toggle
                    name="Show dropdown toggles"
                    onPress={() => this.onSwitchToggle('showDropDowns')}
                    val={this.state.showDropDowns}
                  />
                  <Toggle
                    name="Auto-highlight children"
                    onPress={() => this.onSwitchToggle('highlightChildren')}
                    val={this.state.highlightChildren}
                    disabled={this.state.selectChildren}
                  />
                  <Toggle
                    name="Auto-select children"
                    onPress={() => this.onSwitchToggle('selectChildren')}
                    disabled={this.state.highlightChildren}
                    val={this.state.selectChildren}
                  />
                  <Toggle
                    name="Hide Chip Remove Buttons"
                    onPress={() => this.onSwitchToggle('hideChipRemove')}
                    val={this.state.hideChipRemove}
                  />
                  <TouchableWithoutFeedback onPress={() => console.log('remove all items')}>
                    <View style={styles.switch}>
                      <Text style={styles.label}>Remove All</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </ScrollView>
            )}
          </SMSContext.Consumer>
        </SectionedMultiSelect>
      </View>
    );
  }
}

export default App;
