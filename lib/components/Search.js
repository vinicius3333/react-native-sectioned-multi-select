import * as React from 'react'
import { View, TextInput } from 'react-native';
import { callIfFunction } from '../helpers';
import useSMSContext from '../context/useSMSContext';
const Search = () => {
  const { hideSearch, components, searchIconComponent, searchPlaceholderText, searchTextFont, Icon, searchAdornment, autoFocus, searchTerm, setSearchTerm, _submitSelection, iconNames, colors, styles, } = useSMSContext();
  return !hideSearch ? (<View style={[{ flexDirection: 'row', paddingVertical: 5 }, styles.searchBar]}>
    <View style={styles.center}>
      {components.SearchIcon}
    </View>
    <TextInput value={searchTerm} selectionColor={colors.searchSelection} onChangeText={searchTerm => setSearchTerm(searchTerm)} placeholder={searchPlaceholderText} autoFocus={autoFocus} selectTextOnFocus placeholderTextColor={colors.searchPlaceholderText} underlineColorAndroid="transparent" style={[
      {
        flex: 1,
        fontSize: 17,
        paddingVertical: 8,
      },
      searchTextFont,
      styles.searchTextInput,
    ]} />
    {searchAdornment && searchAdornment(searchTerm, _submitSelection)}
  </View>) : null;
};

export default Search