import { useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import { useAuth } from "../auth/useAuth";

export default function LoginPage() {
    const { userId, setStatus } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const submit = async () => {
        if (!password) return;

        try {
            setLoading(true);
            setError("");

            await axios.post(
                import.meta.env.VITE_API_URL + "/api/telegram/login",
                { user_id: userId, password }
            );

            setStatus("auth");
        } catch(err) {
            setError(err.response?.data?.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-icon">🔐</div>

                <h1 className="login-title">Вход менеджера</h1>
                <p className="login-subtitle">
                    Доступ только для авторизованных сотрудников
                </p>

                <div className="password-field">
                    <input
                        type={show ? "text" : "password"}
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submit()}
                        disabled={loading}
                    />

                    <button
                        type="button"
                        className="password-eye"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {show ? "🙈" : "👁️"}
                    </button>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button
                    className="login-btn"
                    onClick={submit}
                    disabled={loading || !password}
                >
                    {loading ? "Проверка…" : "Войти"}
                </button>
            </div>
        </div>
    );
}
