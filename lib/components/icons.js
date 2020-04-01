import * as React from 'react'
const defaultSize  = 22;
const icons = ({
  iconNames,
  colors,
  styles,
  iconRenderer
}) => {

  const Icon = iconRenderer;
  return {
    SelectToggleIcon: <Icon size={defaultSize} name={iconNames.arrowDown} color={colors.selectToggleTextColor}/>,
    CancelIcon: <Icon size={defaultSize} color={colors.light} name={iconNames.cancel} />,
    SearchIcon: <Icon size={defaultSize} name={iconNames.search} color={colors.searchIcon} style={{ marginHorizontal: 15, }} />,
    SelectedIcon: <Icon size={defaultSize} name={iconNames.checkMark} style={{fontSize: 16, color: colors.success, paddingLeft: 10, ...styles.selectedIcon}} />, // highlightChild ? colors.disabled : colors.success,
    UnselectedIcon: null,
    // DropDownToggleIconUp: ,
    // DropDownToggleIconDown: ,
    // ChipRemoveIcon: ,
  }
}

export default icons;