import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const contractColorSchemesApi = createApi({
  reducerPath: 'contractColorSchemesApi ',
  baseQuery,
  endpoints: (builder) => ({
    getContractColorSchemes: builder.query({
      query: () => '/contract-color-schemes',
      providesTags: ['ContractColorSchemes'],
    }),

    createContractColorScheme: builder.mutation({
      query: (data) => ({
        url: '/contract-color-schemes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContractColorSchemes'],
    }),

    updateContractColorScheme: builder.mutation({
      query: ({ id, data }) => ({
        url: `/contract-color-schemes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ContractColorSchemes'],
    }),

    deleteContractColorScheme: builder.mutation({
      query: (id) => ({
        url: `/contract-color-schemes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContractColorSchemes'],
    }),
  }),
});

export const {
  useGetContractColorSchemesQuery,
  useCreateContractColorSchemeMutation,
  useUpdateContractColorSchemeMutation,
  useDeleteContractColorSchemeMutation,
} = contractColorSchemesApi;
