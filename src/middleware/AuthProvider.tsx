import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AuthContextData from "../contexts/AuthContextData";
import { useAccessToken, useCurrentLoggedUser, useRefreshToken } from "../components/hooks/useToken";

const AuthContext = createContext<AuthContextData>({});

const AuthProvider = ({ children }: {children: any}) => {

  // Memoized value of the authentication context
  const { accessToken, setAccessToken, getAccessToken } = useAccessToken();
  const { refreshToken, setRefreshToken } = useRefreshToken();
  const {currentLoggedUser, setCurrentLoggedUser} = useCurrentLoggedUser();
  
  const contextValue = useMemo(() =>({
    user: currentLoggedUser,
    setUser: setCurrentLoggedUser,
    token: accessToken,
    getAccessToken,
    setToken: setAccessToken,
    refreshToken,
    setRefreshToken
  }), [currentLoggedUser, accessToken, refreshToken]);

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContextData = () => {
  return useContext(AuthContext);
};

export default AuthProvider;