import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext('auth');

const AuthProvider = ({ children }: {children: any}) => {

  // Memoized value of the authentication context
  const contextValue = '';

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;