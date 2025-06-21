import { DataTable } from 'primereact/datatable';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { ProgressBar } from 'primereact/progressbar';
import { useTranslation } from 'react-i18next';
import { Avatar } from 'primereact/avatar';

const TaskSection = ({ nomeTarefa, tarefas, onToggle }) => {
    const { t } = useTranslation();

    const [subtasks, setSubtasks] = useState(tarefas);

    const progresso = Math.round(
        (subtasks.filter((t) => t.status === 'concluído').length / subtasks.length) * 100
    );

    const handleStatusChange = (rowData) => {
        const updatedTasks = subtasks.map((t) => {
            if (t.nome === rowData.nome) {
                return {
                    ...t,
                    status: t.status === 'concluído' ? 'pendente' : 'concluído',
                };
            }
            return t;
        });
        setSubtasks(updatedTasks);
    };

    const colaboradores = Array.from(
        new Set(tarefas.map((t) => t.responsavel).filter(Boolean))
    );

    const statusTemplate = (rowData) => {

        const isFinished = rowData.status === 'concluído';

        return (
            <span
                className={`status-badge ${isFinished ? 'concluido' : 'pendente'}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: isFinished ? 'var(--green-dark-color)' : 'var(--error-red-color)',
                    color: 'var(--white-color)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500'
                }}
            >
                {isFinished ? (
                    <MdCheckCircle size={16} />
                ) : (
                    <MdPendingActions size={16} />
                )}
                {rowData.status}
            </span>
        )
    }

    const renderAvatares = () => (
        <div className='colaboradores d-flex align-items-center ms-3'>
            {
                colaboradores.map((response, index) => (
                    <Avatar
                        key={index}
                        label={response?.charAt(0).toUpperCase()}
                        title={response}
                        size="small"
                        shape="circle"
                        className="me-1"
                        style={{ backgroundColor: '#6C63FF', color: '#fff' }}>

                    </Avatar>
                ))
            }
        </div>
    );

    const checkboxTemplate = (rowData) => (
        <Checkbox
            onChange={() => handleStatusChange(rowData)}
            checked={rowData.status === 'concluído'}
        />
    );

    return (
        <div className='task-section'>
            <div className='task-header row' onClick={onToggle}>
                <span className='task-title col-12 col-lg-6 p-0 d-flex align-items-center'>
                    <Checkbox
                        checked={progresso === 100}
                        disabled
                        className='me-2'>
                    </Checkbox>
                    {nomeTarefa}
                    {renderAvatares()}
                </span>

                <span className="task-data col-12 col-lg-6 px-0 d-flex align-items-center justify-content-end">
                    <div className="task-progress d-flex align-items-center">
                        <ProgressBar value={progresso} style={{ height: '1rem', width: '8rem' }}></ProgressBar>
                        <span className="ms-2">{progresso}%</span>
                    </div>

                    <span className="expand-icon ms-3">
                        {expanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                    </span>
                </span>
            </div>

            {expanded && (
                <div className="task-table-container mt-3">
                    <DataTable
                        value={subtasks}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage={t('viewProject.noTasks')}
                    >
                        <Column body={checkboxTemplate} style={{ width: '50px' }}></Column>
                        <Column field="nome" header={t('viewProject.taskHeaderTask')}></Column>
                        <Column field="responsavel" header={t('viewProject.taskHeaderResponsible')}></Column>
                        <Column field="prazo" header={t('viewProject.taskHeaderDueDate')}></Column>
                        <Column
                            field="status"
                            header={t('viewProject.taskHeaderStatus')}
                            body={statusTemplate}
                        ></Column>
                    </DataTable>
                </div>
            )}

        </div>
    );
};

export default TaskSection;