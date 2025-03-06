import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { NODE_API_ENDPOINT } from "../utils/utils";

export const retriveAuth = createAsyncThunk("auth/retriveAuth", async () => {
  const storedAuth = localStorage.getItem("care360");
  if (storedAuth) {
    const parsedUser = await JSON.parse(storedAuth);
    const props = await fetch(`${NODE_API_ENDPOINT}/auth/verify`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${parsedUser.token}`,
      },
    });

    if (!props.ok) {
      return null;
    }

    const user = await props.json();
    return { user };
  }
});

const authSlice = createSlice({
  name: "authSlice",
  initialState: {
    user: "",
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("care360", JSON.stringify(state.user));
    },
    logout: (state, action) => {
      state.user = "";
      localStorage.removeItem("care360");
      console.log("User Logged Out");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(retriveAuth.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(retriveAuth.fulfilled, (state, action) => {
      if (action.payload && action.payload.user) {
        state.props = action.payload.props;
        state.user = action.payload.user;
      }
      state.status = "succeeded";
    });
    builder.addCase(retriveAuth.rejected, (state) => {
      state.status = "failed";
    });
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
