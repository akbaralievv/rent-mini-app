import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const tagsApi = createApi({
  reducerPath: 'tagsApi',
  baseQuery,
  tagTypes: ['Tags'],
  endpoints: (builder) => ({

    getTags: builder.query({
      query: () => '/finance-tags',
      providesTags: ['Tags'],
    }),

    createTag: builder.mutation({
      query: (data) => ({
        url: '/finance-tags',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tags'],
    }),

    updateTag: builder.mutation({
      query: ({ id, name }) => ({
        url: `/finance-tags/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tags', id },
        'Tags',
      ],
    }),

  }),
});

export const {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
} = tagsApi;
