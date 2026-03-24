import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const managersApi = createApi({
  reducerPath: 'managersApi',
  baseQuery,
  tagTypes: ['Manager'],

  endpoints: (builder) => ({
    getManagers: builder.query({
      query: (params) => ({
        url: 'telegram/managers',
        params,
      }),
      providesTags: ['Manager'],
    }),

    updateManager: builder.mutation({
      query: ({ userId, body }) => ({
        url: `telegram/managers/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Manager'],
    }),
  }),
})

export const {
  useGetManagersQuery,
  useUpdateManagerMutation,
} = managersApi
