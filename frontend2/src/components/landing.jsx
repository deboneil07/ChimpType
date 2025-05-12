import React, { useEffect, useState, useMemo } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
// import BananaBackground from "./BananaBackground";

const Footer = () => {
  return (
    <footer className="w-full text-center px-4 py-4 text-yellow-400 text-xs">
      <p className="mb-1 extra-bold">
        ChimpType, developed by the typing chimps themselves 🐒
      </p>
      <div className="flex justify-center items-center gap-4">
        <a
          href="https://github.com/deboneil07"
          target="_blank"
          rel="noopener noreferrer"
          className="transition duration-300 hover:text-yellow-300 hover:scale-105"
        >
          deboneil
        </a>
        <span>|</span>
        <a
          href="https://github.com/Muhammad-Owais-Warsi"
          target="_blank"
          rel="noopener noreferrer"
          className="transition duration-300 hover:text-yellow-300 hover:scale-105"
        >
          owais
        </a>
      </div>
    </footer>
  );
};

// Banana background component
export const BananaBackground = () => {
  const bananas = useMemo(() => {
    const gridSize = 7;
    const arr = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i * (100 / gridSize)) + (Math.random() * (100 / gridSize));
        const y = (j * (100 / gridSize)) + (Math.random() * (100 / gridSize));
        arr.push({
          id: `${i}-${j}`,
          x,
          y,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          opacity: 0.15 + Math.random() * 0.15
        });
      }
    }
    return arr;
  }, []); // empty dependency array = only run once per mount

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {bananas.map((banana) => (
        <div
          key={banana.id}
          className="absolute text-yellow-400/30"
          style={{
            left: `${banana.x}%`,
            top: `${banana.y}%`,
            transform: `rotate(${banana.rotation}deg) scale(${banana.scale})`,
            opacity: banana.opacity,
            fontSize: '2rem'
          }}
        >
          🍌
        </div>
      ))}
    </div>
  );
};

// Login Overlay Component
const LoginOverlay = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border-2 border-yellow-400/30 rounded-xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-yellow-400/60 hover:text-yellow-400 transition-colors duration-200 hover:bg-yellow-400/10 rounded-full p-2 hover:cursor-pointer"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-8">
          <img
            src="/chimp-logo.webp"
            alt="Chimp Logo"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Welcome to ChimpType</h2>
          <p className="text-[#bbbbbb] text-sm">Ready to type like a chimp? Let's get started!</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Swing into the forest</span>
            <span className="text-xl">🐒</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full border-2 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { login } = useKindeAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoginOverlayOpen, setIsLoginOverlayOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogin = () => {
    login({
      connectionId: import.meta.env.VITE_KINDE_CONN_ID,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#f5f5f5] font-mono relative">
      <BananaBackground />
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 gap-10 relative z-10">
        <img
          src="/chimp-logo.webp"
          className={`w-32 h-32 md:w-100 md:h-100 order-1 lg:order-none transform transition-all duration-1000 ease-in-out
          ${
            isLoaded
              ? "lg:translate-x-0 translate-y-0 opacity-100 blur-0 relative"
              : "lg:-translate-x-full -translate-y-full opacity-0 blur-lg absolute top-4 left-4"
          }`}
          alt="ChimpType Logo"
        />

        <div
          className={`flex flex-col items-center text-center order-2 lg:order-none transition-all duration-1000 ease-in-out
        ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 break-words">
            Welcome to{" "}
            <span className="bg-yellow-300 text-black px-1 inline-block">
              ChimpType
            </span>
          </h1>
          <p className="text-[#bbbbbb] max-w-md mb-8 text-sm sm:text-base">
            Race your friends. Type like a chimp.
          </p>
          <button
            onClick={() => setIsLoginOverlayOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            Log In
          </button>
        </div>
      </main>
      <Footer />
      
      <LoginOverlay 
        isOpen={isLoginOverlayOpen}
        onClose={() => setIsLoginOverlayOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default LandingPage;
