import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type LoaderState = {
  isLoading: boolean;
  loadingKeys: Record<string, boolean>;
};

const initialState: LoaderState = {
  isLoading: false,
  loadingKeys: {},
};

export const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    startLoading: state => {
      state.isLoading = true;
    },
    stopLoading: state => {
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    startLoadingByKey: (state, action: PayloadAction<string>) => {
      state.loadingKeys[action.payload] = true;
      state.isLoading = true;
    },
    stopLoadingByKey: (state, action: PayloadAction<string>) => {
      state.loadingKeys[action.payload] = false;
      state.isLoading = Object.values(state.loadingKeys).some(
        loading => loading
      );
    },
    setLoadingByKey: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      const { key, loading } = action.payload;
      state.loadingKeys[key] = loading;
      state.isLoading = Object.values(state.loadingKeys).some(
        isLoading => isLoading
      );
    },
  },
});

export const {
  startLoading,
  stopLoading,
  setLoading,
  startLoadingByKey,
  stopLoadingByKey,
  setLoadingByKey,
} = loaderSlice.actions;

export default loaderSlice.reducer;
