import { createSlice } from "@reduxjs/toolkit"

interface UserState {
  username: string,
  email: string,
  id: string,
  role: string,
  phoneNumber: string,
  // notifications: {
  //   data: [],
  //   page: number,
  //   totalPages: number,
  //   total: number,
  // },
}

const initialState: UserState = {
  username: '',
  email: '',
  id: '',
  role: '',
  phoneNumber: '',
  // notifications: {
  //   data: [],
  //   page: 1,
  //   totalPages: 0,
  //   total: 0,
  // },
}

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    setUserData: (state, {payload}) => {
      payload.username ? state.username = payload.username : null
      payload.email ? state.email = payload.email : null
      payload.id ? state.id = payload.id : null
      payload.role ? state.role = payload.role : null
      payload.phoneNumber ? state.phoneNumber = payload.phoneNumber : null
      // payload.notifications ? state.notifications = payload.notifications : null
    }
  }
})

export const userActions = userSlice.actions;
export default userSlice.reducer;