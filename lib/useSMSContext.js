import * as React from 'react'
import SMSContext from './SMSContext';

export default function useSMSContext() { 
  return React.useContext(SMSContext) 
};
