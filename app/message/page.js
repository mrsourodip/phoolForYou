'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./message.module.css";
import { useBouquet } from "../context/BouquetContext";

const PRESET_MESSAGES = [
  "Thinking of you today.",
  "Just because.",
  "You're the absolute best.",
  "Hope your day is as beautiful as these flowers.",
  "Always a fool for you."
];

const CHIP_COLORS = ['#EDE8DF', '#F2D4DC', '#D4E8CC', '#DDD4EE', '#C8DDE8'];

const CARD_TINTS = [
  { name: 'Warm Linen', value: '#EDE8DF', description: 'For when you just want to say hello' },
  { name: 'Petal Rose', value: '#F2D4DC', description: 'For when you are a little bit in love' },
  { name: 'Sage Mist', value: '#D4E8CC', description: 'For when they need a fresh start' },
  { name: 'Dusk Violet', value: '#DDD4EE', description: 'For when you are sorry you forgot' },
  { name: 'Still Water', value: '#C8DDE8', description: 'For when they are feeling down' },
];

export default function MessageScreen() {
  const router = useRouter();
  const { message, setMessage, bouquetImage, cardTint, setCardTint } = useBouquet();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredTint, setHoveredTint] = useState(null);

  const handleChipClick = (msg) => {
    console.log('[app/message] -> handleChipClick Called');
    setMessage(msg);
    console.log('[app/message] -> handleChipClick Exited');
  };

  const handleAiGenerate = async () => {
    console.log('[app/message] -> handleAiGenerate Called');
    if (!aiPrompt.trim()) {
      console.log('[app/message] -> handleAiGenerate Exited (Empty)');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      const data = await response.json();
      if (data.caption) {
        setMessage(data.caption);
        setAiPrompt("");
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
      console.log('[app/message] -> handleAiGenerate Exited');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>The Final Touch</h1>
        <p className={styles.subtitle}>Gaze upon your masterpiece and write a heartfelt note.</p>
      </header>

      <div className={styles.twoColumnGrid}>

        {/* LEFT COLUMN: TINTS & CARD */}
        <div className={styles.leftCol}>
          <div style={{ width: '100%', paddingTop: '1rem' }}>
            <label htmlFor="card-tint" className={styles.label}>Card Wax Tint</label>
            <div className={styles.tintToggles} id="card-tint" onMouseLeave={() => setHoveredTint(null)}>
              {CARD_TINTS.map((tint) => (
                <button
                  key={tint.name}
                  id={`tint-${tint.name.toLowerCase().replace(/\s/g, '-')}`}
                  className={`${styles.colorCircle} ${cardTint.name === tint.name ? styles.colorCircleActive : ''}`}
                  style={{ backgroundColor: tint.value }}
                  onClick={() => setCardTint(tint)}
                  onMouseEnter={() => setHoveredTint(tint)}
                  onFocus={() => setHoveredTint(tint)}
                  onBlur={() => setHoveredTint(null)}
                  aria-label={`Select ${tint.name} tint`}
                />
              ))}
            </div>
            <div style={{ minHeight: '1.5rem', marginTop: '0.4rem', fontSize: '0.85rem', color: '#666', fontStyle: 'italic', fontFamily: 'Outfit, sans-serif' }}>
              {hoveredTint ? `${hoveredTint.name} — ${hoveredTint.description}` : `${cardTint.name} — ${cardTint.description}`}
            </div>
          </div>

          <div className={styles.customCard} style={{ backgroundColor: cardTint.value }}>
            {bouquetImage && (
              <img
                src={bouquetImage}
                alt="Your Arrangement"
                style={{ width: '100%', maxWidth: '260px', height: 'auto', objectFit: 'contain' }}
              />
            )}
            <div style={{ width: '100%', borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '1rem', paddingTop: '1rem', flex: 1, display: 'flex' }}>
              <textarea
                id="message-input"
                className={styles.textarea}
                placeholder="Type your personal message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRESETS & AI MAGIC */}
        <div className={styles.rightCol}>

          <div>
            <div className={styles.label}>Quick Inspiration</div>
            <div className={styles.chips}>
              {PRESET_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  className={styles.chip}
                  style={{ background: CHIP_COLORS[idx % CHIP_COLORS.length] }}
                  onClick={() => handleChipClick(msg)}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.aiSection} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="ai-prompt" className={styles.label} style={{ marginBottom: '0.5rem' }}>
              What's the vibe?
            </label>
            <textarea
              id="ai-prompt"
              className={styles.aiInput}
              style={{ flex: 1, minHeight: '80px', resize: 'none' }}
              placeholder="Sorry for eating your fries..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value.slice(0, 150))}
            />
            <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'right', margin: '0.25rem 0' }}>
              {aiPrompt.length}/150
            </p>
            <button
              id="generate-message-btn"
              className="btn-accent"
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              style={{ width: '100%' }}
            >
              {isGenerating ? 'Crafting...' : 'Generate Message'}
            </button>
          </div>
        </div>

      </div>

      {/* NAVIGATION BOTTOM ROW */}
      <div className={styles.navRow}>
        <button
          id="nav-back-message"
          className="btn-back"
          onClick={() => router.push('/arrange')}
        >
          Untie Ribbon
        </button>
        <button
          id="nav-next-message"
          className="btn-primary"
          onClick={() => router.push('/send')}
          disabled={!message.trim()}
        >
          Seal Envelope
        </button>
      </div>
    </div>
  );
}
