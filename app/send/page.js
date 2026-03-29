'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./send.module.css";
import { useBouquet } from "../context/BouquetContext";

export default function SendScreen() {
  const router = useRouter();
  const { message, arrangedFlowers, bouquetImage, setArrangedFlowers, setMessage, setSelectedFlowers, setBouquetImage } = useBouquet();

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    console.log(`[app/send] -> handleChange Called (${e.target.name})`);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    console.log(`[app/send] -> handleChange Exited`);
  };

  const handleSubmit = async (e) => {
    console.log('[app/send] -> handleSubmit Called');
    e.preventDefault();
    setIsSending(true);

    try {
      const payload = {
        ...formData,
        message,
        flowersCount: arrangedFlowers.length,
        image: bouquetImage
      };

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        console.error("Failed to send, ensure server config is correct.");
      }
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setIsSending(false);
      console.log('[app/send] -> handleSubmit Exited');
    }
  };

  const handleReturnHome = () => {
    console.log('[app/send] -> handleReturnHome Called');
    // Reset state
    setSelectedFlowers([]);
    setArrangedFlowers([]);
    setMessage('');
    setBouquetImage(null);
    router.push('/');
    console.log('[app/send] -> handleReturnHome Exited');
  };

  if (isSuccess) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title} style={{ fontSize: '3.5rem' }}>Sent with Love!</h1>
          <p className={styles.subtitle} style={{ fontSize: '1.25rem' }}>
            Your beautiful bouquet and message are on their way to {formData.recipientName}.
          </p>
          <button className="btn-primary" onClick={handleReturnHome} style={{ marginTop: '2rem' }}>
            Build Another Bouquet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Send Your Bouquet</h1>
        <p className={styles.subtitle}>Who is the lucky person?</p>
      </header>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="recipientName" className={styles.label}>Recipient's Name</label>
          <input
            type="text"
            id="recipientName"
            name="recipientName"
            className={styles.input}
            placeholder="E.g. Jane Doe"
            required
            value={formData.recipientName}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="recipientEmail" className={styles.label}>Recipient's Email</label>
          <input
            type="email"
            id="recipientEmail"
            name="recipientEmail"
            className={styles.input}
            placeholder="jane@example.com"
            required
            value={formData.recipientEmail}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="senderName" className={styles.label}>Your Name</label>
          <input
            type="text"
            id="senderName"
            name="senderName"
            className={styles.input}
            placeholder="E.g. John"
            required
            value={formData.senderName}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
          <button
            id="nav-back-send"
            type="button"
            className="btn-back"
            onClick={() => router.push('/message')}
          >
            ← Unseal
          </button>
          <button
            id="submit-bouquet"
            type="submit"
            className="btn-primary"
            style={{ flex: 1, padding: '14px 24px', fontSize: '1.2rem' }}
            disabled={isSending || !formData.recipientEmail || !formData.recipientName}
          >
            {isSending ? "Delivering..." : "Deliver Bouquet 🕊️"}
          </button>
        </div>
      </form>
    </div>
  );
}
