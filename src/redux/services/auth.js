import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    checkAuth: builder.query({
      query: (userId) => ({
        url: '/telegram/check',
        params: { user_id: userId },
      }),
      providesTags: ['Auth'],
    }),
    login: builder.mutation({
      query: ({ userId, password }) => ({
        url: '/telegram/login',
        method: 'POST',
        body: { user_id: userId, password },
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useCheckAuthQuery, useLoginMutation } = authApi;
