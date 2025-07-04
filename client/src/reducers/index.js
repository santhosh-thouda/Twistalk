import { combineReducers } from "redux";

import authReducer from "./authReducer.js";
import postReducer from "./postReducer.js";
import messageReducer from "./messageReducer.js";

export const reducers = combineReducers({ authReducer, postReducer, messageReducer })