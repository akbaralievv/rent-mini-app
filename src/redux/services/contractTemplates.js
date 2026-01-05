import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const contractTemplatesApi = createApi({
  reducerPath: 'contractTemplatesApi',
  baseQuery,
  endpoints: (builder) => ({
    getContractTemplates: builder.query({
      query: () => '/contract-templates',
      providesTags: ['ContractTemplates'],
    }),

    getContractTemplate: builder.query({
      query: (id) => `/contract-templates/${id}`,
      providesTags: (result,error,id) => [{ type: 'ContractTemplate', id }],
    }),

    createContractTemplate: builder.mutation({
      query: (data) => ({
        url: '/contract-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContractTemplates'],
    }),

    updateContractTemplate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/contract-templates/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (r, e, { id }) => ['ContractTemplates', { type: 'ContractTemplate', id }],
    }),

    deleteContractTemplate: builder.mutation({
      query: (id) => ({
        url: `/contract-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContractTemplates'],
    }),
  }),
});

export const {
  useGetContractTemplatesQuery,
  useGetContractTemplateQuery,
  useCreateContractTemplateMutation,
  useUpdateContractTemplateMutation,
  useDeleteContractTemplateMutation,
} = contractTemplatesApi;
