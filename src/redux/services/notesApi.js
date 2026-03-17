import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const notesApi = createApi({
  reducerPath: 'notesApi',
  baseQuery,
  tagTypes: ['Notes', 'Attachments'],
  endpoints: (builder) => ({

    getNotes: builder.query({
      query: (limit = 10) => ({
        url: '/notes',
        params: { limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map((note) => ({
              type: 'Notes',
              id: note.id,
            })),
            { type: 'Notes', id: 'LIST' },
          ]
          : [{ type: 'Notes', id: 'LIST' }],
    }),

    getNoteById: builder.query({
      query: (id) => ({
        url: `/notes/${id}`,
      }),
      providesTags: (result, error, id) => [
        { type: 'Notes', id },
      ],
    }),

    createNote: builder.mutation({
      query: (body) => ({
        url: '/notes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
    }),

    updateNote: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/notes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Notes', id },
      ],
    }),

    deleteNote: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
    }),

    getAttachments: builder.query({
      query: (noteId) => ({
        url: `/notes/${noteId}/attachments`,
      }),
      providesTags: (result, error, noteId) =>
        result?.data
          ? [
            ...result.data.map((att) => ({
              type: 'Attachments',
              id: att.id,
            })),
            { type: 'Attachments', id: `LIST-${noteId}` },
          ]
          : [{ type: 'Attachments', id: `LIST-${noteId}` }],
    }),

    createAttachment: builder.mutation({
      query: ({ noteId, formData }) => ({
        url: `/notes/${noteId}/attachments`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: 'Attachments', id: `LIST-${noteId}` },
      ],
    }),

    deleteAttachment: builder.mutation({
      query: (attachmentId) => ({
        url: `/note-attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, attachmentId) => [
        { type: 'Attachments', id: attachmentId },
      ],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteByIdQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,

  useGetAttachmentsQuery,
  useCreateAttachmentMutation,
  useDeleteAttachmentMutation,
} = notesApi;