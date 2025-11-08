import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '@/constants';
import { Notification } from '@/types/Notification';

let notifee: typeof import('@notifee/react-native').default | undefined;

if (Platform.OS === 'ios') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  notifee = require('@notifee/react-native')
    .default as typeof import('@notifee/react-native').default;
}

export const clearAllDeliveredNotifications = async () => {
  if (Platform.OS === 'ios' && notifee) {
    await notifee.cancelAllNotifications();
  }
};

export const updateBadgeCount = async ({ count = 0 }) => {
  if (Platform.OS === 'ios' && count >= 0 && notifee) {
    await notifee.setBadgeCount(count);
  }
};

export const findConversationLinkFromPush = ({
  notification,
  installationUrl,
}: {
  notification: Notification;
  installationUrl: string;
}) => {
  const { notificationType } = notification;

  if (NOTIFICATION_TYPES.includes(notificationType)) {
    const { primaryActor, primaryActorId, primaryActorType } = notification;
    let conversationId = null;
    if (primaryActorType === 'Conversation') {
      conversationId = primaryActor.id;
    } else if (primaryActorType === 'Message') {
      conversationId = primaryActor.conversationId;
    }
    if (conversationId) {
      const conversationLink = `${installationUrl}/app/accounts/1/conversations/${conversationId}/${primaryActorId}/${primaryActorType}`;
      return conversationLink;
    }
  }
  return;
};

interface FCMMessage {
  data?: {
    payload?: string;
    notification?: string;
  };
}

export const findNotificationFromFCM = ({ message }: { message: FCMMessage }) => {
  console.log('[FCM DEBUG] findNotificationFromFCM - Raw message:', JSON.stringify(message, null, 2));
  
  let notification = null;
  
  try {
    // FCM HTTP v1
    if (message?.data?.payload) {
      console.log('[FCM DEBUG] Processing FCM HTTP v1 payload');
      const parsedPayload = JSON.parse(message.data.payload);
      console.log('[FCM DEBUG] Parsed payload:', JSON.stringify(parsedPayload, null, 2));
      
      if (parsedPayload?.data?.notification) {
        notification = parsedPayload.data.notification;
        console.log('[FCM DEBUG] Extracted notification from HTTP v1:', JSON.stringify(notification, null, 2));
      } else {
        console.warn('[FCM DEBUG] No notification found in parsedPayload.data');
      }
    }
    // FCM legacy. It will be deprecated soon
    else if (message?.data?.notification) {
      console.log('[FCM DEBUG] Processing FCM legacy notification');
      notification = JSON.parse(message.data.notification);
      console.log('[FCM DEBUG] Extracted notification from legacy:', JSON.stringify(notification, null, 2));
    } else {
      console.warn('[FCM DEBUG] No payload or notification found in message.data');
      console.warn('[FCM DEBUG] Message data keys:', message?.data ? Object.keys(message.data) : 'no data');
    }
  } catch (error) {
    console.error('[FCM ERROR] Failed to parse notification from FCM message:', error);
    console.error('[FCM ERROR] Message data:', JSON.stringify(message?.data, null, 2));
    return null;
  }
  
  if (!notification) {
    console.warn('[FCM DEBUG] No notification extracted from message');
  }
  
  return notification;
};
