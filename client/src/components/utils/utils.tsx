import { CachedData } from "../../types/CachedData";

export const getCachedData = (key: string): CachedData | null => {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) return null;

    const { data, timestamp } = JSON.parse(cachedItem);

    const dateParts = timestamp.match(/(\w+), (\w+) (\d+), (\d+) at (\d+):(\d+) (\w+) (\w+)/);

    if (!dateParts) {
        localStorage.removeItem(key);
        return null;
    }

    const [_, _day, month, date, year, hour, minute, period, _tz] = dateParts;
    let hours = parseInt(hour, 10);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const isoString = `${month} ${date}, ${year} ${hours}:${minute}:00 GMT-0400`;
    const parsedTime = Date.parse(isoString);

    if (isNaN(parsedTime) || Date.now() - parsedTime > 3600000) {
        localStorage.removeItem(key);
        return null;
    }

    return { data, timestamp };
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