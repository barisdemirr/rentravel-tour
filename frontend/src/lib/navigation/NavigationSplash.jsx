"use client";

import { AnimatePresence } from "framer-motion";
import { useNavigation } from "@/lib/navigation/NavigationProvider";
import SplashView from "./SplashView";

// Gezinme sürerken (tıklama ile yeni sayfanın gelişi arası) splash gösterir
export default function NavigationSplash() {
    const { loading } = useNavigation();

    return <AnimatePresence>{loading && <SplashView key="navigation" delay={0.15} />}</AnimatePresence>;
}