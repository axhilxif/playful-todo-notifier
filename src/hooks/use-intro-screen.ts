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
    setShouldShowIntro(true);
  };

  return {
    shouldShowIntro,
    markIntroAsSeen,
    showIntro
  };
}
