import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const carsApi = createApi({
  reducerPath: 'carsApi',
  baseQuery,
  endpoints: (builder) => ({
    getCars: builder.query({
      query: () =>({
        url: '/cars/excel',
        params: {
          token: '',
        },
      })
    }),
  }),
});

export const { useGetCarsQuery } = carsApi;
