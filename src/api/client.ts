export class WecandeoClient {
    private baseUrl = "https://support.wecandeo.com/api/v1"; // Need to verify correct base URL from docs
    private accessKey: string;

    constructor(accessKey: string) {
        this.accessKey = accessKey;
    }

    private async request(path: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            ...options.headers,
            "x-wecandeo-access-key": this.accessKey,
            "Accept": "application/json",
        };

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            // Some APIs might return success info even in non-200, check docs
            const errorText = await response.text();
            throw new Error(`Wecandeo API Error (${response.status}): ${errorText}`);
        }
        return response.json();
    }

    // API placeholders to be implemented in tools/
    async get(path: string, params?: Record<string, string>) {
        const searchParams = new URLSearchParams(params);
        return this.request(`${path}?${searchParams.toString()}`, { method: "GET" });
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
}
