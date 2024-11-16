// Reducer to manage network status
const initialState = {
    isConnected: true, // Assuming initially connected
};

const networkReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INTERNET_CONNECTION_AVAILABLE':
            return {
                ...state,
                isConnected: true,
            };
        case 'NO_INTERNET_CONNECTION':
            return {
                ...state,
                isConnected: false,
            };
        default:
            return state;
    }
};

export default networkReducer;
