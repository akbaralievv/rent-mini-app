export const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) return path;

    if (!path.startsWith("/storage")) {
        return `https://rentarenda.com/storage/${path}`;
    }

    return `https://rentarenda.com${path}`;
};