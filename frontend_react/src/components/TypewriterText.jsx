import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text = "CrystalCore.", delay = 100, pauseTime = 4500 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;
    if (!isDeleting && index <= text.length) {
      setDisplayedText(text.substring(0, index));
      if (index === text.length) {
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      } else {
        const jitter = Math.floor(Math.random() * 40) - 20;
        timeout = setTimeout(() => setIndex(prev => prev + 1), Math.max(60, delay + jitter));
      }
    } else if (isDeleting) {
      setDisplayedText(text.substring(0, index));
      if (index === 0) {
        setIsDeleting(false);
        timeout = setTimeout(() => setIndex(1), 600);
      } else {
        timeout = setTimeout(() => setIndex(prev => prev - 1), 45);
      }
    }
    return () => clearTimeout(timeout);
  }, [index, isDeleting, text, delay, pauseTime]);

  const handleRestart = () => {
    setIsDeleting(false);
    setIndex(1);
    setDisplayedText(text[0]);
  };

  return (
    <span 
      className="agent-typewriter-line" 
      onClick={handleRestart} 
      title="Click to re-animate"
      style={{ cursor: 'pointer' }}
    >
      <span className="typewriter-text">{displayedText}</span>
      <span className="typewriter-cursor">|</span>
    </span>
  );
}
