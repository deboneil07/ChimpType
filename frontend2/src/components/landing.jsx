import React, { useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

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

const LandingPage = () => {
  const { login } = useKindeAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#f5f5f5] font-mono">
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 gap-10">
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
            onClick={login}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            Log In
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
