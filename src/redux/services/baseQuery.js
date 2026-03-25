import { fetchBaseQuery } from '@reduxjs/toolkit/query';

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL + '/api',
  prepareHeaders: (headers) => {
    const tg = window.Telegram?.WebApp;
    const id = tg?.initDataUnsafe?.user?.id;
    if (id) {
      headers.set('X-Telegram-User', id.toString());
    }
    return headers;
  },
});
