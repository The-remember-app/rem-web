import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {UserDTO} from "../mappers/user-dto.mapper";


interface UserState {
    currentUser:  UserDTO | null;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    currentUser: null,
    isAuthenticated: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserDTO>) => {
            state.currentUser = action.payload;
            state.isAuthenticated = Boolean(action.payload && action.payload.active);
        },
        clearUser: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export const userReducer = userSlice.reducer;

//
// interface UserState {
//     currentUser: UserDTO | null;
//     isAuthenticated: boolean;
// }

// const initialState: UserState = {
//     currentUser: null,
//     isAuthenticated: false,
// };

// export const userSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         setUser: (state, action: PayloadAction<UserDTO | null>) => {
//             state.currentUser = action.payload;
//             // Если DTO существует и пользователь активен — флаг true
//             state.isAuthenticated = Boolean(action.payload && action.payload.active);
//         },
//     },
// });
//
// export const { setUser } = userSlice.actions;