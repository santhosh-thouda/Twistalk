const initialState = {
  users: []
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ALL_USERS':
      return { ...state, users: action.data };
    default:
      return state;
  }
};

export default userReducer; 