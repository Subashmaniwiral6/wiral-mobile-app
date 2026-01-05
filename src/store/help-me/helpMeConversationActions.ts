import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationPayload } from '@/store/conversation/conversationTypes';
import { ConversationService } from '@/store/conversation/conversationService';
import {
  setHelpMeConversationsLoading,
  setHelpMeConversationsError,
  setHelpMeConversations,
} from './helpMeConversationSlice';

export const helpMeConversationActions = {
  fetchHelpMeConversations: createAsyncThunk(
    'helpMeConversations/fetchHelpMeConversations',
    async (payload: { page?: number; inboxId?: number }, { dispatch, rejectWithValue }) => {
      try {
        dispatch(setHelpMeConversationsLoading(true));

        const conversationFilters: ConversationPayload = {
          page: payload.page || 1,
          status: 'all', // Hardcoded
          sort_by: 'last_activity_at_desc', // Hardcoded
          inbox_id: payload.inboxId,
          labels: ['helpme'], // Help me conversations are filtered by helpme label
        };

        const response = await ConversationService.getHelpmeConversations(conversationFilters);

        dispatch(
          setHelpMeConversations({
            conversations: response.conversations,
            page: payload.page || 1,
          }),
        );

        return response.conversations;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Failed to fetch help me conversations';
        dispatch(setHelpMeConversationsError(errorMessage));
        return rejectWithValue(errorMessage);
      }
    },
  ),
};
