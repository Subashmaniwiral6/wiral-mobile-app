/* eslint-disable react/display-name */
import React, { memo, useCallback, useMemo } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { SharedValue } from 'react-native-reanimated';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { Conversation } from '@/types';
import { toggleSelection, selectSelected } from '@/store/conversation/conversationSelectedSlice';
import { selectCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectContactById } from '@/store/contact/contactSelectors';
import { selectTypingUsersByConversationId } from '@/store/conversation/conversationTypingSlice';
import { selectAllLabels } from '@/store/label/labelSelectors';

import { isContactTyping, getLastMessage, getTypingUsersText } from '@/utils';
import { Swipeable } from '@/components-next/common';

import { ConversationItem } from './ConversationItem';

type ConversationItemContainerProps = {
  conversationItem: Conversation;
  index: number;
  openedRowIndex: SharedValue<number | null>;
};

export const ConversationItemContainer = memo((props: ConversationItemContainerProps) => {
  const { conversationItem, index, openedRowIndex } = props;
  const {
    meta: { sender, assignee },
    id,
    priority,
    unreadCount,
    labels,
    timestamp,
    inboxId,
    lastNonActivityMessage,
    slaPolicyId,
    appliedSla,
    firstReplyCreatedAt,
    waitingSince,
    status,
    additionalAttributes,
  } = conversationItem;

  // Safely extract sender properties with defaults
  const senderName = sender?.name || '';
  const senderThumbnail = sender?.thumbnail || '';
  const contactId = sender?.id || 0;

  // Hooks
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Selectors
  const allLabels = useAppSelector(selectAllLabels);
  const contact = useAppSelector(state => selectContactById(state, contactId));
  const inbox = useAppSelector(state => selectInboxById(state, inboxId));
  const typingUsers = useAppSelector(selectTypingUsersByConversationId(id));
  const selected = useAppSelector(selectSelected);
  const currentState = useAppSelector(selectCurrentState);

  const { availabilityStatus, name: contactName, thumbnail: contactThumbnail } = contact || {};
  const isSelected = useMemo(() => id in selected, [selected, id]);
  const isTyping = useMemo(() => isContactTyping(typingUsers, contactId), [typingUsers, contactId]);
  const typingText = useMemo(() => getTypingUsersText({ users: typingUsers }), [typingUsers]);

  const lastMessage = getLastMessage(conversationItem);

  const onPressAction = useCallback(() => {
    if (currentState === 'Select') {
      dispatch(toggleSelection({ conversation: conversationItem }));
    } else {
      const pushToChatScreen = StackActions.push('ChatScreen', {
        conversationId: id,
        isConversationOpenedExternally: false,
      });
      navigation.dispatch(pushToChatScreen);
    }
  }, [currentState, dispatch, conversationItem, navigation, id]);

  const viewProps = {
    id,
    senderName: contactName || senderName,
    senderThumbnail: contactThumbnail || senderThumbnail,
    isSelected,
    currentState,
    unreadCount,
    isTyping,
    availabilityStatus: availabilityStatus || 'offline',
    priority,
    labels,
    timestamp,
    inbox: inbox || null,
    lastNonActivityMessage,
    lastMessage,
    inboxId,
    assignee: assignee || null,
    slaPolicyId,
    appliedSla: appliedSla || null,
    appliedSlaConversationDetails: {
      firstReplyCreatedAt,
      waitingSince,
      status,
    },
    additionalAttributes,
    allLabels,
    typingText: typingText as string | undefined,
  };

  return (
    <Swipeable
      spacing={27}
      handlePress={onPressAction}
      triggerOverswipeOnFlick
      {...{ index, openedRowIndex }}>
      <ConversationItem {...viewProps} />
    </Swipeable>
  );
});
