import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './services/auth';
import { newsApi } from './services/news';
import { contractsApi } from './services/contracts';
import { contractColorSchemesApi } from './services/contractColorShemes';
import { contractTemplatesApi } from './services/contractTemplates';
import { ordersApi } from './services/orders';
import { carsApi } from './services/cars';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [newsApi.reducerPath]: newsApi.reducer,
    [contractsApi.reducerPath]: contractsApi.reducer,
    [carsApi.reducerPath]: carsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [contractColorSchemesApi.reducerPath]: contractColorSchemesApi.reducer,
    [contractTemplatesApi.reducerPath]: contractTemplatesApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      newsApi.middleware,
      contractsApi.middleware,
      carsApi.middleware,
      ordersApi.middleware,
      contractTemplatesApi.middleware,
      contractColorSchemesApi.middleware,
    ),
});

setupListeners(store.dispatch);
