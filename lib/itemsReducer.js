export default function itemsReducer(state, action) {
  console.log('reducer prev state', state);
  switch (action.type) {
    case 'add':
      return [...state, action.item];
    case 'add-single':
      return [action.item];
    case 'remove':
      return [...state.filter(item => item !== action.item)];
    case 'replace-items':
      return [...action.items];
    case 'add-items':
      return [...state, ...action.items];
    case 'remove-items':
      return [...state.filter(item => !action.items.includes(item))];
    case 'remove-all':
      return [];
    default:
      return state;
  }
};
