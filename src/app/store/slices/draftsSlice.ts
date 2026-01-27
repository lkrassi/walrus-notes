import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type DraftsState = Record<string, string>;

const initialState: DraftsState = {};

const drafts = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    setDraft: (
      state,
      action: PayloadAction<{ noteId: string; text: string }>
    ) => {
      const { noteId, text } = action.payload;
      state[noteId] = text;
    },
    removeDraft: (state, action: PayloadAction<{ noteId: string }>) => {
      const { noteId } = action.payload;
      delete state[noteId];
    },
    clearDrafts: () => initialState,
  },
});

export const { setDraft, removeDraft, clearDrafts } = drafts.actions;

export const draftsReducer = drafts.reducer;
