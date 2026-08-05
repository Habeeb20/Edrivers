// /* eslint-disable no-unused-vars */

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';


// const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// // Async Thunk: Signup
// export const signupAsync = createAsyncThunk(
//   'user/signupAsync',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${API_BASE}/api/users/register`, formData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Signup failed');
//     }
//   }
// );

// // Async Thunk: Login
// export const loginAsync = createAsyncThunk(
//   'user/loginAsync',
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${API_BASE}/api/users/login`, credentials);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Login failed');
//     }
//   }
// );
// export const authloginAsync = createAsyncThunk(
//   'user/authloginAsync',
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${API_BASE}/api/users/authlogin`, credentials);
//       return response.data;
//     } catch (error) {
//       console.log(error)
//       return rejectWithValue(error.response?.data?.message || 'Login failed');
//     }
//   }
// );

// // ── e-Auth (OTP) login: step 1 — request a code ─────────────────
//   const requestEAuthOtp = async (email) => {
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await axios.post(`${API_BASE_URL}/auth/e-auth/request`, {
//         email: email.trim().toLowerCase(),
//       });

//       return { success: true, message: res.data?.message };
//     } catch (err) {
//       const message = err.response?.data?.message || err.message || 'Failed to send code';
//       setError(message);
//       return { success: false, message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── e-Auth (OTP) login: step 2 — verify the code ────────────────
//   const verifyEAuthOtp = async (email, code) => {
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await axios.post(`${API_BASE_URL}/auth/e-auth/verify`, {
//         email: email.trim().toLowerCase(),
//         code,
//       });

//       const userData = res.data.user || res.data.data || res.data;
//       const { token: newToken } = res.data;

//       if (!newToken) throw new Error('No token received');

//       persistSession(newToken, userData);

//       return { success: true, user: userData };
//     } catch (err) {
//       const message = err.response?.data?.message || err.message || 'Invalid code';
//       setError(message);
//       return { success: false, message };
//     } finally {
//       setLoading(false);
//     }
//   };

// // Async Thunk: Get Dashboard (Full User Details & Stats)
// export const getDashboardAsync = createAsyncThunk(
//   'user/getDashboardAsync',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const token = getState().user.token;
//       const response = await axios.get(`${API_BASE}/api/users/dashboard`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return response.data.data;  // { user, stats }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
//     }
//   }
// );

// // Async Thunk: Update Profile
// export const updateProfileAsync = createAsyncThunk(
//   'user/updateProfileAsync',
//   async (updates, { getState, rejectWithValue }) => {
//     try {
//       const token = getState().user.token || localStorage.getItem("token");
//       console.log(token)
//       const response = await axios.put(`${API_BASE}/api/users/profile`, updates, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return response.data.user;  // Updated user
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Update failed');
//     }
//   }
// );

// // Async Thunk: Change Password
// export const changePasswordAsync = createAsyncThunk(
//   'user/changePasswordAsync',
//   async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
//     try {
//       const token = getState().user.token;
//       const response = await axios.post(`${API_BASE}/api/users/change-password`, { currentPassword, newPassword }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return response.data;  // { message }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Password change failed');
//     }
//   }
// );

// // Async Thunk: Change Email (Send Verification)
// export const changeEmailAsync = createAsyncThunk(
//   'user/changeEmailAsync',
//   async ({ newEmail, password }, { getState, rejectWithValue }) => {
//     try {
//       const token = getState().user.token;
//       const response = await axios.post(`${API_BASE}/api/users/change-email`, { newEmail, password }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return response.data;  // { message }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Email change failed');
//     }
//   }
// );

// // Async Thunk: Confirm Email Change
// export const confirmEmailChangeAsync = createAsyncThunk(
//   'user/confirmEmailChangeAsync',
//   async (token, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/api/users/verify-email-change/${token}`);
//       return response.data;  // { message, user? }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Confirmation failed');
//     }
//   }
// );

// // Async Thunk: Delete Account
// export const deleteAccountAsync = createAsyncThunk(
//   'user/deleteAccountAsync',
//   async (password, { getState, rejectWithValue }) => {
//     try {
//       const token = getState().user.token;
//       const response = await axios.delete(`${API_BASE}/api/users/delete-account`, {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { password },
//       });
//       return response.data;  // { message }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Delete failed');
//     }
//   }
// );

// // Initial State
// const initialState = {
//   user: JSON.parse(localStorage.getItem('user')) || null,
//   token: localStorage.getItem('token') || null,
//   loading: false,
//   error: null,
//   successMessage: null,
//   stats: null,  // For dashboard stats
// };

// // Create Slice
// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//       state.successMessage = null;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.stats = null;
//       state.successMessage = null;
//       state.error = null;
//       localStorage.clear();
//     },
//   },
//   extraReducers: (builder) => {
//     // Signup
//     builder
//       .addCase(signupAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(signupAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.successMessage = action.payload.message || 'Account created successfully';
//         localStorage.setItem('token', state.token);
//         localStorage.setItem('user', JSON.stringify(state.user));
//       })
//       .addCase(signupAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Signup failed';
//       });

//     // Login
//     builder
//       .addCase(loginAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         localStorage.setItem('token', state.token);
//         localStorage.setItem('user', JSON.stringify(state.user));
//       })
//       .addCase(loginAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Login failed';
//       });
//     // authLogin
//     builder
//       .addCase(authloginAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(authloginAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         localStorage.setItem('token', state.token);
//         localStorage.setItem('user', JSON.stringify(state.user));
//       })
//       .addCase(authloginAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Login failed';
//       });

//     // Get Dashboard
//     builder
//       .addCase(getDashboardAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getDashboardAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = { ...state.user, ...action.payload.user };
//         state.stats = action.payload.stats;
//         localStorage.setItem('user', JSON.stringify(state.user));
//       })
//       .addCase(getDashboardAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     // Update Profile
//     builder
//       .addCase(updateProfileAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateProfileAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;  // Updated user
//         state.successMessage = 'Profile updated';
//         localStorage.setItem('user', JSON.stringify(state.user));
//       })
//       .addCase(updateProfileAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     // Change Password
//     builder
//       .addCase(changePasswordAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(changePasswordAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.successMessage = action.payload.message;
//       })
//       .addCase(changePasswordAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     // Change Email
//     builder
//       .addCase(changeEmailAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(changeEmailAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.successMessage = action.payload.message;
//       })
//       .addCase(changeEmailAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     // Confirm Email Change
//     builder
//       .addCase(confirmEmailChangeAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(confirmEmailChangeAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user || state.user;  // Update if returned
//         state.successMessage = action.payload.message;
//       })
//       .addCase(confirmEmailChangeAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     // Delete Account
//     builder
//       .addCase(deleteAccountAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteAccountAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.successMessage = action.payload.message;
//         state.user = null;
//         state.token = null;
//         localStorage.clear();
//       })
//       .addCase(deleteAccountAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearError, logout } = userSlice.actions;
// export default userSlice.reducer;


/* eslint-disable no-unused-vars */



import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Async Thunk: Signup
export const signupAsync = createAsyncThunk(
  'user/signupAsync',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/users/register`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

// Async Thunk: Login
export const loginAsync = createAsyncThunk(
  'user/loginAsync',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/users/login`, credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async Thunk: Auth Login
export const authloginAsync = createAsyncThunk(
  'user/authloginAsync',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/users/authlogin`, credentials);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// ── e-Auth (OTP) Step 1: Request Code ─────────────────────────────────────────
export const requestEAuthOtpAsync = createAsyncThunk(
  'user/requestEAuthOtpAsync',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/users/e-auth/request`, {
        email: email.trim().toLowerCase(),
      });
      return response.data; // Expected: { message }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send code'
      );
    }
  }
);

// ── e-Auth (OTP) Step 2: Verify Code ──────────────────────────────────────────
export const verifyEAuthOtpAsync = createAsyncThunk(
  'user/verifyEAuthOtpAsync',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/users/e-auth/verify`, {
        email: email.trim().toLowerCase(),
        code,
      });

      const userData = response.data.user || response.data.data || response.data;
      const newToken = response.data.token;

      if (!newToken) {
        throw new Error('No token received');
      }

      return { user: userData, token: newToken };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Invalid code'
      );
    }
  }
);

// Async Thunk: Get Dashboard (Full User Details & Stats)
export const getDashboardAsync = createAsyncThunk(
  'user/getDashboardAsync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      const response = await axios.get(`${API_BASE}/api/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data; // { user, stats }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
    }
  }
);

