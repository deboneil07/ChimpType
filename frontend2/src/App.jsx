import { BrowserRouter, Routes, Route } from "react-router-dom";
import FindMatch from "./components/find.jsx";
import Result from "./components/result.jsx";
import LandingPage from "./components/landing.jsx";
import { useEffect } from "react";
import LeaderBoard from "./components/leaderboard.jsx";


function App() {
  useEffect(() => {
    window.location.href === "https://chimptype.kinde.com/logged-out" ? window.location.href = "https://chimptype.onrender.com" : null
  }, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="find" element={<FindMatch />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
