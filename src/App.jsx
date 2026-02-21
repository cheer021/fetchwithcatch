import { HashRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Game from "./pages/Game";
import { loadFromStorage, saveToStorage } from "./lib/storage";
import { STORAGE_KEYS } from "./lib/constants";

export default function App() {
  const [profile, setProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PROFILE),
  );
  const [savedGame, setSavedGame] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SAVED_GAME),
  );

  const handleSaveProfile = useCallback(
    (data) => {
      const updated = {
        ...profile,
        ...data,
        gamesPlayed: profile?.gamesPlayed ?? 0,
        wins: profile?.wins ?? 0,
      };
      saveToStorage(STORAGE_KEYS.PROFILE, updated);
      setProfile(updated);
    },
    [profile],
  );

  const handleGameSave = useCallback((gameState) => {
    saveToStorage(STORAGE_KEYS.SAVED_GAME, gameState);
    setSavedGame(gameState);
  }, []);

  const handleGameEnd = useCallback(() => {
    saveToStorage(STORAGE_KEYS.SAVED_GAME, null);
    setSavedGame(null);
  }, []);

  return (
    <HashRouter>
      <Navbar profile={profile} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              profile={profile}
              savedGame={savedGame}
              onQuickStart={handleSaveProfile}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/profile"
          element={
            <Profile profile={profile} onSaveProfile={handleSaveProfile} />
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute profile={profile}>
              <Game
                profile={profile}
                savedGame={savedGame}
                onGameSave={handleGameSave}
                onGameEnd={handleGameEnd}
                onUpdateProfile={setProfile}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </HashRouter>
  );
}
