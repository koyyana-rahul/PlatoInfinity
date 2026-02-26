import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessionToken: localStorage.getItem("plato_session_token") || null,
  tableId: localStorage.getItem("plato_table_id") || null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionToken: (state, action) => {
      state.sessionToken = action.payload;
      if (action.payload) {
        localStorage.setItem("plato_session_token", action.payload);
      } else {
        localStorage.removeItem("plato_session_token");
      }
    },
    setTableId: (state, action) => {
      state.tableId = action.payload;
      if (action.payload) {
        localStorage.setItem("plato_table_id", action.payload);
      } else {
        localStorage.removeItem("plato_table_id");
      }
    },
    clearSession: (state) => {
      state.sessionToken = null;
      state.tableId = null;
      localStorage.removeItem("plato_session_token");
      localStorage.removeItem("plato_table_id");
    },
  },
});

export const { setSessionToken, setTableId, clearSession } =
  sessionSlice.actions;
export default sessionSlice.reducer;
