import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery'

export const carApi = createApi({
  reducerPath: 'carsApi',
  baseQuery,
  tagTypes: ['Cars', 'Car', 'Orders', 'Images', 'Stats', 'Brands', 'Models'],
  endpoints: (builder) => ({

    // cars

    getCars: builder.query({
      query: (params) => ({
        url: '/cars',
        params,
      }),
      providesTags: ['Cars'],
    }),

    getCarByNumber: builder.query({
      query: (carNumber) => `/car/show/${carNumber}`,
      providesTags: (result, error, carNumber) => [
        { type: 'Car', id: carNumber },
      ],
    }),

    createCar: builder.mutation({
      query: (data) => ({
        url: '/car',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cars'],
    }),

    deleteCar: builder.mutation({
      query: (carNumber) => ({
        url: `/car/${carNumber}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cars'],
    }),

    updateCarModel: builder.mutation({
      query: ({ carNumber, model }) => ({
        url: `/car/${carNumber}/model`,
        method: 'PUT',
        body: { model },
      }),
      invalidatesTags: (r, e, { carNumber }) => [
        { type: 'Car', id: carNumber },
        'Cars',
      ],
    }),

    updateCarTechField: builder.mutation({
      query: ({ carNumber, field, value }) => ({
        url: `/car/${carNumber}/tech`,
        method: 'PATCH',
        body: { field, value },
      }),
      invalidatesTags: (r, e, { carNumber }) => [
        { type: 'Car', id: carNumber },
      ],
    }),

    changeCarStatus: builder.mutation({
      query: ({ carNumber, status }) => ({
        url: `/car/${carNumber}/status/${status}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Cars'],
    }),

    toggleB2CStatus: builder.mutation({
      query: (carNumber) => ({
        url: `/car/${carNumber}/b2c-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Cars'],
    }),

    //stats

    getCarStats: builder.query({
      query: (params) => ({
        url: '/cars/stats',
        params,
      }),
      providesTags: ['Stats'],
    }),

    //orders

    getCarOrders: builder.query({
      query: (carNumber) => `/car/${carNumber}/orders`,
      providesTags: ['Orders'],
    }),

    createOrder: builder.mutation({
      query: ({ carNumber, data }) => ({
        url: `/order/${carNumber}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Orders', 'Stats'],
    }),

    updateOrder: builder.mutation({
      query: ({ orderId, data }) => ({
        url: `/order/${orderId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Orders', 'Stats'],
    }),

    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/order/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders', 'Stats'],
    }),

    //images

    getCarImages: builder.query({
      query: (carNumber) => `/car/${carNumber}/images`,
      providesTags: ['Images'],
    }),

    uploadCarImages: builder.mutation({
      query: ({ carNumber, formData }) => ({
        url: `/car/${carNumber}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Images'],
    }),

    deleteCarImages: builder.mutation({
      query: (carNumber) => ({
        url: `/car/${carNumber}/images`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Images'],
    }),

    //brands or models

    getClasses: builder.query({
      query: () => '/car/classes',
    }),

    getBrands: builder.query({
      query: () => '/car/brands',
      providesTags: ['Brands'],
    }),

    getModels: builder.query({
      query: () => '/car/models',
      providesTags: ['Models'],
    }),

    getBrandCars: builder.query({
      query: (brandId) => `/car/brand/${brandId}`,
      providesTags: ['Cars'],
    }),

    getModelCars: builder.query({
      query: (modelId) => `/car/model/${modelId}`,
      providesTags: ['Cars'],
    }),

  }),
})

export const {
  useGetCarsQuery,
  useGetCarByNumberQuery,
  useCreateCarMutation,
  useDeleteCarMutation,
  useUpdateCarModelMutation,
  useUpdateCarTechFieldMutation,
  useChangeCarStatusMutation,
  useToggleB2CStatusMutation,

  useGetCarStatsQuery,

  useGetCarOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,

  useGetCarImagesQuery,
  useUploadCarImagesMutation,
  useDeleteCarImagesMutation,

  useGetClassesQuery,
  useGetBrandsQuery,
  useGetModelsQuery,
  useGetBrandCarsQuery,
  useGetModelCarsQuery,
} = carApi
