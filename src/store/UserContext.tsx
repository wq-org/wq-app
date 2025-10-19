import React, { createContext, useContext, useState } from 'react';

interface User {
    id: string;
    userName: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
}

interface UserContextType {
    user: User | null;
    updateUser: (newUser: User) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
    children?: React.ReactNode;
}

export default function UserContextProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    function handleUpdateUser(newUser: User) {
        setUser((prevUser) => {
            console.log('newUser :>> ', newUser);
            return { ...prevUser, ...newUser };
        });
    }

    const ctxValue = {
        user: user,
        updateUser: handleUpdateUser,
    };

    return (
        <UserContext.Provider value={ctxValue}>{children}</UserContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
}
