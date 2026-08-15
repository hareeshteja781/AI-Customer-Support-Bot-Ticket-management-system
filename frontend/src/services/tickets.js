import api from './api';

export const getTickets = () => api.get('/tickets');
export const createTicket = (payload) => api.post('/tickets', payload);
export const getTicket = (ticketId) => api.get(`/tickets/${ticketId}`);
