import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    logout: () => void;
    error: string | null;
}

interface RegisterData {
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    password: string;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    login: async () => false,
    register: async () => false,
    logout: () => { },
    error: null
});

interface AuthProviderProps {
    children: ReactNode;
}

const mockUsers: { [key: string]: { user: User; password: string } } = {
    'student@students.nu-fairview.edu.ph': {
        user: {
            id: '1',
            email: 'student@students.nu-fairview.edu.ph',
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Smith'
        },
        password: 'Password123!'
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setError(null);

        const mockUser = mockUsers[email];

        if (mockUser && mockUser.password === password) {
            setUser(mockUser.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(mockUser.user));
            return true;
        } else {
            setError('Invalid email or password');
            return false;
        }
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        setError(null);

        if (!userData.email.endsWith('@students.nu-fairview.edu.ph')) {
            setError('Email must be a valid NU student email (@students.nu-fairview.edu.ph)');
            return false;
        }

        const newUser = {
            id: `${Object.keys(mockUsers).length + 1}`,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            middleName: userData.middleName
        };

        mockUsers[userData.email] = {
            user: newUser,
            password: userData.password
        };

        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(newUser));

        return true;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                register,
                logout,
                error
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;