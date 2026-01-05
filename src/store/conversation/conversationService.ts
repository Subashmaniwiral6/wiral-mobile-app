import { apiService } from '@/services/APIService';
import type {
  ConversationPayload,
  MessagesPayload,
  MessagesAPIResponse,
  MessageBuilderPayload,
  SendMessageAPIResponse,
  ConversationListAPIResponse,
  ConversationAPIResponse,
  ToggleConversationStatusPayload,
  ToggleConversationStatusResponse,
  BulkActionPayload,
  AssigneePayload,
  AssigneeAPIResponse,
  MarkMessagesUnreadPayload,
  MarkMessagesUnreadAPIResponse,
  MarkMessageReadPayload,
  MarkMessageReadAPIResponse,
  MuteOrUnmuteConversationPayload,
  ConversationLabelPayload,
  AssignTeamPayload,
  AssignTeamAPIResponse,
  DeleteMessagePayload,
  DeleteMessageAPIResponse,
  TypingPayload,
  ConversationListResponse,
  MessagesResponse,
  ConversationResponse,
  MarkMessageReadOrUnreadResponse,
  ToggleConversationStatusAPIResponse,
  TogglePriorityPayload,
} from './conversationTypes';

import {
  transformConversation,
  transformConversationListMeta,
  transformMessage,
  transformConversationMeta,
} from '@/utils/camelCaseKeys';
import type { AxiosRequestConfig } from 'axios';

export class ConversationService {
  static async getConversations(payload: ConversationPayload): Promise<ConversationListResponse> {
    const { status, assigneeType, page, sortBy, inboxId = 0 } = payload;

    const params = {
      inbox_id: inboxId || null,
      assignee_type: assigneeType,
      status: status,
      page: page,
      sort_by: sortBy,
    };
    const response = await apiService.get<ConversationListAPIResponse>('conversations', {
      params,
    });
    const {
      data: { payload: conversations, meta },
    } = response.data;
    const transformedResponse: ConversationListResponse = {
      conversations: conversations.map(transformConversation),
      meta: transformConversationListMeta(meta),
    };
    return transformedResponse;
  }

  static async getHelpmeConversations(payload: ConversationPayload): Promise<ConversationListResponse> {
    const { status, assigneeType, page, sortBy, inboxId = 0 } = payload;

    const params = {
      inbox_id: inboxId || null,
      assignee_type: assigneeType,
      status: status,
      page: page,
      sort_by: sortBy,
    };
    const response = await apiService.get<ConversationListAPIResponse>('conversations?label=helpme', {
      params,
    });
    const {
      data: { payload: conversations, meta },
    } = response.data;
    const transformedResponse: ConversationListResponse = {
      conversations: conversations.map(transformConversation),
      meta: transformConversationListMeta(meta),
    };
    return transformedResponse;
  }

  static async fetchConversation(conversationId: number): Promise<ConversationResponse> {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c2f98694-5788-442a-896c-b31b54b1d0bb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'conversationService.ts:69',
        message: 'fetchConversation called',
        data: {
          conversationId,
          conversationIdType: typeof conversationId,
          url: `conversations/${conversationId}`,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    try {
      // #region agent log
      console.log('[DEBUG] Making API call', {
        conversationId,
        url: `conversations/${conversationId}`,
      });
      // #endregion
      const response = await apiService.get<ConversationAPIResponse>(
        `conversations/${conversationId}`,
      );
      // #region agent log
      console.log('[DEBUG] API call successful', {
        conversationId,
        status: response.status,
        hasData: !!response.data,
      });
      fetch('http://127.0.0.1:7243/ingest/c2f98694-5788-442a-896c-b31b54b1d0bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'conversationService.ts:72',
          message: 'API call successful',
          data: { conversationId, status: response.status, hasData: !!response.data },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run2',
          hypothesisId: 'D',
        }),
      }).catch(() => {});
      // #endregion

