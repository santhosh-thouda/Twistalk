import * as AuthApi from '../api/AuthRequest.js';

export const logIn = (formData) => async (dispatch) => {

    dispatch({ type: 'AUTH_START' })
    try {
        const { data } = await AuthApi.logIn(formData);
        dispatch({ type: 'AUTH_SUCCESS', data: data })
    } catch (error) {
        console.log('Login Error:', error);
        console.log('Error Response:', error.response?.data);
        dispatch({ type: 'AUTH_FAIL' })
    }
}



export const signUp = (formData) => async (dispatch) => {

    dispatch({ type: 'AUTH_START' })
    try {
        const { data } = await AuthApi.signUp(formData);
        dispatch({ type: 'AUTH_SUCCESS', data: data })
    } catch (error) {
        console.log('Signup Error:', error);
        console.log('Error Response:', error.response?.data);
        console.log('Error Status:', error.response?.status);
        dispatch({ type: 'AUTH_FAIL' })
    }
}


export const logOut = () => async (dispatch) => {
    dispatch({ type: "LOG_OUT" })
}