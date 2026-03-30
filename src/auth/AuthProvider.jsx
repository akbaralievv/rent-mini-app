import { useMemo, useState } from 'react';
import { useCheckAuthQuery } from '../redux/services/auth';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null;;

  const [userId] = useState(tgUserId);

  const { data, isLoading, isError } = useCheckAuthQuery(tgUserId, {
    skip: !tgUserId,
  });

  const status = useMemo(() => {
    if (!tgUserId) return 'guest';
    if (isLoading) return 'loading';
    if (isError || !data?.authorized) return 'guest';
    return 'auth';
  }, [tgUserId, isLoading, isError, data]);

  return <AuthContext.Provider value={{ userId, status }}>{children}</AuthContext.Provider>;
};
