export const equalsIgnoreCase = (str1, str2) => {
    if (str1 && !str2) {
        return false;
    }
    if (!str1 && str2) {
        return false;
    }

    if (!str1 && !str2) {
        return false;
    }

    const trimmedStr1 = str1.trim();
    const trimmedStr2 = str2.trim();

    return trimmedStr1.toUpperCase() === trimmedStr2.toUpperCase();
};
