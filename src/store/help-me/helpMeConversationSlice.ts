import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation } from '@/types';

export interface HelpMeConversationState {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  isAllConversationsFetched: boolean;
}

const initialState: HelpMeConversationState = {
  conversations: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  isAllConversationsFetched: false,
};

const helpMeConversationSlice = createSlice({
  name: 'helpMeConversations',
  initialState,
  reducers: {
    setHelpMeConversationsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setHelpMeConversationsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setHelpMeConversations: (
      state,
      action: PayloadAction<{ conversations: Conversation[]; page: number }>,
    ) => {
      const { conversations, page } = action.payload;
      if (page === 1) {
        state.conversations = conversations;
      } else {
        state.conversations = [...state.conversations, ...conversations];
      }
      state.currentPage = page;
      state.isLoading = false;
      state.error = null;
      state.isAllConversationsFetched = conversations.length < 15;
    },
    clearHelpMeConversations: state => {
      state.conversations = [];
      state.currentPage = 1;
      state.isAllConversationsFetched = false;
      state.error = null;
    },
  },
});

export const {
  setHelpMeConversationsLoading,
  setHelpMeConversationsError,
  setHelpMeConversations,
  clearHelpMeConversations,
} = helpMeConversationSlice.actions;

export default helpMeConversationSlice.reducer;
