import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery,
  tagTypes: ['OrderDocs'],
  endpoints: (builder) => ({
    getOrdersByCar: builder.query({
      query: (carNumber) => ({
        url: `/car/orders/${carNumber}`,
        params: {
          token: '',
        },
      }),
    }),

    getAllOrders: builder.query({
      query: () => ({
        url: `/ordersDocs`,
      }),
    }),

    getOrderDocuments: builder.query({
      query: (orderId) => `/orderDocs/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'OrderDocs', id: orderId }],
    }),

    uploadOrderDocument: builder.mutation({
      query: ({ orderId, formData }) => ({
        url: `/orderDocs/${orderId}`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'OrderDocs', id: arg.orderId }],
    }),

    deleteOrderDocument: builder.mutation({
      query: (docId) => ({
        url: `/orderDocs/${docId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrderDocs'],
    }),
  }),
});

export const {
  useGetOrdersByCarQuery,
  useGetAllOrdersQuery,
  useGetOrderDocumentsQuery,
  useUploadOrderDocumentMutation,
  useDeleteOrderDocumentMutation,
} = ordersApi;
