import { View, TextInput } from 'react-native';
import { callIfFunction } from '../helpers';
import useSMSContext from '../useSMSContext';
const Search = () => {
  const { hideSearch, searchIconComponent, searchPlaceholderText, searchTextFont, Icon, searchAdornment, autoFocus, searchTerm, setSearchTerm, _submitSelection, iconNames, colors, styles, } = useSMSContext();
  return !hideSearch ? (<View style={[{ flexDirection: 'row', paddingVertical: 5 }, styles.searchBar]}>
    <View style={styles.center}>
      {callIfFunction(searchIconComponent) || (<Icon name={iconNames.search} size={18} style={{ marginHorizontal: 15 }} />)}
    </View>
    <TextInput value={searchTerm} selectionColor={colors.searchSelectionColor} onChangeText={searchTerm => setSearchTerm(searchTerm)} placeholder={searchPlaceholderText} autoFocus={autoFocus} selectTextOnFocus placeholderTextColor={colors.searchPlaceholderTextColor} underlineColorAndroid="transparent" style={[
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