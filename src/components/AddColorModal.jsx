import { useState } from 'react';

export default function AddColorModal({ onClose, onSave, saving }) {
    const [form, setForm] = useState({
        name: '',
        color: '#db281f',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.name.trim()) {
            alert('Название цвета обязательно');
            return;
        }

        onSave(form);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>

                <h2>Добавить цвет</h2>

                <div className='modal-form'>
                    <div>
                        <label>Название цвета</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Например: Red"
                            required
                        />
                    </div>

                    <div>
                        <label>Цвет (HEX)</label>
                        <div className="color-field">
                            <input
                                type="text"
                                name="color"
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                                placeholder="#db281f"
                                className="color-hex-input"
                            />

                            <label className="color-preview">
                                <input
                                    type="color"
                                    value={form.color}
                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                />
                                <span
                                    className="color-box"
                                    style={{ background: form.color }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="save-btn" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Сохранение…' : 'Сохранить'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
