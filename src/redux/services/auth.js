import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL + '/api',
  prepareHeaders: (headers) => {
    const tg = window.Telegram?.WebApp;
    const id = tg?.initDataUnsafe?.user?.id;
    if (id) {
      headers.set('X-Telegram-User', id.toString());
    }
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    checkAuth: builder.query({
      query: (userId) => ({
        url: '/telegram/check',
        params: { user_id: userId },
      }),
    }),
    login: builder.mutation({
      query: ({ userId, password }) => ({
        url: '/telegram/login',
        method: 'POST',
        body: { user_id: userId, password },
      }),
    }),
  }),
});

export const { useCheckAuthQuery, useLoginMutation } = authApi;
