export class WecandeoClient {
    private baseUrl = "https://api.wecandeo.com";
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    getApiKey(): string {
        return this.apiKey;
    }

    private async request(path: string, options: RequestInit = {}) {
        let url: URL;
        if (path.startsWith("http")) {
            url = new URL(path);
        } else {
            const cleanPath = path.startsWith("/") ? path : `/${path}`;
            url = new URL(`${this.baseUrl}${cleanPath}`);
        }

        // Add API key as a query parameter if not already present
        if (!url.searchParams.has("key") && this.apiKey) {
            url.searchParams.append("key", this.apiKey);
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

    async get(path: string, params?: Record<string, any>) {
        const urlObj = path.startsWith("http") ? new URL(path) : new URL(`${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlObj.searchParams.set(key, String(value));
                }
            });
        }
        return this.request(urlObj.toString(), { method: "GET" });
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

    // Encoding APIs
    async cancelEncoding(videoFileKey: string) {
        return this.get("/web/encoding/cancel.json", { videoFileKey });
    }

    async cancelAllEncodings(params: { start_date?: string; end_date?: string }) {
        return this.get("/web/encoding/cancel/batch.json", params);
    }

    async retryEncoding(videoFileKey: string) {
        return this.get("/web/encoding/retry.json", { videoFileKey });
    }

    async retryAllEncodings(params: { start_date?: string; end_date?: string }) {
        return this.get("/web/encoding/retry/batch.json", params);
    }

    async listEncodingRequests(params: {
        status?: string;
        start_date?: string;
        end_date?: string;
        page?: number;
        pagesize?: number;
    }) {
        return this.get("/web/encoding/requests.json", params);
    }
}
