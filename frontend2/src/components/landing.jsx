import React, { useEffect, useState } from "react";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";



const LandingPage = () => {
  const { login } = useKindeAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] text-[#f5f5f5] font-mono px-4 flex flex-col lg:flex-row items-center justify-center gap-10 transition-all duration-500 ease-in-out">
      <img
        src="/chimp-logo.webp"
        className={`w-32 h-32 md:w-100 md:h-100 order-1 lg:order-none transform transition-all duration-1000 ease-in-out
          ${isLoaded
            ? 'lg:translate-x-0 translate-y-0 opacity-100 blur-0 relative'
            : 'lg:-translate-x-full -translate-y-full opacity-0 blur-lg absolute top-4 left-4'
          }`}
        alt="ChimpType Logo"
      />

      <div className={`flex flex-col items-center text-center order-2 lg:order-none transition-all duration-1000 ease-in-out
        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 break-words">
          Welcome to <span className="bg-yellow-300 text-black px-1 inline-block">ChimpType</span>
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
    </div>
  );
};

export default LandingPage;
