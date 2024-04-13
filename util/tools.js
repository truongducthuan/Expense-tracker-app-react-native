export function removeAccents(str) {
    const updateStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return updateStr;
}