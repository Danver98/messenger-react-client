// router.ts
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import Layout from "../components/Layout/Layout";
import ProtectedRoute from "../middleware/ProtectedRoute";
import Chats from "../components/Pages/Chats/Chats";
import Intro from "../components/Pages/Intro";
import Register from "../components/Pages/Register/Register";
import Login from "../components/Pages/Login/Login";
import Home from "../components/Pages/Home";
import Profile from "../components/Pages/Settings/Profile";
import Settings from "../components/Pages/Settings/Settings";
import { SecuredPages } from "../util/Constants";
import { useAuthContextData } from "../middleware/AuthProvider";

class RouterManager {
  private static instance: RouterManager;
  private router: ReturnType<typeof createBrowserRouter> | null = null;
  private isAuthenticated: boolean = false;

  static getInstance(): RouterManager {
    if (!RouterManager.instance) {
      RouterManager.instance = new RouterManager();
    }
    return RouterManager.instance;
  }

  setAuthState(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
    this.updateRouter();
  }

  private getRoutes() {
    const authenticatedRoutes = [
      {
        path: SecuredPages.ROOT,
        element: <ProtectedRoute />,
        children: [
          { path: SecuredPages.HOME_PAGE, element: <Home /> },
          { path: SecuredPages.CHATS_PAGE, element: <Chats /> },
          { path: SecuredPages.PROFILE_PAGE, element: <Profile /> },
          { path: SecuredPages.SETTINGS, element: <Settings /> }
        ]
      },
    ];

    const notAuthenticatedRoutes = [
      { path: '/register', element: <Register /> },
      { path: '/login', element: <Login /> },
    ];

    const publicRoutes = [
      { path: '/intro', element: <Intro /> },
    ];

    return [
      {
        path: "/",
        element: <Layout />,
        children: [
          ...publicRoutes,
          ...(!this.isAuthenticated ? notAuthenticatedRoutes : []),
          ...authenticatedRoutes
        ]
      },
    ];
  }

  private updateRouter() {
    if (this.router) {
      // Navigate to appropriate route based on auth state
      const currentPath = window.location.pathname;
      const shouldNavigate = !this.isAuthenticated && 
        (currentPath === SecuredPages.HOME_PAGE || 
         currentPath === SecuredPages.CHATS_PAGE ||
         currentPath === SecuredPages.PROFILE_PAGE ||
         currentPath === SecuredPages.SETTINGS);
      
      if (shouldNavigate) {
        this.navigate('/intro');
      }
    }
  }

  getRouter() {
    const routes = this.getRoutes();
    this.router = createBrowserRouter(routes);
    return this.router;
  }

  // Navigation methods for utility/API classes
  navigate(path: string) {
    if (this.router) {
      this.router.navigate(path);
    } else {
      console.warn('Router not initialized yet');
    }
  }

  getCurrentPath(): string {
    return window.location.pathname;
  }
}

export const routerManager = RouterManager.getInstance();

// React component
const Routing = () => {
  const { getAccessToken } = useAuthContextData();
  const isAuthenticated = !!getAccessToken?.();
  
  // Update router state when auth changes
  useEffect(() => {
    routerManager.setAuthState(isAuthenticated);
  }, [isAuthenticated]);

  const router = routerManager.getRouter();
  return <RouterProvider router={router} />;
};

export default Routing;