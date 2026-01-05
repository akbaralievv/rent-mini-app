import { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './AppLayout.css';
export default function AppLayout({ title, children, onBack }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isRoot = location.pathname === "/";

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.BackButton) return;

        if (!isRoot) {
            tg.BackButton.show();
            tg.BackButton.onClick(() => navigate("/"));
        } else {
            tg.BackButton.hide();
        }

        return () => {
            tg.BackButton.offClick();
        };
    }, [isRoot, navigate]);
    
    return (
        <div className="app-layout">
            <div className="app-header">
                {!isRoot && (
                    <button className="back-arrow" onClick={onBack ? onBack : () => navigate("/")}>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}
                {title && <h1 className="app-title">{title}</h1>}
            </div>
            <main className="app-content">
                {children}
            </main>
        </div>
    );
}
