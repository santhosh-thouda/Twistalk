const messageReducer = (
    state = { 
        conversations: [], 
        currentMessages: [], 
        loading: false, 
        error: false,
        searchResults: [],
        onlineUsers: [],
        currentConversation: null
    },
    action
) => {
    switch (action.type) {
        case "SEND_MESSAGE_START":
            return { ...state, loading: true, error: false };
        case "SEND_MESSAGE_SUCCESS":
            return { 
                ...state, 
                loading: false, 
                error: false,
                currentMessages: [...state.currentMessages, action.data]
            };
        case "SEND_MESSAGE_FAIL":
            return { ...state, loading: false, error: true };

        case "GET_CONVERSATIONS_START":
            return { ...state, loading: true, error: false };
        case "GET_CONVERSATIONS_SUCCESS":
            return { 
                ...state, 
                conversations: action.data, 
                loading: false, 
                error: false 
            };
        case "GET_CONVERSATIONS_FAIL":
            return { ...state, loading: false, error: true };

        case "GET_MESSAGES_START":
            return { ...state, loading: true, error: false };
        case "GET_MESSAGES_SUCCESS":
            return { 
                ...state, 
                currentMessages: action.data, 
                currentConversation: action.conversationId,
                loading: false, 
                error: false 
            };
        case "GET_MESSAGES_FAIL":
            return { ...state, loading: false, error: true };

        case "MARK_AS_READ":
            return {
                ...state,
                currentMessages: state.currentMessages.map(msg =>
                    msg._id === action.messageId 
                        ? { ...msg, status: "read" }
                        : msg
                )
            };

        case "ADD_REACTION":
            return {
                ...state,
                currentMessages: state.currentMessages.map(msg =>
                    msg._id === action.data._id ? action.data : msg
                )
            };

        case "REMOVE_REACTION":
            return {
                ...state,
                currentMessages: state.currentMessages.map(msg =>
                    msg._id === action.data._id ? action.data : msg
                )
            };

        case "DELETE_MESSAGE":
            return {
                ...state,
                currentMessages: state.currentMessages.filter(msg =>
                    msg._id !== action.messageId
                )
            };

        case "SEARCH_MESSAGES_START":
            return { ...state, loading: true, error: false };
        case "SEARCH_MESSAGES_SUCCESS":
            return { 
                ...state, 
                searchResults: action.data, 
                loading: false, 
                error: false 
            };
        case "SEARCH_MESSAGES_FAIL":
            return { ...state, loading: false, error: true };

        case "GET_ONLINE_USERS":
            return { ...state, onlineUsers: action.data };

        case "ADD_NEW_MESSAGE":
            return {
                ...state,
                currentMessages: [...state.currentMessages, action.data]
            };

        case "UPDATE_CONVERSATION":
            return {
                ...state,
                conversations: state.conversations.map(conv =>
                    conv._id === action.data._id ? action.data : conv
                )
            };

        case "CLEAR_MESSAGES":
            return {
                ...state,
                currentMessages: [],
                currentConversation: null
            };

        default:
            return state;
    }
};

export default messageReducer; 