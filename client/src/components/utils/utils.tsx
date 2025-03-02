export const getCachedData = (key: string): any => {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) return null;
    const { data, timestamp } = JSON.parse(cachedItem);
    if (Date.now() - timestamp > 3600000) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
};

export const setCachedData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

export const fetchData = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching data from ${url}`);
    }
    return response.json();
};