const API_URL = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    if (!path.startsWith('/storage')) {
        return `${API_URL}/storage/${path}`;
    }

    return `${API_URL}${path}`;
};

export const getErrorMessage = (error, fallback = 'Неизвестная ошибка') => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error instanceof Error && error.message) return error.message;

    if (typeof error === 'object') {
        const data = error.data;
        if (typeof data === 'string' && data.trim()) return data;

        if (data && typeof data === 'object') {
            const message = data.message || data.error || data.detail || data.title;
            if (typeof message === 'string' && message.trim()) return message;
        }

        if (typeof error.error === 'string' && error.error.trim()) return error.error;
        if (typeof error.message === 'string' && error.message.trim()) return error.message;
    }

    try {
        const asJson = JSON.stringify(error);
        return asJson && asJson !== '{}' ? asJson : fallback;
    } catch {
        return fallback;
    }
};