// Async Thunk: Update Profile
export const updateProfileAsync = createAsyncThunk(
  'user/updateProfileAsync',
  async (updates, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token || localStorage.getItem('token');
      const response = await axios.put(`${API_BASE}/api/users/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user; // Updated user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// Async Thunk: Change Password
export const changePasswordAsync = createAsyncThunk(
  'user/changePasswordAsync',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      const response = await axios.post(
        `${API_BASE}/api/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

// Async Thunk: Change Email (Send Verification)
export const changeEmailAsync = createAsyncThunk(
  'user/changeEmailAsync',
  async ({ newEmail, password }, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      const response = await axios.post(
        `${API_BASE}/api/users/change-email`,
        { newEmail, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email change failed');
    }
  }
);

// Async Thunk: Confirm Email Change
export const confirmEmailChangeAsync = createAsyncThunk(
  'user/confirmEmailChangeAsync',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/api/users/verify-email-change/${token}`);
      return response.data; // { message, user? }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Confirmation failed');
    }
  }
);

// Async Thunk: Delete Account
export const deleteAccountAsync = createAsyncThunk(
  'user/deleteAccountAsync',
  async (password, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      const response = await axios.delete(`${API_BASE}/api/users/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });
      return response.data; // { message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

// Initial State
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  successMessage: null,
  stats: null,
};

// Create Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.stats = null;
      state.successMessage = null;
      state.error = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = action.payload.message || 'Account created successfully';
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      })

      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })

      // Auth Login
      .addCase(authloginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authloginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(authloginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })

      // Request E-Auth OTP
      .addCase(requestEAuthOtpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEAuthOtpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Verification code sent';
      })
      .addCase(requestEAuthOtpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send code';
      })

      // Verify E-Auth OTP
      .addCase(verifyEAuthOtpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEAuthOtpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = 'Login successful';
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(verifyEAuthOtpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Invalid code';
      })

      // Get Dashboard
      .addCase(getDashboardAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.user };
        state.stats = action.payload.stats;
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(getDashboardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Profile updated';
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change Password
      .addCase(changePasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change Email
      .addCase(changeEmailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeEmailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(changeEmailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Confirm Email Change
      .addCase(confirmEmailChangeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmEmailChangeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || state.user;
        state.successMessage = action.payload.message;
      })
      .addCase(confirmEmailChangeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Account
      .addCase(deleteAccountAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAccountAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.user = null;
        state.token = null;
        localStorage.clear();
      })
      .addCase(deleteAccountAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, logout } = userSlice.actions;
export default userSlice.reducer;