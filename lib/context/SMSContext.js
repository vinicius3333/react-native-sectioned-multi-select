import * as React from 'react'
import { SMSDefaultProps, defaultColors, defaultStyles } from '../sectioned-multi-select';
const SMSContext = React.createContext({
  ...SMSDefaultProps,
  colors: defaultColors,
  styles: defaultStyles,
});
export default SMSContext

export const Provider = SMSContext.Provider;