// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const RefreshContext = createContext(null);

export function RefreshProvider({ children }) {
    const [homeRefreshKey, setHomeRefreshKey] = useState(0);
    const triggerHomeRefresh = () => setHomeRefreshKey(prev => prev + 1);

    return (
        <RefreshContext.Provider value={{ homeRefreshKey, triggerHomeRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
}