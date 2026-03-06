import { createApi, } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery';

export const financeApi = createApi({
  reducerPath: 'financeApi',
  baseQuery,
  tagTypes: ['Transactions', 'Transaction', 'Summary'],

  endpoints: (builder) => ({

    // список транзакций
    getTransactions: builder.query({
      query: (params) => ({
        url: 'finance/transactions',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // транзакция по id
    getTransactionById: builder.query({
      query: (id) => `transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),

    // создание транзакции
    createTransaction: builder.mutation({
      query: (body) => ({
        url: 'finance/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transactions', 'Summary'],
    }),

    // обновление
    updateTransaction: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `finance/transactions/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Transactions', 'Transaction', 'Summary'],
    }),

    // удаление
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `finance/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions', 'Summary'],
    }),

    // загрузка attachment
    uploadTransactionAttachment: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData()
        formData.append('file', file)

        return {
          url: `finance/transactions/${id}/attachment`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Transactions', 'Transaction'],
    }),

    // удаление attachment
    deleteTransactionAttachment: builder.mutation({
      query: (id) => ({
        url: `finance/transactions/${id}/attachment`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions', 'Transaction'],
    }),

    // summary
    getFinanceSummary: builder.query({
      query: (params) => ({
        url: 'finance/summary',
        params,
      }),
      providesTags: ['Summary'],
    }),
  }),
})

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useUploadTransactionAttachmentMutation,
  useDeleteTransactionAttachmentMutation,
  useGetFinanceSummaryQuery,
} = financeApi