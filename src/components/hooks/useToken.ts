import { useState } from 'react';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../util/Constants';

export function useAccessToken() {
  const getAccessToken = () => {
    const tokenString = localStorage.getItem(ACCESS_TOKEN);
    const userToken = tokenString ? JSON.parse(tokenString) : null;
    return userToken?.token
  };

  const [accessToken, setAccessToken] = useState(getAccessToken());

  const saveAccessToken = (userToken: any) => {
    localStorage.setItem(ACCESS_TOKEN, JSON.stringify(userToken));
    setAccessToken(userToken.token);
  };

  return {
    setAccessToken: saveAccessToken,
    accessToken
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
      localStorage.setItem(REFRESH_TOKEN, JSON.stringify(userToken));
      setRefreshToken(userToken.token);
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