import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { chatApi, type Conversation, type Message } from '../../api/chat.api';
import { useSocket } from '../../hooks/useSocket';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function ChatPage() {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const socket = useSocket();
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Fetch conversation list
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await chatApi.getConversations();
                if (data.success) {
                    setConversations(data.data);
                    if (data.data.length > 0) {
                        setActiveConversationId(data.data[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to load conversations', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchConversations();
        }
    }, [currentUser]);

    // Load messages for active conversation
    useEffect(() => {
        if (activeConversationId) {
            const fetchMessages = async () => {
                try {
                    const data = await chatApi.getMessages(activeConversationId);
                    if (data.success) {
                        setMessages(data.data);
                    }
                } catch (err) {
                    console.error('Failed to load messages', err);
                }
            };
            fetchMessages();

            // Join conversation socket room
            if (socket) {
                socket.emit('join_conversation', activeConversationId);
            }
        }
    }, [activeConversationId, socket]);

    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            if (message.conversationId === activeConversationId) {
                setMessages((prev) => [...prev, message]);
            }

            // Update conversation list preview
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id === message.conversationId) {
                        return { ...conv, updatedAt: message.createdAt, messages: [message] };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            );
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, activeConversationId]);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Auto-scroll whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;

        try {
            await chatApi.sendMessage(activeConversationId, newMessage);
            // new_message is also emitted to sender, so the socket handler above will typically catch it.
            // But we might also want to optimistically add it if we don't duplicate. We'll rely on the socket for consistency for now.
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const getOtherParticipant = (participants: any[]) => {
        return participants.find((p) => p.userId !== currentUser?.id)?.user;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex gap-6">

            {/* Conversations Sidebar */}
            <div className={`w-full md:w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No conversations yet. Match with someone to start chatting!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {conversations.map((conv) => {
                                const otherUser = getOtherParticipant(conv.participants);
                                const lastMessage = conv.messages[0];
                                const isActive = activeConversationId === conv.id;

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setActiveConversationId(conv.id)}
                                        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4 ${isActive ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        {otherUser?.avatarUrl ? (
                                            <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                                {otherUser?.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                    {otherUser?.username}
                                                </p>
                                                {lastMessage && (
                                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                        {new Date(lastMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                            ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : new Date(lastMessage.createdAt).toLocaleDateString()
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            {lastMessage && (
                                                <p className={`text-sm truncate ${isActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}{lastMessage.content}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
                {activeConversationId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-4">
                            <button
                                className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => setActiveConversationId(null)}
                            >
                                ← Back
                            </button>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {getOtherParticipant(conversations.find((c) => c.id === activeConversationId)?.participants || [])?.username || 'Chat'}
                            </h3>
                        </div>

                        {/* Messages List */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {messages.map((message) => {
                                const isOwn = message.senderId === currentUser?.id;
                                return (
                                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-400'}`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <PaperAirplaneIcon className="w-16 h-16 opacity-20 mb-4" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

        </div>
    );
}
