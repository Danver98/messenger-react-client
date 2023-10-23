export const RANDOM_AVATAR_URL = 'https://i.pravatar.cc/'; // /{size}
export const RANDOM_CHAT_AVATAR_URL = 'https://random.imagecdn.app/' // /{width}/{height}
export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';
export const CURRENT_LOGGED_USER = 'current_logged_user'

export const DIRECTION = {
    FUTURE: 1,
    PAST: 2
}

export class ServiceUrl {
    static readonly BACKEND_SERVICE_BASE_URL = 'https://localhost:8443/messenger/api/v1';
    static readonly AUTH_BASE = '/auth';
    static readonly MESSENGER_BASE = '/chats';
    static readonly USER_BASE = '/users';
}

export class Headers {
    static readonly AUTHORIZATION = 'Authorization';
};

export class Pages {
    /**
     * Must be in sync with routing structure
     */
    static readonly LOGIN_PAGE = '/login';
    static readonly REGISTER_PAGE = '/register'
    static readonly INTRO_PAGE = '/intro';
};

export class SecuredPages {
    /**
     * Must be in sync with routing structure
     */

    static readonly CHATS_PAGE = '/secured/chats';
    static readonly HOME_PAGE = '/secured/home';
    // Chat dialog itself
    static readonly CHAT_ROOM_PAGE = '/secured/chats/room';
};