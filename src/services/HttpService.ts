import RequestInterceptor from "../middleware/RequestInterceptor";
import ResponseInterceptor from "../middleware/ResponseInterceptor";
import { Headers, Pages } from "../util/Constants";
import { getToken, setToken, getCurrentLoggedUser, setCurrentLoggedUser } from "../components/hooks/useToken";
import { ACCESS_TOKEN, ServiceUrl } from "../util/Constants";
import AuthService from "./AuthService";
import { getDeviceId } from "../util/Functions";
import toast from "react-hot-toast";
import { routerManager } from "../routing/Routing";

class HttpService {

    private static _instance: HttpService;

    protected _defaultHeaders: object = {
    };

    private constructor() {
    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }

    protected async _getHeaders(headers?: HeadersInit): Promise<HeadersInit> {
        const customHeaders: { [key: string]: any } = {
            ...this._defaultHeaders,
        }
        const accessToken = getToken(ACCESS_TOKEN);
        const deviceId = await getDeviceId();
        if (accessToken) {
            customHeaders[Headers.AUTHORIZATION] = `Bearer ${accessToken}`;
        }
        if (deviceId) {
            customHeaders[Headers.X_USER_DEVICE_ID] = deviceId;
        }
        if (headers) {
            return {
                ...headers,
                ...customHeaders
            }
        }
        return customHeaders;
    }

    protected _beforeRequest(request: Request) {
        RequestInterceptor.process(request);
    }

    protected _afterResponse(response: Response) {
        ResponseInterceptor.process(response);
    }

    protected async _prepareRequest(method = 'GET', data = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<RequestInit> {

        const info: RequestInit = {
            method: method,
            headers: await this._getHeaders(headers),
            credentials: 'include',
            body: method !== 'GET' && data && Object.keys(data).length > 0 ? JSON.stringify(data) : null,
            signal: signal
        }
        return info;
    }

    protected async _prepareRequestFile(method = 'GET', data?: FormData | null, headers?: HeadersInit, signal?: AbortSignal | null): Promise<RequestInit> {

        const info: RequestInit = {
            method: method,
            headers: await this._getHeaders(headers),
            credentials: 'include',
            body: data,
            signal: signal
        }
        return info;
    }

    protected async getNewTokens(): Promise<string|null> {
        const info: RequestInit = await this._prepareRequest('GET');
        if (info.headers) {
            delete (info.headers as any)[Headers.AUTHORIZATION];
        }
        const url = ServiceUrl.BACKEND_SERVICE_BASE_URL + ServiceUrl.AUTH_BASE + '/refreshToken';
        let response = await fetch(url, info);
        if (response.ok) {
            // Store token
            const token = response.headers.get(Headers.AUTHORIZATION);
            this._afterResponse(response);
            return token;
        } else if (response.status === 401) {
            // We need to log out user
            const user = getCurrentLoggedUser();
            if (user) {
                setToken(ACCESS_TOKEN, null);
                setCurrentLoggedUser(null);
                // Redirect to login page
                routerManager.navigate(Pages.LOGIN_PAGE);
                return null;
            }
        }
        return null;
    }

    protected async _fetch(input: URL | RequestInfo, init?: RequestInit | undefined): Promise<any> {
        try {
            let response = await fetch(input, init);
            const loginUrl = ServiceUrl.BACKEND_SERVICE_BASE_URL + ServiceUrl.AUTH_BASE + Pages.LOGIN_PAGE;
            if (response.status === 401 && input !== loginUrl) {
                const token =await this.getNewTokens();
                if (token === 'redirect') {
                    toast.error('You have been logged out!');
                    return null;
                }
                if (init && init.headers) {
                    (init.headers as any)[Headers.AUTHORIZATION] = `Bearer ${getToken(ACCESS_TOKEN)}`;
                }
                response = await fetch(input, init);
            }
            if (!response.ok) {
                throw new Error(`Request failed: status code - ${response.status}`);
            }
            this._afterResponse(response);
            //this._checkType(response, "application/json");
            return response.text();
            // process your data further
        } catch (error) {
            toast.error(`${error}`);
            return null;
        }
    }

    protected async _fetchJSON(input: URL | RequestInfo, init?: RequestInit | undefined): Promise<any> {
        try {
            let response = await fetch(input, init);
            const loginUrl = ServiceUrl.BACKEND_SERVICE_BASE_URL + ServiceUrl.AUTH_BASE + Pages.LOGIN_PAGE;
            if (response.status === 401 && input !== loginUrl) {
                const token =await this.getNewTokens();
                if (token === 'redirect') {
                    toast.error('You have been logged out!');
                    return null;
                }
                if (init && init.headers) {
                    (init.headers as any)[Headers.AUTHORIZATION] = `Bearer ${getToken(ACCESS_TOKEN)}`;
                }
                response = await fetch(input, init);
            }
            if (!response.ok) {
                throw new Error(`Request failed: status code - ${response.status}`);
            }
            this._afterResponse(response);
            //this._checkType(response, "application/json");
            if (response.headers.get('content-length') === '0') return null;
            return await response.json();
            // process your data further
        } catch (error) {
            toast.error(`${error}`);
            return null;
        }
    }

    protected _checkType(response: Response, contentType: string) {
        const responseType = response.headers.get("content-type");
        if (!responseType || !responseType.includes(contentType)) {
            throw new TypeError(`Oops, we haven't got proper type: ${contentType}!`);
        }
    }

    async getJson(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('GET', data, {
            'Content-Type': 'application/json',
            ...headers
        }, signal);
        return this._fetchJSON(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async postJson(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('POST', data, {
            'Content-Type': 'application/json',
            ...headers
        }, signal);
        return this._fetchJSON(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async putJson(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('PUT', data, {
            'Content-Type': 'application/json',
            ...headers
        }, signal);
        return this._fetchJSON(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async patchJson(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('PATCH', data, {
            'Content-Type': 'application/json',
            ...headers
        }, signal);
        return this._fetchJSON(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async deleteJson(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('DELETE', data, headers, signal);
        return this._fetchJSON(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    // =================================================================================

    async get(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('GET', data, headers, signal);
        return this._fetch(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async post(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('POST', data, headers, signal);
        return this._fetch(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async postByUrl(fullUrl: string, data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('POST', data, headers, signal);
        return this._fetch(fullUrl, info);
    }

    async put(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('PUT', data, headers, signal);
        return this._fetch(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async patch(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('PATCH', data, headers, signal);
        return this._fetch(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    async delete(url: string = '', data: object = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const info: RequestInit = await this._prepareRequest('DELETE', data, headers, signal);
        return this._fetch(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

    // =============================================================================================
    async postFile(url: string = '', data: any = {}, headers?: HeadersInit, signal?: AbortSignal | null): Promise<any> {
        const formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        const info: RequestInit = await this._prepareRequestFile('POST', formData, headers, signal);
        return this._fetch(ServiceUrl.BACKEND_SERVICE_BASE_URL + url, info);
    }

}

export default HttpService.Instance;
