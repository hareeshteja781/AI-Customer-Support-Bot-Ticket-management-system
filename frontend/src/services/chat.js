import api from './api';

export const listConversations = () => api.get('/chat/conversations');
export const createConversation = () => api.post('/chat/conversations');
export const getConversation = (conversationId) => api.get(`/chat/conversations/${conversationId}`);
export const sendMessage = (conversationId, payload) => api.post(`/chat/conversations/${conversationId}/messages`, payload);
export const renameConversation = (conversationId, payload) => api.patch(`/chat/conversations/${conversationId}`, payload);
export const deleteConversation = (conversationId) => api.delete(`/chat/conversations/${conversationId}`);
