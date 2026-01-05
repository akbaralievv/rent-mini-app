import { useGetContractTemplatesQuery } from '../../../redux/services/contractTemplates';

export default function StepTemplate({ state, setState }) {
  const { data: templates = [], isLoading: templatesLoading, isError: templatesError } = useGetContractTemplatesQuery();

  return (
    <div className="card">
      <h2>🎨 Выберите шаблон договора</h2>
      {state.template && (
        <div className="step-selected">
          Выбран шаблон: <b>{state.template.name}</b>
        </div>
      )}
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
                <b>{tpl.name}</b>
              </div>
            )
          })}
        </div>}
    </div>
  )
}
