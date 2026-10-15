import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS, load } from '../../utils/storage.js';
import {
  createId,
  createSalt,
  hashPassword,
  readUsers,
  toPublicUser,
  writeUsers,
} from '../../services/userStore.js';

// Frontend-only authentication simulation (see services/userStore.js).

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    if (users.some((u) => u.email === normalizedEmail)) {
      return rejectWithValue('An account with this email already exists. Try logging in instead.');
    }
    const salt = createSalt();
    const user = {
      id: createId(),
      name: name.trim(),
      email: normalizedEmail,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    writeUsers([...users, user]);
    return toPublicUser(user);
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = readUsers().find((u) => u.email === normalizedEmail);
    const hash = user ? await hashPassword(password, user.salt) : null;
    if (!user || hash !== user.passwordHash) {
      return rejectWithValue('Incorrect email or password.');
    }
    return toPublicUser(user);
  },
);

const initialState = {
  // Restored from localStorage so a page refresh keeps the user logged in.
  user: load(STORAGE_KEYS.session, null),
  status: 'idle', // 'idle' | 'loading'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    [registerUser, loginUser].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'idle';
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'idle';
          state.error = action.payload || 'Something went wrong. Please try again.';
        });
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
