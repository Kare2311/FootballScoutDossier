import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PlayersList from "./pages/PlayersList";
import PlayerDetail from "./pages/PlayerDetail";
import AuthPage from "./pages/AuthPage";
import MyReports from "./pages/MyReports";
import Watchlist from "./pages/Watchlist";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PlayersList />} />
        <Route path="/players/:id" element={<PlayerDetail />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </>
  );
}

export default App;
