import * as React from 'react'
import { View, TextInput } from 'react-native'
import { callIfFunction } from '../helpers'
import useSMSContext from '../context/useSMSContext'

const Search = ({searchAdornment: searchAdornmentFromProps}) => {
  const {
    hideSearch,
    components,
    searchPlaceholderText,
    searchTextFont,
    searchAdornment,
    autoFocus,
    searchTerm,
    setSearchTerm,
    _submitSelection,
    colors,
    styles,
  } = useSMSContext()
  const adornment = searchAdornmentFromProps ? searchAdornmentFromProps : searchAdornment
  return !hideSearch ? (
    <View
      style={[{ flexDirection: 'row', paddingVertical: 5 }, styles.searchBar]}
    >
      <View style={styles.center}>
        <components.SearchIcon />
      </View>
      <TextInput
        clearButtonMode="while-editing"
        value={searchTerm}
        selectionColor={colors.searchSelection}
        onChangeText={searchTerm => setSearchTerm(searchTerm)}
        placeholder={searchPlaceholderText}
        autoFocus={autoFocus}
        selectTextOnFocus
        placeholderTextColor={colors.searchPlaceholderText}
        underlineColorAndroid="transparent"
        style={[
          {
            flex: 1,
            fontSize: 17,
            paddingVertical: 8,
          },
          searchTextFont,
          styles.searchTextInput,
        ]}
      />
      {adornment &&
        adornment(searchTerm, setSearchTerm, _submitSelection)}
    </View>
  ) : null
}

export default Search
