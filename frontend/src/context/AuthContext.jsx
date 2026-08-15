import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || 'Invalid input')
      .join(', ');
  }

  return fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem(
        'access_token',
        data.access_token
      );

      setUser(data.user);

      return data;
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          'Unable to sign in.'
        )
      );

      throw error;
    }
  };

  const register = async ({
    name,
    email,
    password,
  }) => {
    setError('');

    try {
      const { data } = await api.post(
        '/auth/register',
        {
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );

      localStorage.setItem(
        'access_token',
        data.access_token
      );

      setUser(data.user);

      return data;
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          'Unable to create your account.'
        )
      );

      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setError('');
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token =
        localStorage.getItem('access_token');

      if (!token) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const { data } = await api.get(
          '/auth/me'
        );

        if (mounted) {
          setUser(data);
        }
      } catch {
        localStorage.removeItem(
          'access_token'
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        setUser,
        updateUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}