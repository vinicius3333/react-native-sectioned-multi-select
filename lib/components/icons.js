import * as React from 'react'

const defaultSize = 22
const icons = ({ iconNames, colors, styles, iconRenderer }) => {
  const Icon = iconRenderer
  return {
    SelectToggleIcon: () => (
      <Icon
        name={iconNames.arrowDown}
        size={defaultSize}
        color={colors.selectToggleTextColor}
      />
    ),
    SelectToggleOpenIcon: () => (
      <Icon
        name={iconNames.arrowUp}
        size={defaultSize}
        color={colors.selectToggleTextColor}
      />
    ),
    CancelIcon: () => (
      <Icon name={iconNames.cancel} size={defaultSize} color={colors.light} />
    ),
    SearchIcon: () => (
      <Icon
        name={iconNames.search}
        size={defaultSize}
        color={colors.searchIcon}
        style={{ marginHorizontal: 15 }}
      />
    ),
    SelectedIcon: ({ highlighted }) => <Icon name={iconNames.checkMark} size={defaultSize} style={{ fontSize: 16, color: highlighted ? colors.disabled : colors.success, paddingLeft: 10, ...styles.selectedIcon, ...(highlighted && styles.highlightedIcon) 
}} />, // highlightChild ? colors.disabled : colors.success,
    UnselectedIcon: () => null,
    DropDownToggleIconUp: () => (
      <Icon
        name={iconNames.arrowUp}
      size={22}
        style={{
          color: colors.primary,
        }}
    />
    ),
    DropDownToggleIconDown: () => (
      <Icon
        name={iconNames.arrowDown}
        size={22}
      style={{
          color: colors.primary,
        }}
    />
    ),
    ChipRemoveIcon: ({ style }) => (<Icon name={iconNames.close} style={[
      {
        color: colors.chip,
        fontSize: 16,
        marginHorizontal: 6,
        marginVertical: 7,
      },
      styles.chipIcon,
      style,
      
    ]} />),
  }
}

export default icons