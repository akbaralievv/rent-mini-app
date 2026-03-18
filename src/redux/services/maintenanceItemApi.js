import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const maintenanceItemApi = createApi({
  reducerPath: 'maintenanceItemApi',
  baseQuery,
  tagTypes: ['MaintenanceItem'],
  endpoints: (builder) => ({

    // 📥 список по машине
    getByCar: builder.query({
      query: (carId) => `/cars/${carId}/maintenance-items`,
      providesTags: ['MaintenanceItem'],
    }),

    // 📥 один элемент
    getOne: builder.query({
      query: (id) => `/maintenance-items/${id}`,
      providesTags: ['MaintenanceItem'],
    }),

    // ➕ создание (с файлами)
    create: builder.mutation({
      query: (data) => {
        const formData = new FormData();

        formData.append('car_number', data.car_id);
        formData.append('name', data.name);
        formData.append('location', data.location);
        formData.append('status', data.status);
        formData.append('date_start', data.date_start);
        formData.append('date_end', data.date_end);

        if (data.images) {
          data.images.forEach((file) => {
            formData.append('images[]', file);
          });
        }

        return {
          url: `/maintenance-items`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MaintenanceItem'],
    }),

    // ✏️ обновление (с файлами)
    update: builder.mutation({
      query: ({ id, ...data }) => {
        const formData = new FormData();

        formData.append('_method', 'PUT'); // важно для Laravel
        formData.append('car_number', data.car_id);
        formData.append('name', data.name);
        formData.append('location', data.location);
        formData.append('status', data.status);
        formData.append('date_start', data.date_start);
        formData.append('date_end', data.date_end);

        if (data.images) {
          data.images.forEach((file) => {
            formData.append('images[]', file);
          });
        }

        return {
          url: `/maintenance-items/${id}`,
          method: 'POST', // Laravel form-data hack
          body: formData,
        };
      },
      invalidatesTags: ['MaintenanceItem'],
    }),

    // ❌ удаление
    delete: builder.mutation({
      query: (id) => ({
        url: `/maintenance-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MaintenanceItem'],
    }),

  }),
});

export const {
  useGetByCarQuery,
  useGetOneQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = maintenanceItemApi;