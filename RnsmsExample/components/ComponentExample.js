import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

class ComponentExample extends React.Component {
  render() {
    return (
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
      />
    );
  }
}

export default ComponentExample;
