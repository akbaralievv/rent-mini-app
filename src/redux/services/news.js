import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

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
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
