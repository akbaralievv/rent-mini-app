import { useEffect, useRef, useState } from 'react';
import './ColorSelect.css'
import AddColorModal from './AddColorModal';
import { useDeleteContractColorSchemeMutation } from '../redux/services/contractColorShemes';
import { getErrorMessage } from '../utils';

export default function ColorSelect({ value, options, onChange, onAdd, loading, disabled }) {
    const [open, setOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const ref = useRef(null);
    const [deleteColor, { isLoading: deleting }] =
        useDeleteContractColorSchemeMutation();

    const selected = options.find((o) => o.id === value);

    useEffect(() => {
        const onClick = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleDelete = async (e, color) => {
        e.stopPropagation();

        if (!window.confirm(`Удалить цвет "${color.name}"?`)) return;

        try {
            await deleteColor(color.id).unwrap();

            if (value === color.id) {
                const def = options.find((c) => c.is_default);
                onChange(def?.id || null);
            }

            alert(`Цвет "${color.name}" удалён`);
        } catch (err) {
            alert(getErrorMessage(err, 'Не удалось удалить цвет'));
        }
    };

    return (
        <div className="color-select-wrapper" ref={ref}>
            <div
                className="color-select-input"
                onClick={disabled ? undefined : () => setOpen((v) => !v)}
            >
                {selected ? (
                    <>
                        <span
                            className="color-dot"
                            style={{ background: selected.color }}
                        />
                        <span>{selected.name} - {selected.color}</span>
                    </>
                ) : (
                    <span className="placeholder">Выберите цвет</span>
                )}
            </div>

            {open && (
                <div className="color-select-dropdown">
                    <div className='color-options-scroll'>
                        {options.map((c) => (
                            <div
                                key={c.id}
                                className={`color-option ${value === c.id ? 'active' : ''
                                    }`}
                                onClick={() => {
                                    onChange(c.id);
                                    setOpen(false);
                                }}
                            >
                                <span
                                    className="color-dot"
                                    style={{ background: c.color }}
                                />
                                <span className='color-name'>{c.name} - {c.color}</span>

                                {c.is_default ? (
                                    <span className="badge">по умолчанию</span>
                                ) : null}
                                {!c.is_system && (
                                    <button
                                        type="button"
                                        className="delete-color-btn"
                                        disabled={deleting}
                                        onClick={(e) => handleDelete(e, c)}
                                    >
                                        {deleting ? '...' : '✕'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="color-select-footer">
                        <button
                            type="button"
                            className="add-color-btn"
                            onClick={() => setShowModal(true)}
                        >
                            + Добавить цвет
                        </button>
                    </div>
                </div>
            )}
            {showModal && (
                <AddColorModal
                    onClose={() => {
                        setShowModal(false);
                        setOpen(false);
                    }}
                    onSave={async (data) => {
                        await onAdd(data);
                        setShowModal(false);
                        setOpen(false);
                    }}
                    saving={loading}
                />
            )}
        </div>
    );
}
