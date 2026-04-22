import { useContext } from "react";
import { RefreshContext } from "./RefreshContext";

const useRefresh = () => {
    const context = useContext(RefreshContext);
    if (!context) {
        return { homeRefreshKey: 0, triggerHomeRefresh: () => {} };
    }
    return context;
};

export default useRefresh;