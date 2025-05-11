import { useState, useRef, useCallback, useEffect } from "react";
import { useCodeStore } from "../utils/zustand";

let PARA = "";

export default function usePlay() {
  const { code } = useCodeStore();
  PARA = code;
  
  const [stats, setStats] = useState({
    correct: 0,
    error: 0,
    wpm: 0,
    value: "",
    index: [{value: 0, typed: false}],
    finalWpm: 0
  });
  
  const prevIndex = useRef(0);
  const startTime = useRef(null);
  const lastTypedLength = useRef(0);
  const isCompleted = useRef(false);
  const wpmInterval = useRef(null);
  const lastWpm = useRef(0);
  const currentValue = useRef("");
  
  const calculateWpm = (typedLength, elapsedSeconds) => {
    if (elapsedSeconds < 0.1) return 0; // Prevent division by very small numbers
    return (typedLength * 60) / (5 * elapsedSeconds);
  };

  // Update WPM every second
  const updateWpm = useCallback(() => {
    if (!startTime.current) return;
    
    const elapsedSeconds = (Date.now() - startTime.current) / 1000;
    const typedLength = currentValue.current.length;
    const wpm = calculateWpm(typedLength, elapsedSeconds);
    const roundedWpm = Math.round(wpm);
    
    // Check completion using current value
    if (typedLength >= PARA.length) {
      isCompleted.current = true;
      if (wpmInterval.current) {
        clearInterval(wpmInterval.current);
        wpmInterval.current = null;
      }
      lastWpm.current = roundedWpm;
      setStats(prev => ({ 
        ...prev, 
        wpm: roundedWpm, 
        finalWpm: roundedWpm 
      }));
    } else {
      lastWpm.current = roundedWpm;
      setStats(prev => ({ 
        ...prev, 
        wpm: roundedWpm,
        finalWpm: prev.finalWpm // Preserve the final WPM
      }));
    }
  }, []);

  // Start WPM interval when typing begins
  const startWpmInterval = useCallback(() => {
    if (wpmInterval.current) return;
    wpmInterval.current = setInterval(updateWpm, 1000);
  }, [updateWpm]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (wpmInterval.current) {
        clearInterval(wpmInterval.current);
      }
    };
  }, []);
  
  const handleInputChange = useCallback((e) => {
    const typedValue = e.target.value;
    currentValue.current = typedValue;
    const typedIndex = typedValue.length;
    
    // Check completion immediately
    if (typedIndex >= PARA.length && !isCompleted.current) {
      isCompleted.current = true;
      if (wpmInterval.current) {
        clearInterval(wpmInterval.current);
        wpmInterval.current = null;
      }
      // Update WPM immediately on completion
      const elapsedSeconds = (Date.now() - startTime.current) / 1000;
      const wpm = calculateWpm(typedIndex, elapsedSeconds);
      const roundedWpm = Math.round(wpm);
      lastWpm.current = roundedWpm;
      setStats(prev => ({
        ...prev,
        wpm: roundedWpm,
        finalWpm: roundedWpm
      }));
    }
    
    setStats((prev) => {
      if (!startTime.current) {
        startTime.current = Date.now();
        lastTypedLength.current = 0;
        isCompleted.current = false;
        lastWpm.current = 0;
        startWpmInterval();
      }
  
      let newIndexArray = [...prev.index];
      let newCorrect = prev.correct;
      let newError = prev.error;
      
      // Handle backspace
      if (typedIndex < prevIndex.current) {
        prevIndex.current = typedIndex;
        return {
          ...prev,
          value: typedValue,
          index: newIndexArray.slice(0, typedIndex + 1)
        };
      }
      
      const lastChar = typedValue[typedIndex - 1];
      const expectedChar = PARA[typedIndex - 1];
      const isTyped = newIndexArray[typedIndex - 1]?.typed || false;
      
      // Handle tab key
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const newValue = typedValue.slice(0, start) + '    ' + typedValue.slice(start);
        return {
          ...prev,
          value: newValue,
          index: newIndexArray
        };
      }

      // Handle enter key
      if (e.key === 'Enter') {
        e.preventDefault();
        const newValue = typedValue + '\n';
        return {
          ...prev,
          value: newValue,
          index: newIndexArray
        };
      }
    
      if (lastChar === expectedChar) {
        if (!isTyped) {
          newCorrect++;
          newIndexArray[typedIndex - 1] = { typed: true };
        }
      } else {
        newError++;
        newIndexArray[typedIndex - 1] = { typed: false };
      }
      
      prevIndex.current = typedIndex;

      return {
        correct: newCorrect,
        error: newError,
        wpm: isCompleted.current ? lastWpm.current : prev.wpm,
        value: typedValue,
        index: newIndexArray,
        finalWpm: isCompleted.current ? lastWpm.current : prev.finalWpm
      };
    });
  }, [startWpmInterval]);
  
  return {
    stats,
    handleInputChange,
    PARA,
  };
}