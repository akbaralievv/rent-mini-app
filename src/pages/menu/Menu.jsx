
import AppLayout from "../../layouts/AppLayout";
import MenuItem from "../../components/MenuItem";
import "./Menu.css";
import ButtonSection from "../../components/ButtonSection/ButtonSection";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileSignature, FileText, FileUser, Newspaper, Palette } from "lucide-react";
import { useGetTagsQuery } from "../../redux/services/tagsAction";
import { useGetCompanyDocumentSectionsQuery } from "../../redux/services/getCompanySectionsAction";

export default function Menu() {
  const navigate = useNavigate();
  
  useGetTagsQuery();
  useGetCompanyDocumentSectionsQuery();

  return (
    <AppLayout title="Меню">
      <div className="menu-list">
        <ButtonSection
          title="Разделы"
          buttons={[
            {
              icon: <Newspaper strokeWidth={1.5} />,
              text: 'Статьи',
              onClick: () => navigate('/news')
            },
            {
              icon: <FileSignature strokeWidth={1.5} />,
              text: 'Договоры',
              onClick: () => navigate('/contracts')
            },
            {
              icon: <Palette strokeWidth={1.5} />,
              text: 'Шаблоны договоров',
              onClick: () => navigate('/contracts/templates')
            },
            {
              icon: <BarChart3 strokeWidth={1.5} />,
              text: 'Фин. отчет',
              onClick: () => navigate('/financial-main')
            },
          ]}
        />
        <ButtonSection
          title="Документы"
          buttons={[
            {
              icon: <FileText strokeWidth={1.5} />,
              text: 'Документы компании',
              onClick: () => navigate('/company-document')
            },
            {
              icon: <FileUser strokeWidth={1.5} />,
              text: 'Документы клиентов',
              onClick: () => navigate('/clients-document')
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}
