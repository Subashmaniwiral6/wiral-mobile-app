import { RootState } from '@/store';
import { Conversation } from '@/types';

export const selectHelpMeConversations = (state: RootState): Conversation[] =>
  state.helpMeConversations.conversations;

export const selectHelpMeConversationsLoading = (state: RootState): boolean =>
  state.helpMeConversations.isLoading;

export const selectHelpMeConversationsError = (state: RootState): string | null =>
  state.helpMeConversations.error;

export const selectIsAllHelpMeConversationsFetched = (state: RootState): boolean =>
  state.helpMeConversations.isAllConversationsFetched;

export const selectHelpMeConversationsCount = (state: RootState): number =>
  state.helpMeConversations.conversations.length;
