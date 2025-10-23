import React from 'react';

function AppWrapper({ children }: { children: React.ReactNode }) {
    return <div className="app-wrapper">{children}</div>;
}

export default AppWrapper;
