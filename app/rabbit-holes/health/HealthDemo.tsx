"use client";

import { useState } from "react";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";
import WelcomeModal from "./WelcomeModal";
import { COMPLETED_DAYS } from "./constants";

/** Fake auth state only — nothing here talks to a server. */
export default function HealthDemo() {
    const [loggedIn, setLoggedIn] = useState(true);
    const [viewDay, setViewDay] = useState(COMPLETED_DAYS);
    const [showWelcome, setShowWelcome] = useState(true);

    function handleLogin() {
        setLoggedIn(true);
        setViewDay(COMPLETED_DAYS);
    }

    function handleLogout() {
        setLoggedIn(false);
    }

    return (
        <div className="font-sans">
            {loggedIn ? (
                <Dashboard viewDay={viewDay} onSelectDay={setViewDay} onLogout={handleLogout} />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
            {showWelcome ? <WelcomeModal onClose={() => setShowWelcome(false)} /> : null}
        </div>
    );
}
