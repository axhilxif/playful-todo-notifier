import { useState, useEffect } from 'react';

export function useIntroScreen() {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);

  useEffect(() => {
    try {
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      setShouldShowIntro(!hasSeenIntro);
    } catch (error) {
      console.error('Error accessing localStorage for intro screen:', error);
      // Default to showing intro if localStorage fails
      setShouldShowIntro(true);
    }
  }, []);

  const markIntroAsSeen = () => {
    try {
      localStorage.setItem('hasSeenIntro', 'true');
      setShouldShowIntro(false);
    } catch (error) {
      console.error('Error saving intro screen state:', error);
      // Still hide intro even if localStorage fails
      setShouldShowIntro(false);
    }
  };

  const showIntro = () => {
    try {
      localStorage.removeItem('hasSeenIntro'); // Clear the flag to force show intro
      setShouldShowIntro(true);
    } catch (error) {
      console.error('Error clearing intro screen state:', error);
      setShouldShowIntro(true);
    }
  };

  return {
    shouldShowIntro,
    markIntroAsSeen,
    showIntro
  };
}
