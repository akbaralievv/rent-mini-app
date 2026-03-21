import { createApi, } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery';

const FALLBACK_EXPORT_FILENAME = 'finance_transactions_export.xlsx';

function getExportFileName(contentDisposition) {
  if (!contentDisposition) return FALLBACK_EXPORT_FILENAME;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]).replace(/["']/g, '');
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return FALLBACK_EXPORT_FILENAME;
}

export const financeApi = createApi({
  reducerPath: 'financeApi',
  baseQuery,
  tagTypes: ['Transactions', 'Transaction', 'Summary'],

  endpoints: (builder) => ({

    // транзакции по машине
    getTransactionsByCar: builder.query({
      query: (carNumber) => `finance/cars/${carNumber}/transactions`,
      providesTags: ['Transactions'],
    }),

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
      query: (id) => `finance/transactions/${id}`,
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
      query: ({ id, body }) => ({
        url: `finance/transactions/${id}`,
        method: 'PUT',
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

    // загрузка attachments (несколько файлов)
    uploadTransactionAttachments: builder.mutation({
      query: ({ id, files }) => {
        const formData = new FormData()
        files.forEach((file) => formData.append('files[]', file))

        return {
          url: `finance/transactions/${id}/attachments`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Transaction'],
    }),

    // удаление одного attachment
    deleteTransactionAttachment: builder.mutation({
      query: ({ transactionId, attachmentId }) => ({
        url: `finance/transactions/${transactionId}/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transaction'],
    }),

    // summary
    getFinanceSummary: builder.query({
      query: (params) => ({
        url: 'finance/summary',
        params,
      }),
      providesTags: ['Summary'],
    }),
    exportTransactions: builder.mutation({
      async queryFn(params, api, extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: 'finance/transactions/export',
          params,
          responseHandler: async (response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        const contentDisposition =
          result.meta?.response?.headers.get('Content-Disposition') ||
          result.meta?.response?.headers.get('content-disposition');

        return {
          data: {
            blob: result.data,
            fileName: getExportFileName(contentDisposition),
          },
        };
      },
    }),
  }),
})

export const {
  useGetTransactionsByCarQuery,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useUploadTransactionAttachmentsMutation,
  useDeleteTransactionAttachmentMutation,
  useGetFinanceSummaryQuery,
  useExportTransactionsMutation,
} = financeApi