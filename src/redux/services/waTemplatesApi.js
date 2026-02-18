import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const waTemplatesApi = createApi({
  reducerPath: 'waTemplatesApi',
  baseQuery,
  tagTypes: ['WaTemplates'],
  endpoints: (builder) => ({

    getTemplates: builder.query({
      query: () => '/wa/templates',
      providesTags: ['WaTemplates'],
    }),

    getTemplate: builder.query({
      query: (id) => `/wa/templates/${id}`,
    }),

    createTemplate: builder.mutation({
      query: (body) => ({
        url: '/wa/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WaTemplates'],
    }),

    updateTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/wa/templates/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['WaTemplates'],
    }),

    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/wa/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WaTemplates'],
    }),

    getAutoTemplate: builder.query({
      query: () => '/wa/templates/auto',
    }),

    setAutoTemplate: builder.mutation({
      query: (id) => ({
        url: `/wa/templates/${id}/set-auto`,
        method: 'POST',
      }),
      invalidatesTags: ['WaTemplates'],
    }),

    clearAutoTemplate: builder.mutation({
      query: () => ({
        url: `/wa/templates/clear-auto`,
        method: 'POST',
      }),
      invalidatesTags: ['WaTemplates'],
    }),

  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useGetAutoTemplateQuery,
  useSetAutoTemplateMutation,
  useClearAutoTemplateMutation,
} = waTemplatesApi;
