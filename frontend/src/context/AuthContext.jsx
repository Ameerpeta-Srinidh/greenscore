import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("auth");
        if (saved) {
            try {
                setAuth(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse auth", e);
                localStorage.removeItem("auth");
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        localStorage.setItem("auth", JSON.stringify(data));
        setAuth(data);
    };

    const logout = () => {
        localStorage.removeItem("auth");
        setAuth(null);
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
