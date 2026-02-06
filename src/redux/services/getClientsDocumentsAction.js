import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const clientDocumentsApi = createApi({
	reducerPath: 'clientDocumentsApi',
	baseQuery,
	tagTypes: ['ClientDocuments'],
	endpoints: (builder) => ({
		getClientDocuments: builder.query({
			query: ({ from, to } = {}) => ({
				url: '/client-documents',
				params: {
					...(from && { from }),
					...(to && { to }),
				},
			}),
			providesTags: ['ClientDocuments'],
		}),

		createClientDocument: builder.mutation({
			query: (formData) => ({
				url: '/client-documents',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: ['ClientDocuments'],
		}),

		deleteClientDocument: builder.mutation({
			query: (id) => ({
				url: `/client-documents/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['ClientDocuments'],
		}),
	}),
});

export const {
	useGetClientDocumentsQuery,
	useCreateClientDocumentMutation,
	useDeleteClientDocumentMutation,
} = clientDocumentsApi;
