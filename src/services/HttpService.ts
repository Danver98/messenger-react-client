import RequestInterceptor from "../middleware/RequestInterceptor";
import ResponseInterceptor from "../middleware/ResponseInterceptor";
import { Headers } from "../util/Constants";
import { getToken } from "../components/hooks/useToken";
import { ACCESS_TOKEN } from "../util/Constants";

class HttpService {

    private static _instance: HttpService;

    // Should it be imported from Constants
    private static readonly BASE_URL = 'https://localhost:8443/messenger/api/v1';
    static readonly RANDOM_AVATAR_URL = 'https://i.pravatar.cc/';

    protected _defaultHeaders: object = {
    };

    private constructor() {
    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }

    protected _getHeaders(headers?: HeadersInit): HeadersInit {
        const customHeaders: { [key: string]: any } ={
            ...this._defaultHeaders,
        }
        const accessToken = getToken(ACCESS_TOKEN);
        if (accessToken) {
            customHeaders[Headers.AUTHORIZATION] = accessToken;
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

    protected _prepareRequest(method = 'GET', data = {}, headers?: HeadersInit): RequestInit {

        const info: RequestInit = {
            method: method,
            headers: this._getHeaders(headers),
            credentials: 'include',
            body: JSON.stringify(data)
        }
        return info;
    }

    protected async _fetch(input: URL | RequestInfo, init?: RequestInit | undefined): Promise<any> {
        try {
            const response = await fetch(input, init);
            if (!response.ok) {
                throw new Error(`Request failed: status code - ${response.status}`);
            }
            this._afterResponse(response);
            //this._checkType(response, "application/json");
            return response.body;
            // process your data further
        } catch (error) {
            alert(`${error}`);
            return null;
        }
    }

    protected async _fetchJSON(input: URL | RequestInfo, init?: RequestInit | undefined): Promise<any> {
        try {
            const response = await fetch(input, init);
            if (!response.ok) {
                throw new Error(`Request failed: status code - ${response.status}`);
            }
            this._afterResponse(response);
            this._checkType(response, "application/json");
            return await response.json();
            // process your data further
        } catch (error) {
            alert(`${error}`);
            return null;
        }
    }

    protected _checkType(response: Response, contentType: string) {
        const responseType = response.headers.get("content-type");
        if (!responseType || !responseType.includes(contentType)) {
            throw new TypeError(`Oops, we haven't got proper type: ${contentType}!`);
        }
    }

    async get(url: string = '', data: object = {}): Promise<any> {
        const info: RequestInit = this._prepareRequest('GET', data, {
            'Content-Type': 'application/json'
        });
        return this._fetchJSON(HttpService.BASE_URL + url, info);
    }

    async post(url: string = '', data: object = {}): Promise<object> {
        const info: RequestInit = this._prepareRequest('POST', data, {
            'Content-Type': 'application/json'
        });
        return this._fetchJSON(HttpService.BASE_URL + url, info);
    }

    async put(url: string = '', data: object = {}): Promise<object> {
        const info: RequestInit = this._prepareRequest('PUT', data, {
            'Content-Type': 'application/json'
        });
        return this._fetchJSON(HttpService.BASE_URL + url, info);
    }

    async patch(url: string = '', data: object = {}): Promise<object> {
        const info: RequestInit = this._prepareRequest('PATCH', data, {
            'Content-Type': 'application/json'
        });
        return this._fetchJSON(HttpService.BASE_URL + url, info);
    }

    async delete(url: string = '', data: object = {}): Promise<object> {
        const info: RequestInit = this._prepareRequest('DELETE', data);
        return this._fetchJSON(HttpService.BASE_URL + url, info);
    }
}

export default HttpService.Instance;

// fetch("https://localhost:8443/messenger/api/v1/auth/register", {
//   method: 'POST',
//   headers: {
//     'Access-Control-Allow-Credentials': 'true',
//     'Content-Type': 'application/json'
//   },
//   credentials: "include",
//   body: JSON.stringify({
//     'name': 'John',
//     'surname': 'Suffered',
//     'email': 'jsuffered@rambler.com',
//     'password': 'password',
//   })
// }).then( (response) => {
//   console.log(response.body)
// })

// fetch("https://localhost:8443/messenger/api/v1/auth/login", {
//   method: 'POST',
//   headers: {
//     'Access-Control-Allow-Credentials': 'true',
//     'Content-Type': 'application/json'
//   },
//   credentials: "include",
//   body: JSON.stringify({
//     'email': 'ssuffered_first@rambler.com',
//     'password': 'password'
//   })
// }).then( (response) => {
//   console.log(response.body)
// }) 