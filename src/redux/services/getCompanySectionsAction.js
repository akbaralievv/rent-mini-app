import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const companyDocumentSectionsApi = createApi({
  reducerPath: 'companyDocumentSectionsApi',
  baseQuery,
  tagTypes: ['CompanyDocumentSections'],
  endpoints: (builder) => ({

    // 🔹 получить список подразделов
    getCompanyDocumentSections: builder.query({
      query: () => '/company-document-sections',
      providesTags: ['CompanyDocumentSections'],
    }),

    // 🔹 создать подраздел
    createCompanyDocumentSection: builder.mutation({
      query: (data) => ({
        url: '/company-document-sections',
        method: 'POST',
        body: data, // { name }
      }),
      invalidatesTags: ['CompanyDocumentSections'],
    }),

    // 🔹 обновить подраздел
    updateCompanyDocumentSection: builder.mutation({
      query: ({ id, name }) => ({
        url: `/company-document-sections/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CompanyDocumentSections', id },
        'CompanyDocumentSections',
      ],
    }),

    // 🔹 удалить подраздел
    deleteCompanyDocumentSection: builder.mutation({
      query: (id) => ({
        url: `/company-document-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanyDocumentSections'],
    }),

  }),
});

export const {
  useGetCompanyDocumentSectionsQuery,
  useCreateCompanyDocumentSectionMutation,
  useUpdateCompanyDocumentSectionMutation,
  useDeleteCompanyDocumentSectionMutation,
} = companyDocumentSectionsApi;
