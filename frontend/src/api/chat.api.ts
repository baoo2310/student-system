import api from './axios';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        avatarUrl?: string | null;
    };
}

export interface ConversationParticipant {
    userId: string;
    user: {
        id: string;
        username: string;
        avatarUrl?: string | null;
    };
}

export interface Conversation {
    id: string;
    updatedAt: string;
    participants: ConversationParticipant[];
    messages: Message[];
}

export const chatApi = {
    getConversations: async () => {
        const response = await api.get('/chat');
        return response.data;
    },

    getOrCreateConversation: async (otherUserId: string) => {
        const response = await api.post('/chat/init', { otherUserId });
        return response.data;
    },

    getMessages: async (conversationId: string) => {
        const response = await api.get(`/chat/${conversationId}/messages`);
        return response.data;
    },

    sendMessage: async (conversationId: string, content: string) => {
        const response = await api.post(`/chat/${conversationId}/messages`, { content });
        return response.data;
    }
};
