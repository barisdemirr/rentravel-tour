"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SPLASH_DURATION, SPLASH_STORAGE_KEY } from "@/lib/constants";
import SplashView from "./SplashView";

export default function SplashScreen() {
    // Sunucuda görünür gelir. Daha önce görüldüyse layout.jsx'teki script ilk boyamada gizler, efekt de kapatır.
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1") {
            setVisible(false);
            return;
        }

        const timer = setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
        }, SPLASH_DURATION);

        return () => clearTimeout(timer);
    }, []);

    // Splash açıkken scroll kilitle
    useEffect(() => {
        if (!visible) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [visible]);

    return <AnimatePresence>{visible && <SplashView key="splash" className="splash-root" />}</AnimatePresence>;
}