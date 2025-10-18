import React, { createContext, useState } from 'react'

interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'teacher' | 'student'
}
// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext({} as User | null)

interface UserProviderProps {
    children?: React.ReactNode
}

export default function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState(null)

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
