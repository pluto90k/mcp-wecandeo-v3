export class WecandeoClient {
    private baseUrl = "https://api.wecandeo.com";
    private accessKey: string;

    constructor(accessKey: string) {
        this.accessKey = accessKey;
    }

    getAccessKey(): string {
        return this.accessKey;
    }

    private async request(path: string, options: RequestInit = {}) {
        let url: URL;
        if (path.startsWith("http")) {
            url = new URL(path);
        } else {
            const cleanPath = path.startsWith("/") ? path : `/${path}`;
            url = new URL(`${this.baseUrl}${cleanPath}`);
        }

        // Add access key as a query parameter if not already present
        if (!url.searchParams.has("key") && this.accessKey) {
            url.searchParams.append("key", this.accessKey);
        }

        const headers = {
            ...options.headers,
            "Accept": "application/json",
        };

        const response = await fetch(url.toString(), { ...options, headers });
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
}
