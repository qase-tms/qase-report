export const generateId = (key: string):string => {
    return `${key}#${Math.random().toFixed(10).substring(2)}_${Date.now()}`;
}