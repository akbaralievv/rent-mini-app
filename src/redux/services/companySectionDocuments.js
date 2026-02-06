import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const companySectionDocumentsApi = createApi({
  reducerPath: 'companySectionDocumentsApi',
  baseQuery,
  tagTypes: ['CompanySectionDocuments'],
  endpoints: (builder) => ({
    getCompanySectionDocuments: builder.query({
      query: ({ sectionId, from, to }) => ({
        url: `/company-document-sections/${sectionId}/documents`,
        params: {
          ...(from && { from }),
          ...(to && { to }),
        },
      }),
      providesTags: (result, error, { sectionId }) => [
        { type: 'CompanySectionDocuments', id: sectionId },
      ],
    }),

    createCompanySectionDocument: builder.mutation({
      query: ({ sectionId, formData }) => ({
        url: `/company-document-sections/${sectionId}/documents`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { sectionId }) => [
        { type: 'CompanySectionDocuments', id: sectionId },
      ],
    }),

    deleteCompanySectionDocument: builder.mutation({
      query: (id) => ({
        url: `/company-section-documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanySectionDocuments'],
    }),
  }),
});

export const {
  useGetCompanySectionDocumentsQuery,
  useCreateCompanySectionDocumentMutation,
  useDeleteCompanySectionDocumentMutation,
} = companySectionDocumentsApi;