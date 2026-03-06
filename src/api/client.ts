export class WecandeoClient {
    private baseUrl = "https://api.wecandeo.com";
    private accessKey: string;

    constructor(accessKey: string) {
        this.accessKey = accessKey;
    }

    private async request(path: string, options: RequestInit = {}) {
        const url = path.startsWith("http") ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        const headers = {
            ...options.headers,
            "Accept": "application/json",
        };

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Wecandeo API Error (${response.status}): ${errorText}`);
        }
        return response.json();
    }

    async get(path: string, params?: Record<string, string>) {
        if (params) {
            const urlObj = path.startsWith("http") ? new URL(path) : new URL(`${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`);
            Object.entries(params).forEach(([key, value]) => {
                urlObj.searchParams.set(key, value);
            });
            return this.request(urlObj.toString(), { method: "GET" });
        }
        return this.request(path, { method: "GET" });
    }

    async post(path: string, data?: any) {
        return this.request(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    async put(path: string, data?: any) {
        return this.request(path, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    getAccessKey() {
        return this.accessKey;
    }
}
