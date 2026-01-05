import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConversationService } from './conversationService';
import type {
  ConversationResponse,
  ConversationPayload,
  ApiErrorResponse,
  MessagesPayload,
  MessagesResponse,
  ConversationListResponse,
  ToggleConversationStatusPayload,
  BulkActionPayload,
  AssigneePayload,
  AssignTeamPayload,
  AssignTeamAPIResponse,
  AssigneeAPIResponse,
  MarkMessagesUnreadPayload,
  MarkMessageReadPayload,
  MarkMessageReadOrUnreadResponse,
  MuteOrUnmuteConversationPayload,
  ConversationLabelPayload,
  DeleteMessagePayload,
  DeleteMessageAPIResponse,
  TypingPayload,
  ToggleConversationStatusResponse,
  SendMessageAPIResponse,
  SendMessagePayload,
  TogglePriorityPayload,
} from './conversationTypes';
import { AxiosError } from 'axios';
import { MESSAGE_STATUS } from '@/constants';
import { buildCreatePayload, createPendingMessage } from '@/utils/messageUtils';
import { transformMessage } from '@/utils/camelCaseKeys';
import { Platform } from 'react-native';

export const conversationActions = {
  fetchConversations: createAsyncThunk<ConversationListResponse, ConversationPayload>(
    'conversations/fetchConversations',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.getConversations(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  fetchConversation: createAsyncThunk<ConversationResponse, number>(
    'conversations/fetchConversation',
    async (conversationId, { rejectWithValue }) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c2f98694-5788-442a-896c-b31b54b1d0bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'conversationActions.ts:51',
          message: 'fetchConversation thunk started',
          data: { conversationId, conversationIdType: typeof conversationId },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C',
        }),
      }).catch(() => {});
      // #endregion
      try {
        const result = await ConversationService.fetchConversation(conversationId);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c2f98694-5788-442a-896c-b31b54b1d0bb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'conversationActions.ts:55',
            message: 'fetchConversation thunk success',
            data: {
              conversationId,
              hasConversation: !!result.conversation,
              conversationIdFromResult: result.conversation?.id,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }).catch(() => {});
        // #endregion
        return result;
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c2f98694-5788-442a-896c-b31b54b1d0bb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'conversationActions.ts:59',message:'fetchConversation thunk error',data:{conversationId,hasResponse:!!response,status:response?.status,statusText:response?.statusText,errorMessage:(error as Error)?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  fetchPreviousMessages: createAsyncThunk<MessagesResponse, MessagesPayload>(
    'conversations/fetchPreviousMessages',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.fetchPreviousMessages(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  sendMessage: createAsyncThunk<SendMessageAPIResponse, SendMessagePayload>(
    'conversations/sendMessage',
    async (sendMessagePayload, { dispatch, rejectWithValue }) => {
      const { conversationId } = sendMessagePayload;
      const pendingMessage = createPendingMessage(sendMessagePayload);

      try {
        dispatch({
          type: 'conversation/addOrUpdateMessage',
          payload: {
            ...pendingMessage,
            status: MESSAGE_STATUS.PROGRESS,
          },
        });
        const payload = buildCreatePayload(pendingMessage);
        const { file } = sendMessagePayload;
        const contentType =
          Platform.OS === 'ios' && file
            ? file.type
            : Platform.OS === 'android' && file
              ? 'multipart/form-data'
              : 'application/json';

        const response = await ConversationService.sendMessage(conversationId, payload, {
          headers: {
            'Content-Type': contentType,
          },
        });

        const camelCaseMessage = transformMessage(response);

        dispatch({
          type: 'conversation/addOrUpdateMessage',
          payload: {
            ...camelCaseMessage,
            status: MESSAGE_STATUS.SENT,
          },
        });
        return response;
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        const errorMessage = response?.data?.errors?.[0];
        dispatch({
          type: 'conversation/addOrUpdateMessage',
          payload: {
            ...pendingMessage,
            meta: {
              error: errorMessage,
            },
            status: MESSAGE_STATUS.FAILED,
          },
        });
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  toggleConversationStatus: createAsyncThunk<
    ToggleConversationStatusResponse,
    ToggleConversationStatusPayload
  >('conversations/toggleConversationStatus', async (payload, { rejectWithValue }) => {
    try {
      return await ConversationService.toggleConversationStatus(payload);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),
  bulkAction: createAsyncThunk<void, BulkActionPayload>(
    'conversations/bulkAction',
    async (payload, { rejectWithValue }) => {
      await ConversationService.bulkAction(payload);
    },
  ),
  assignConversation: createAsyncThunk<AssigneeAPIResponse, AssigneePayload>(
    'conversations/assignConversation',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.assignConversation(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  assignTeam: createAsyncThunk<AssignTeamAPIResponse, AssignTeamPayload>(
    'conversations/assignTeam',
    async (payload, { rejectWithValue }) => {
      try {
        return await ConversationService.assignTeam(payload);
      } catch (error) {
        const { response } = error as AxiosError<ApiErrorResponse>;
        if (!response) {
          throw error;
        }
        return rejectWithValue(response.data);
      }
    },
  ),
  markMessagesUnread: createAsyncThunk<
    MarkMessageReadOrUnreadResponse,
    MarkMessagesUnreadPayload,
    { rejectValue: ApiErrorResponse }
  >('conversations/markMessagesUnread', async (payload, { rejectWithValue }) => {
    try {
      return await ConversationService.markMessagesUnread(payload);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),
  markMessageRead: createAsyncThunk<
    MarkMessageReadOrUnreadResponse,
    MarkMessageReadPayload,
    { rejectValue: ApiErrorResponse }
  >('conversations/markMessageRead', async (payload, { rejectWithValue }) => {
    try {
      return await ConversationService.markMessageRead(payload);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  }),
  muteConversation: createAsyncThunk<
    {
      conversationId: number;
    },
    MuteOrUnmuteConversationPayload
  >('conversations/muteConversation', async (payload, { rejectWithValue }) => {
    await ConversationService.muteConversation(payload);
    return { conversationId: payload.conversationId };
  }),
  unmuteConversation: createAsyncThunk<
    {
      conversationId: number;
    },
    MuteOrUnmuteConversationPayload
  >('conversations/unmuteConversation', async (payload, { rejectWithValue }) => {
    await ConversationService.unmuteConversation(payload);
    return { conversationId: payload.conversationId };
  }),
  addOrUpdateConversationLabels: createAsyncThunk<void, ConversationLabelPayload>(
    'conversations/addOrUpdateConversationLabels',
    async (payload, { rejectWithValue }) => {
      await ConversationService.addOrUpdateConversationLabels(payload);
    },
  ),
  deleteMessage: createAsyncThunk<DeleteMessageAPIResponse, DeleteMessagePayload>(
    'conversations/deleteMessage',
    async (payload, { rejectWithValue }) => {
      return await ConversationService.deleteMessage(payload);
    },
  ),
  toggleTyping: createAsyncThunk<void, TypingPayload>(
    'conversations/toggleTyping',
    async (payload, { rejectWithValue }) => {
      return await ConversationService.toggleTyping(payload);
    },
  ),
  togglePriority: createAsyncThunk<void, TogglePriorityPayload>(
    'conversations/togglePriority',
    async (payload, { rejectWithValue }) => {
      return await ConversationService.togglePriority(payload);
    },
  ),
};
