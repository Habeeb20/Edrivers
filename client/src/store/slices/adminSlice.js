// src/store/slices/adminSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Async Thunk: Admin Login (superadmin role)
export const loginAdminAsync = createAsyncThunk(
  'admin/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/login`, {
        email,
        password,
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Login failed');
      }

      const { token, user } = response.data;

      // Store token in localStorage for persistence
      localStorage.setItem('adminToken', token);

      return {
        admin: user,
        token,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to connect to server';
      return rejectWithValue(message);
    }
  }
);

// Optional: Fetch Admin Dashboard Stats
export const getAdminDashboardAsync = createAsyncThunk(
  'admin/getDashboard',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().admin;

      const response = await axios.get(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data.stats;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load dashboard';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken') || null,
  loading: false,
  error: null,
  stats: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      state.admin = null;
      state.token = null;
      state.stats = null;
      localStorage.removeItem('adminToken');
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
      })
      .addCase(loginAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Dashboard Stats
      .addCase(getAdminDashboardAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminDashboardAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getAdminDashboardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutAdmin, clearAdminError } = adminSlice.actions;

export default adminSlice.reducer;