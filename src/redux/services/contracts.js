import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const contractsApi = createApi({
  reducerPath: 'contractsApi',
  baseQuery,
  endpoints: (builder) => ({
    getContracts: builder.query({
      query: () => '/contracts',
      providesTags: ['Contracts'],
    }),

    getContract: builder.query({
      query: (id) => `/contracts/${id}`,
      providesTags: (r, e, id) => [{ type: 'Contracts', id }],
    }),

    createContract: builder.mutation({
      query: (data) => ({
        url: '/contracts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contracts'],
    }),

    updateContract: builder.mutation({
      query: ({ id, data }) => ({
        url: `/contracts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (r, e, { id }) => ['Contracts', { type: 'Contracts', id }],
    }),

    deleteContract: builder.mutation({
      query: (id) => ({
        url: `/contracts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contracts'],
    }),
    sendToTelegram: builder.mutation({
      query: ({ contractId, chatId }) => ({
        url: `/contracts/${contractId}/send-to-telegram`,
        method: 'POST',
        body: { chat_id: chatId },
      }),
    })
  }),
});

export const {
  useGetContractsQuery,
  useGetContractQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation,
  useSendToTelegramMutation
} = contractsApi;
