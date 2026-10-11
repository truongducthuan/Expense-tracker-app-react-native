export function removeAccents(str) {
    const updateStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return updateStr;
}

// Key used to match an account/category name that was typed or seeded in a
// different form. NFD alone is not enough for Vietnamese: "\u0111"/"\u0110" carry no
// combining mark, so they survive the strip and "\u0110\u1ed3ng" would never match
// "dong". Comparison is also case-insensitive and trims stray spaces.
export function normalizeName(str) {
    return String(str ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d")
        .replace(/\u0110/g, "D")
        .trim()
        .toLowerCase();
}