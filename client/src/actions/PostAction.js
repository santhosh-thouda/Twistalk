import * as PostApi from '../api/PostRequest';

export const getTimelinePosts = (id) => async (dispatch) => {

    dispatch({ type: "RETRIEVING_START" });

    try {
        const { data } = await PostApi.getTimelinePosts(id);
        dispatch({ type: "RETRIEVING_SUCCESS", data: data });
    } catch (error) {
        let privacyError = null;
        if (error.response && error.response.data && error.response.data.error) {
            privacyError = error.response.data.error;
        }
        dispatch({ type: "RETRIEVING_FAIL", error: privacyError });
    }
}