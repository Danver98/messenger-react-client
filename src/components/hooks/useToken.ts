import { useState } from 'react';
import { ACCESS_TOKEN, CURRENT_LOGGED_USER, REFRESH_TOKEN } from '../../util/Constants';
import User from '../../models/User';

export function useAccessToken() {
  const getAccessToken = () => {
    const tokenString = localStorage.getItem(ACCESS_TOKEN);
    const userToken = tokenString ? JSON.parse(tokenString) : null;
    return userToken?.token
  };

  const [accessToken, setAccessToken] = useState(getAccessToken());

  const saveAccessToken = (userToken: any) => {
    // Token is supposed to be a string
    if (userToken == null) {
      localStorage.removeItem(ACCESS_TOKEN);
    } else {
      localStorage.setItem(ACCESS_TOKEN, JSON.stringify({ 'token': userToken }));
    }
    setAccessToken(userToken);
  };

  return {
    setAccessToken: saveAccessToken,
    accessToken,
    getAccessToken
  }
}

export function useRefreshToken() {
  const getRefreshToken = () => {
    const tokenString = localStorage.getItem(REFRESH_TOKEN);
    const userToken = tokenString ? JSON.parse(tokenString) : null;
    return userToken?.token
  };

  const [refreshToken, setRefreshToken] = useState(getRefreshToken());

  const saveRefreshToken = (userToken: any) => {
    if (userToken == null) {
      localStorage.removeItem(REFRESH_TOKEN);
    } else {
      localStorage.setItem(REFRESH_TOKEN, JSON.stringify({ 'token': userToken }));
    }
    setRefreshToken(userToken);
  };

  return {
    setRefreshToken: saveRefreshToken,
    refreshToken
  }
}

export function getToken(key: string): string {
  const tokenString = localStorage.getItem(key);
  const token = tokenString ? JSON.parse(tokenString) : null;
  return token?.token
}

export function setToken(key: string, token: object | null): void {
  localStorage.setItem(key, JSON.stringify(token));
}

export function useCurrentLoggedUser() {
  const getCurrentLoggedUser = () => {
    const user = localStorage.getItem(CURRENT_LOGGED_USER);
    return user ? JSON.parse(user) : null;
  }

  const [currentLoggedUser, setCurrentLoggedUser] = useState(getCurrentLoggedUser())

  const saveCurrentLoggedUser = (user?: User | null) => {
    if (user == null) {
      localStorage.removeItem(CURRENT_LOGGED_USER);
    } else {
      localStorage.setItem(CURRENT_LOGGED_USER, JSON.stringify(user));
    }
    setCurrentLoggedUser(user);
  }

  return {
    setCurrentLoggedUser: saveCurrentLoggedUser,
    currentLoggedUser
  }
}