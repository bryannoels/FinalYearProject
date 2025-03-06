import { CachedData } from "../../types/CachedData";

export const getCachedData = (key: string): CachedData | null => {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) return null;

    const { data, timestamp } = JSON.parse(cachedItem);

    if (Date.now() - new Date(timestamp).getTime() > 3600000) {
        localStorage.removeItem(key);
        return null;
    }

    return {
        data,
        timestamp,
    };
};

export const setCachedData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify({ data: data.data, timestamp: data.timestamp }));
};

export const fetchData = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching data from ${url}`);
    }
    return response.json();
};