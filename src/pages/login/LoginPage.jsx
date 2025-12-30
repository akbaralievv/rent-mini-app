import { useState } from "react";
import "./LoginPage.css";
import { useAuth } from "../../auth/useAuth";
import { useLoginMutation } from "../../redux/services/auth";

export default function LoginPage() {
    const { userId, setStatus } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);
    const [login, { isLoading: loading }] = useLoginMutation();

    const submit = async () => {
        if (!password) return;

        try {
            setError("");
            await login({ userId, password }).unwrap();
            setStatus("auth");
        } catch(err) {
            setError(err.data?.message || "Ошибка входа");
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
                        type="text"
                        className={show ? "" : "masked"}
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
