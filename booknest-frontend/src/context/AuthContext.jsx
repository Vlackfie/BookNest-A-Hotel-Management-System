import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('bn_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('bn_token'));

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('bn_user', JSON.stringify(userData));
        localStorage.setItem('bn_token', accessToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('bn_user');
        localStorage.removeItem('bn_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);