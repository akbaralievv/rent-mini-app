import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery,
  endpoints: (builder) => ({
    getOrdersByCar: builder.query({
      query: (carNumber) => ({
        url: `/car/orders/${carNumber}`,
        params: {
          token: '',
        },
      }),
    }),
  }),
});

export const { useGetOrdersByCarQuery } = ordersApi;
