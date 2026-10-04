"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const NavigationContext = createContext(null);

// Devam eden gezinmelerin sayacı. Sayaç 0'dan büyükse splash görünür.
export function NavigationProvider({ children }) {
    const [count, setCount] = useState(0);
    const begin = useCallback(() => setCount((c) => c + 1), []);
    const end = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

    const value = useMemo(() => ({ loading: count > 0, begin, end }), [count, begin, end]);

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
    const ctx = useContext(NavigationContext);
    if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
    return ctx;
}

/** active true olduğu sürece bir gezinme devam ediyor sayılır */
export function useNavigationPending(active) {
    const { begin, end } = useNavigation();

    useEffect(() => {
        if (!active) return;
        begin();
        return end;
    }, [active, begin, end]);
}