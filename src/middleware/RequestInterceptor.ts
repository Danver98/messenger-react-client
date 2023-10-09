import { Headers } from "../util/Constants";
import { getToken } from "../components/hooks/useToken";
import { ACCESS_TOKEN } from "../util/Constants";

class RequestInterceptor {
    private static _instance: RequestInterceptor;


    protected _defaultHeaders: object = {
        'Access-Control-Allow-Credentials': 'true',
    };

    private constructor() {

    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());      
    }

    process(request: Request): Request {
        this._setTokens(request);
        return request;
    }

    private _setTokens(request: Request): void {
        const accessToken = getToken(ACCESS_TOKEN);
        // Store as object for future changes
        if (accessToken) {
            request.headers.set(Headers.AUTHORIZATION, `Bearer ${accessToken}`);
        }
    }

}

export default RequestInterceptor.Instance;