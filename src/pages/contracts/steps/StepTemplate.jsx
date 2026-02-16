import { tgTheme } from '../../../common/commonStyle';
import { useGetContractTemplatesQuery } from '../../../redux/services/contractTemplates';
import PreviewContract from '../components/PreviewContract/PreviewContract';

export default function StepTemplate({ state, setState }) {
  const { data: templates = [], isLoading: templatesLoading, isError: templatesError } = useGetContractTemplatesQuery();

  return (
    <div className="card">
      <PreviewContract
        visible={state.template}
        list={[
          {
            key: 'Выбран шаблон',
            value: state.template?.name || ''
          }
        ]}
      />
      <h2>🎨 Выберите шаблон договора</h2>

      {templatesLoading ? <div className="loader-wrap">
        <div className="loader" />
      </div> : (templatesError) ? <p className="error">Ошибка загрузки шаблонов или цветовых схем</p> :
        templates?.length === 0 ? <p className="hint">Нет доступных шаблонов договоров</p> :
          <div className="select-list">
            {templates?.map((tpl) => {
              return (
                <div
                  key={tpl.id}
                  className={`select-card ${state.template?.id === tpl.id ? 'active' : ''}`}
                  onClick={() => setState((s) => ({
                    ...s,
                    template: tpl,
                  }))}>
                  <b style={{ color: state.template?.id === tpl.id ? tgTheme.white : tgTheme.textSecondary }}>{tpl.name}</b>
                </div>
              )
            })}
          </div>}
    </div>
  )
}
