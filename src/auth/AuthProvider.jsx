import { useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null;

    const [userId] = useState(tgUserId);
    const [status, setStatus] = useState(
        tgUserId ? "loading" : "guest"
    );

    useEffect(() => {
        if (!tgUserId) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await axios.get(
                    import.meta.env.VITE_API_URL + "/api/telegram/check",
                    { params: { user_id: tgUserId } }
                );

                if (!cancelled) {
                    setStatus(res.data.authorized ? "auth" : "guest");
                }
            } catch {
                if (!cancelled) {
                    setStatus("guest");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [tgUserId]);

    return (
        <AuthContext.Provider value={{ status, setStatus, userId }}>
            {children}
        </AuthContext.Provider>
    );
};
