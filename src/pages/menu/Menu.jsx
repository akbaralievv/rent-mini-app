
import AppLayout from "../../layouts/AppLayout";
import MenuItem from "../../components/MenuItem";
import "./Menu.css";
import ButtonSection from "../../components/ButtonSection/ButtonSection";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileSignature, Newspaper, Palette } from "lucide-react";

export default function Menu() {
  const navigate = useNavigate();
  return (
    <AppLayout title="Меню">
      <div className="menu-list">
        <ButtonSection
          buttons={[
            {
              icon: <Newspaper strokeWidth={1.5}/>,
              text: 'Статьи',
              onClick: () => navigate('/news')
            },
            {
              icon: <FileSignature strokeWidth={1.5}/>,
              text: 'Договоры',
              onClick: () => navigate('/contracts')
            },
            {
              icon: <Palette strokeWidth={1.5}/>,
              text: 'Шаблоны договоров',
              onClick: () => navigate('/contracts/templates')
            },
            {
              icon: <BarChart3 strokeWidth={1.5}/>,
              text: 'Фин. отчет',
              onClick: () => navigate('/financial-main')
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}
