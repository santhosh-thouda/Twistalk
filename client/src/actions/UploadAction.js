import * as UploadApi from '../api/UploadRequest'

export const uploadImage = (data) => async (dispatch) => {
    try {
        const res = await UploadApi.uploadImage(data);
        return res.data;
    } catch (error) {
        console.log(error)
    }
}


export const uploadPost = (data) => async (dispatch) => {
    dispatch({ type: 'UPLOAD_START' })
    try {
        const newPost = await UploadApi.uploadPost(data)
        dispatch({ type: 'UPLOAD_SUCCESS', data: newPost.data })
    } catch (error) {
        console.log(error)
        dispatch({ type: 'UPLOAD_FAIL' })
    }
}