      const { data: conversation } = response;
      return {
        conversation: transformConversation(conversation),
      };
    } catch (error: any) {
      // #region agent log
      console.log('[DEBUG] API call failed', {
        conversationId,
        errorMessage: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        hasResponse: !!error?.response,
        errorCode: error?.code,
      });
      fetch('http://127.0.0.1:7243/ingest/c2f98694-5788-442a-896c-b31b54b1d0bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'conversationService.ts:79',
          message: 'API call failed',
          data: {
            conversationId,
            errorMessage: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            hasResponse: !!error?.response,
            errorCode: error?.code,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run2',
          hypothesisId: 'B',
        }),
      }).catch(() => {});
      // #endregion
      throw error;
    }
  }

  static async fetchPreviousMessages(payload: MessagesPayload): Promise<MessagesResponse> {
    const { conversationId, beforeId } = payload;

    const response = await apiService.get<MessagesAPIResponse>(
      `conversations/${conversationId}/messages`,
      {
        params: {
          before: beforeId,
        },
      },
    );
    const { meta, payload: messages } = response.data;
    return {
      meta: transformConversationMeta(meta),
      messages: messages.map(transformMessage),
      conversationId,
    };
  }

  static async sendMessage(
    conversationId: number,
    payload: MessageBuilderPayload,
    config: AxiosRequestConfig,
  ): Promise<SendMessageAPIResponse> {
    const response = await apiService.post<SendMessageAPIResponse>(
      `conversations/${conversationId}/messages`,
      payload,
      config,
    );
    return response.data;
  }

  static async toggleConversationStatus({
    conversationId,
    payload,
  }: ToggleConversationStatusPayload): Promise<ToggleConversationStatusResponse> {
    const response = await apiService.post<ToggleConversationStatusAPIResponse>(
      `conversations/${conversationId}/toggle_status`,
      payload,
    );
    const {
      payload: { current_status: currentStatus, snoozed_until: snoozedUntil },
    } = response.data;
    return {
      conversationId,
      currentStatus,
      snoozedUntil,
    };
  }
  static async bulkAction(payload: BulkActionPayload): Promise<void> {
    await apiService.post('bulk_actions', payload);
  }
  static async assignConversation(payload: AssigneePayload): Promise<AssigneeAPIResponse> {
    const { conversationId, assigneeId, teamId } = payload;
    const params = {
      assignee_id: assigneeId,
      team_id: teamId,
    };
    const response = await apiService.post<AssigneeAPIResponse>(
      `conversations/${conversationId}/assignments`,
      params,
    );
    return response.data;
  }

  static async assignTeam(payload: AssignTeamPayload): Promise<AssignTeamAPIResponse> {
    const { conversationId, teamId } = payload;
    const response = await apiService.post<AssignTeamAPIResponse>(
      `conversations/${conversationId}/assignments?team_id=${teamId}`,
    );
    return response.data;
  }

  static async markMessagesUnread(
    payload: MarkMessagesUnreadPayload,
  ): Promise<MarkMessageReadOrUnreadResponse> {
    const { conversationId } = payload;
    const response = await apiService.post<MarkMessagesUnreadAPIResponse>(
      `conversations/${conversationId}/unread`,
    );
    const { id, unread_count: unreadCount, agent_last_seen_at: agentLastSeenAt } = response.data;
    return {
      conversationId: id,
      unreadCount,
      agentLastSeenAt,
    };
  }

  static async markMessageRead(
    payload: MarkMessageReadPayload,
  ): Promise<MarkMessageReadOrUnreadResponse> {
    const { conversationId } = payload;
    const response = await apiService.post<MarkMessageReadAPIResponse>(
      `conversations/${conversationId}/update_last_seen`,
    );
    const { id, unread_count: unreadCount, agent_last_seen_at: agentLastSeenAt } = response.data;
    return {
      conversationId: id,
      unreadCount,
      agentLastSeenAt,
    };
  }

  static async muteConversation(payload: MuteOrUnmuteConversationPayload): Promise<void> {
    const { conversationId } = payload;
    await apiService.post(`conversations/${conversationId}/mute`);
  }

  static async unmuteConversation(payload: MuteOrUnmuteConversationPayload): Promise<void> {
    const { conversationId } = payload;
    await apiService.post(`conversations/${conversationId}/unmute`);
  }

  static async addOrUpdateConversationLabels(payload: ConversationLabelPayload): Promise<void> {
    const { conversationId, labels } = payload;
    await apiService.post(`conversations/${conversationId}/labels`, { labels });
  }

  static async deleteMessage(payload: DeleteMessagePayload): Promise<DeleteMessageAPIResponse> {
    const { conversationId, messageId } = payload;
    const response = await apiService.delete<DeleteMessageAPIResponse>(
      `conversations/${conversationId}/messages/${messageId}`,
    );
    return response.data;
  }

  static async toggleTyping(payload: TypingPayload): Promise<void> {
    const { conversationId, typingStatus, isPrivate } = payload;
    await apiService.post(`conversations/${conversationId}/toggle_typing_status`, {
      typing_status: typingStatus,
      is_private: isPrivate,
    });
  }

  static async togglePriority(payload: TogglePriorityPayload): Promise<void> {
    const { conversationId, priority } = payload;
    await apiService.post(`conversations/${conversationId}/toggle_priority`, { priority });
  }
}
