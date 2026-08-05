// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';  // localStorage
import userReducer from './slices/userSlice';  // Your user slice
import adminReducer from "./slices/adminSlice"
// Persistence config (saves token/user to localStorage)
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', "admin"],  // Only persist user slice (token/user)
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Configure Store
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,  
      admin: adminReducer,   
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persistor for <PersistGate>
export const persistor = persistStore(store);







