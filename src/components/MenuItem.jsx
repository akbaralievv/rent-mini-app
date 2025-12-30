import { useNavigate } from "react-router-dom";

export default function MenuItem({ icon, title, to }) {
    const navigate = useNavigate();

    return (
        <div className="menu-item" onClick={() => navigate(to)}>
            <div className="menu-left">
                <span className="menu-icon">{icon}</span>
                <span className="menu-title">{title}</span>
            </div>
            <span className="menu-arrow">›</span>
        </div>
    );
}
