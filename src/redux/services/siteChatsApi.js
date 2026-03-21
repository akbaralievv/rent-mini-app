import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const siteChatsApi = createApi({
  reducerPath: 'siteChatsApi',
  baseQuery,
  tagTypes: ['SiteChats', 'SiteChatMessages'],
  endpoints: (builder) => ({

    getSiteChats: builder.query({
      query: (page = 1) => ({
        url: '/chat',
        params: { page },
      }),
      providesTags: ['SiteChats'],
    }),

    getSiteChat: builder.query({
      query: (id) => `/chat/show/${id}`,
      providesTags: (result, error, id) => [
        { type: 'SiteChatMessages', id },
      ],
    }),

    getSiteChatMessages: builder.query({
      query: (id) => `/chat/${id}`,
      providesTags: (result, error, id) => [
        { type: 'SiteChatMessages', id },
      ],
    }),

    sendAdminMessage: builder.mutation({
      query: ({ id, content }) => ({
        url: `/chat/${id}/AdminSend`,
        method: 'POST',
        body: { sender_id: 1, content },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SiteChatMessages', id },
      ],
    }),

    closeSiteChat: builder.mutation({
      query: (id) => ({
        url: `/chat/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: ['SiteChats'],
    }),

    deleteSiteChat: builder.mutation({
      query: (id) => `/chat/del/${id}`,
      invalidatesTags: ['SiteChats'],
    }),

  }),
});

export const {
  useGetSiteChatsQuery,
  useGetSiteChatQuery,
  useGetSiteChatMessagesQuery,
  useSendAdminMessageMutation,
  useCloseSiteChatMutation,
  useDeleteSiteChatMutation,
} = siteChatsApi;
