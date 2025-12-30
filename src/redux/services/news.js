import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

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
})

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery,
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query({
      query: () => '/news',
      providesTags: ['News'],
    }),
    getNewsById: builder.query({
      query: (id) => `/news/${id}`,
      providesTags: (result, error, id) => [{ type: 'News', id }],
    }),
    createNews: builder.mutation({
      query: (formData) => ({
        url: '/news',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['News'],
    }),
    updateNews: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/news/${id}`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'News', id }, 'News'],
    }),
    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['News'],
    }),
  }),
})

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi
