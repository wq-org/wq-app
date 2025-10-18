import React, { createContext } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext(null)

interface UserProviderProps {
    children?: React.ReactNode
}

export default function UserProvider({ children }: UserProviderProps) {
    const user = null

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
