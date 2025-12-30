import { useEffect, useState } from "react";
import { useCheckAuthQuery } from "../redux/services/auth";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const tgUserId = 8563532803
    // window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null;

    const [userId] = useState(tgUserId);
    const [status, setStatus] = useState(
        tgUserId ? "loading" : "guest"
    );

    const { data, isLoading, isError } = useCheckAuthQuery(tgUserId, {
        skip: !tgUserId,
    });

    useEffect(() => {
        if (!tgUserId) return;

        if (isLoading) {
            setStatus("loading");
        } else if (isError || !data?.authorized) {
            setStatus("guest");
        } else if (data?.authorized) {
            setStatus("auth");
        }
    }, [tgUserId, data, isLoading, isError]);

    return (
        <AuthContext.Provider value={{ status, setStatus, userId }}>
            {children}
        </AuthContext.Provider>
    );
};
