import React, { createContext, useState } from 'react';

interface User {
    id: string;
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

export default function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    function handleUpdateUser(newUser: User) {
        setUser((prevUser) => {
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
