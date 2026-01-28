'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BackgroundMusic.module.css';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume
    audio.volume = 0.5;

    // Handle audio loading errors
    const handleError = () => {
      setAudioError(true);
      console.log('Background music file not found. Please add /music/background.mp3');
    };

    // Set up audio event listeners
    const handlePlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Loop the music
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Function to start music
    const startMusic = () => {
      if (!hasStarted && !audioError && audio.readyState >= 2) {
        audio.play()
          .then(() => {
            setHasStarted(true);
          })
          .catch((error) => {
            // Silently handle autoplay prevention
          });
      }
    };

    // Try autoplay immediately (may be blocked by browser)
    if (audio.readyState >= 2) {
      startMusic();
    } else {
      // Wait for audio to load
      const handleCanPlay = () => {
        startMusic();
      };
      audio.addEventListener('canplay', handleCanPlay, { once: true });
    }

    // Listen for ANY user interaction to start music
    // Using capture phase to catch events early
    const handleUserInteraction = (e: Event) => {
      startMusic();
    };

    // Add listeners for all interaction events with capture
    const events = ['click', 'keydown', 'touchstart', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { 
        once: true, 
        passive: true,
        capture: true 
      });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction, { capture: true } as any);
      });
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [hasStarted, audioError]);

  useEffect(() => {
    // Additional attempt: try to play when component mounts and after a short delay
    const audio = audioRef.current;
    if (!audio || hasStarted || audioError) return;

    const tryPlay = () => {
      if (audio.readyState >= 2 && !hasStarted) {
        audio.play().catch(() => {});
      }
    };

    // Try after a short delay
    const timeout = setTimeout(tryPlay, 500);

    return () => clearTimeout(timeout);
  }, [hasStarted, audioError]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.log('Failed to play audio:', error);
      });
    }
  };

  // Don't show button if audio file doesn't exist
  if (audioError) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/background.mp3"
        loop
        preload="auto"
      />
      <button
        className={styles.musicButton}
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
    </>
  );
}
