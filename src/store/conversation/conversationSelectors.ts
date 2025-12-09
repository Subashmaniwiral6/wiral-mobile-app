import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { conversationAdapter } from './conversationSlice';
import { FilterState } from '@/store/conversation/conversationFilterSlice';
import { shouldApplyFilters } from '@/utils/conversationUtils';
import type { Conversation } from '@/types';
import { MESSAGE_TYPES } from '@/constants';

export const selectConversationsState = (state: RootState) => state.conversations;

export const {
  selectAll: selectAllConversations,
  selectById: selectConversationById,
  selectIds: selectConversationIds,
} = conversationAdapter.getSelectors<RootState>(selectConversationsState);

export const selectConversationsLoading = createSelector(
  selectConversationsState,
  state => state.isLoadingConversations,
);

export const selectConversationError = createSelector(
  selectConversationsState,
  state => state.error,
);

export const selectConversationFetching = createSelector(
  selectConversationsState,
  state => state.isConversationFetching,
);

export const selectIsAllConversationsFetched = createSelector(
  selectConversationsState,
  state => state.isAllConversationsFetched,
);

export const selectIsAllMessagesFetched = createSelector(
  selectConversationsState,
  state => state.isAllMessagesFetched,
);

export const selectIsLoadingMessages = createSelector(
  selectConversationsState,
  state => state.isLoadingMessages,
);

export const getFilteredConversations = createDraftSafeSelector(
  [selectAllConversations, (_, filters: FilterState) => filters],
  (conversations, filters) => {
    const sortedConversations = conversations.sort(
      (a: Conversation, b: Conversation) => b.lastActivityAt - a.lastActivityAt,
    );

    return sortedConversations.filter(conversation => shouldApplyFilters(conversation, filters));
  },
);

export const getMessagesByConversationId = createDraftSafeSelector(
  [
    (state: RootState, params: { conversationId: number }) =>
      selectConversationById(state, params.conversationId),
  ],
  conversation => {
    if (!conversation) {
      return [];
    }
    // Memoize the sorted and filtered messages using createSelector
    return conversation.messages
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt)
      .reverse()
      .filter((message, index, self) => index === self.findIndex(m => m.id === message.id));
  },
);

export const getLastEmailInSelectedChat = createDraftSafeSelector(
  [
    (state: RootState, params: { conversationId: number }) =>
      selectConversationById(state, params.conversationId),
  ],
  conversation => {
    if (!conversation) {
      return [];
    }
    const lastEmail = [...conversation.messages].reverse().find(message => {
      const { contentAttributes = {}, messageType } = message;
      const emailAttributes =
        (contentAttributes as { email?: { from?: string } | null }).email || null;
      const isIncomingOrOutgoing =
        messageType === MESSAGE_TYPES.OUTGOING || messageType === MESSAGE_TYPES.INCOMING;
      if (emailAttributes?.from && isIncomingOrOutgoing) {
        return true;
      }
      return false;
    });
    return lastEmail;
  },
);
