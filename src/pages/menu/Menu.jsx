
import AppLayout from "../../layouts/AppLayout";
import "./Menu.css";
import ButtonSection from "../../components/ButtonSection/ButtonSection";
import Dashboard from "../../components/Dashboard/Dashboard";
import { useNavigate } from "react-router-dom";
import { Activity, BarChart3, Car, ClipboardList, FileSignature, FileText, FileUser, History, MessageSquareMore, Newspaper, Palette, StickyNote, UserCircle } from "lucide-react";
import { tgTheme } from "../../common/commonStyle";
import { useGetTagsQuery } from "../../redux/services/tagsAction";
import { useGetCompanyDocumentSectionsQuery } from "../../redux/services/getCompanySectionsAction";
import { useGetManagersQuery } from "../../redux/services/managersApi";
import { useAuth } from "../../auth/useAuth";

export default function Menu() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  useGetTagsQuery();
  useGetCompanyDocumentSectionsQuery();

  const { data: managersData } = useGetManagersQuery({ per_page: 50, page: 1 });
  const manager = managersData?.data?.find((m) => String(m.user_id) === String(userId)) || null;

  return (
    <AppLayout title="Меню">
      <div className="menu-profile-bar">
        <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
          {manager?.name
            ? `${manager.name} (${manager.user_id})`
            : manager?.user_id || 'Пользователь'}
        </span>
        <button className="menu-profile-btn" onClick={() => navigate('/profile')}>
          <UserCircle size={28} color={tgTheme.text} strokeWidth={1.5} />
        </button>
      </div>
      <div className="menu-list">
        <Dashboard />
        <ButtonSection
          title="Разделы"
          buttons={[
            {
              icon: <BarChart3 strokeWidth={1.5} />,
              text: 'Фин. отчет',
              onClick: () => navigate('/financial-main')
            },
            {
              icon: <Car strokeWidth={1.5} />,
              text: 'Список авто',
              onClick: () => navigate('/cars')
            },
            {
              icon: <MessageSquareMore strokeWidth={1.5} />,
              text: 'Все чаты',
              onClick: () => navigate('/all-chats')
            },
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
              icon: <StickyNote strokeWidth={1.5} />,
              text: 'Заметки',
              onClick: () => navigate('/notes')
            },
            {
              icon: <History strokeWidth={1.5} />,
              text: 'Активность менеджеров',
              onClick: () => navigate('/manager-list')
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
