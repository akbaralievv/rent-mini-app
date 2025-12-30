
import AppLayout from "../../layouts/AppLayout";
import MenuItem from "../../components/MenuItem";
import "./Menu.css";

export default function Menu() {
    return (
        <AppLayout title="Меню">
            <div className="menu-list">
                <MenuItem icon="📰" title="Статьи" to="/news" />
                <MenuItem icon="📄" title="Договора" to="/contracts" />
            </div>
        </AppLayout>
    );
}
