import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface AuthContextType {
  user: { email: string; username: string } | null;
  isAuthenticated: boolean;
  login: (token: string, rememberMe: boolean) => void;
  logout: () => void;
}

interface DecodedToken extends JwtPayload {
  email: string;
  username: string;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        console.log(new Date((decoded.exp as number) * 1000));
        console.log("iat: " + new Date((decoded.iat as number) * 1000));
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser({ email: decoded.email, username: decoded.username });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = (token: string, rememberMe: boolean) => {
    if (rememberMe === true) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
    const decoded = jwtDecode<DecodedToken>(token);
    setUser({ email: decoded.email, username: decoded.username });
    setIsAuthenticated(true);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
