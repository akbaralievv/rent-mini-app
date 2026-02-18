import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const waApi = createApi({
  reducerPath: 'waApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001',
  }),
  tagTypes: ['Chats', 'History'],
  endpoints: (builder) => ({
    
    getChats: builder.query({
      query: ({ page = 0, limit = 10 }) =>
        `/chats?page=${page}&limit=${limit}`,
      providesTags: ['Chats'],
    }),

    sendMessage: builder.mutation({
      query: ({ chatId, text, media }) => ({
        url: '/send',
        method: 'POST',
        body: { chatId, text, media },
      }),
      invalidatesTags: ['History'],
    }),

    getHistory: builder.query({
      query: (chatId) => `/history/${chatId}`,
      providesTags: (result, error, chatId) => [
        { type: 'History', id: chatId },
      ],
    }),

  }),
});

export const {
  useGetChatsQuery,
  useSendMessageMutation,
  useGetHistoryQuery,
} = waApi;
