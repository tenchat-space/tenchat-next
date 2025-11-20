"use client";

import { useCallback } from 'react';
import { Conversation } from '@/hooks/useMessaging';
import { useWindow } from '@/contexts/WindowContext';
import { ChatWindow } from '@/components/chat/window/ChatWindow';
import { CallWindow, CallWindowProps } from '@/components/window/CallWindow';

export interface OpenChatWindowArgs {
  conversation: Conversation;
  currentUserId: string;
  isAuthenticated: boolean;
  onConnect: () => void;
}

export interface OpenCallWindowArgs extends CallWindowProps {
  callId: string;
}

const formatConversationTitle = (conversation: Conversation, currentUserId: string) => {
  if (conversation.name) return conversation.name;
  if (conversation.participantIds?.length === 2) {
    const other = conversation.participantIds.find((id: string) => id !== currentUserId);
    return other || 'Direct chat';
  }
  return 'Tenchat room';
};

export function useWindowBridge() {
  const { openWindow } = useWindow();

  const openChatWindow = useCallback(
    ({ conversation, currentUserId, isAuthenticated, onConnect }: OpenChatWindowArgs) => {
      const windowId = `chat-${conversation.$id}`;
      const title = formatConversationTitle(conversation, currentUserId);

      openWindow({
        id: windowId,
        title,
        type: 'CHAT',
        component: (
          <ChatWindow
            conversation={conversation}
            currentUserId={currentUserId}
            isAuthenticated={isAuthenticated}
            onConnect={onConnect}
          />
        ),
        props: { conversation, currentUserId, isAuthenticated, onConnect },
      });
    },
    [openWindow]
  );

  const openCallWindow = useCallback(
    ({ callId, onHangUp, participant, type, meetId }: OpenCallWindowArgs) => {
      openWindow({
        id: `call-${callId}`,
        title: `${participant} • ${type === 'video' ? 'Video' : 'Voice'} call`,
        type: 'CALL',
        component: <CallWindow meetId={meetId} participant={participant} type={type} onHangUp={onHangUp} />,
        props: { meetId, participant, type, onHangUp },
      });
    },
    [openWindow]
  );

  return {
    openChatWindow,
    openCallWindow,
  };
}
