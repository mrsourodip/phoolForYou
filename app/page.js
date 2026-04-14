'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";
import { useBouquet } from "./context/BouquetContext";

const mockBouquets = [
  { id: 1, name: "Summer Love", image: "/assets/bouquet_1.png" },
  { id: 2, name: "Pastel Dream", image: "/assets/bouquet_2.png" },
  { id: 3, name: "Wild Romance", image: "/assets/bouquet_3.png" },
  { id: 4, name: "Morning Dew", image: "/assets/bouquet_1.png" },
  { id: 5, name: "Sweetheart", image: "/assets/bouquet_2.png" },
  { id: 6, name: "Spring Charm", image: "/assets/bouquet_3.png" },
  { id: 7, name: "Blush Roses", image: "/assets/bouquet_1.png" },
  { id: 8, name: "Elegance", image: "/assets/bouquet_2.png" },
];

export default function Home() {
  const router = useRouter();
  const { setArrangedFlowers, setBouquetImage } = useBouquet();
  const [bouquets, setBouquets] = useState(mockBouquets);
  const [isLoading, setIsLoading] = useState(false);

  // Typewriter State
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["fool", "phool"];

  const fetchedRef = useRef(false);

  useEffect(() => {
    let timer = setTimeout(() => {
      handleType();
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typingSpeed]);

  const handleType = () => {
    const i = loopNum % words.length;
    const fullText = words[i];

    setDisplayText(
      isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1)
    );

    setTypingSpeed(isDeleting ? 100 : 150);

    if (!isDeleting && displayText === fullText) {
      setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setTypingSpeed(500);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchBouquets() {
      try {
        const res = await fetch('/api/bouquets');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBouquets(data);
        } else {
          setBouquets(mockBouquets); // Fallback to mocks
        }
      } catch (error) {
        console.error("Failed to fetch bouquets:", error);
        setBouquets(mockBouquets);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBouquets();
  }, []);

  const handleStart = () => {
    router.push("/select");
  };

  const handleSelectPreset = (bq) => {
    // If it's a real bouquet from DB, it has flower_data and image_data
    if (bq.flower_data) {
      setArrangedFlowers(bq.flower_data);
      setBouquetImage(bq.image_data);
    } else {
      // It's a mock
      setArrangedFlowers([{ ...bq, type: 'preset' }]);
      setBouquetImage(bq.image);
    }
    router.push("/message");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <Image src="/assets/logo.png" alt="FoolForYou" width={120} height={120} style={{ marginBottom: '-1.5rem' }} priority />
        <h1 className={styles.title}>
          Always a{" "}
          <span style={{
            color: words[loopNum % words.length] === "phool" ? "#eaa1d5ff" : "inherit",
            fontStyle: "italic",
          }}>
            {displayText}
            <span className={styles.cursor}>|</span>
          </span>{" "}
          for you
        </h1>
        <p className={styles.subtitle}>Crafted in pixels. Delivered to the heart.</p>
        <button onClick={handleStart} className="btn-primary">
          Lets Phool Together
        </button>
      </main>

      <section className={styles.gallery}>
        <h2 className={styles.galleryTitle}>Lazy fool? We've got your phool.</h2>
        <div className={styles.grid}>
          {(bouquets || []).map((bq) => {
            const label = bq.created_at ? `Created ${formatDate(bq.created_at)}` : bq.name;
            const img = bq.image_data || bq.image;
            return (
              <div
                key={bq.id}
                className={styles.card}
                onClick={() => handleSelectPreset(bq)}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={img}
                    alt={label}
                    fill
                    className={styles.cardImage}
                    unoptimized={!!bq.image_data} // Required for base64
                  />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.name}>{label}</h3>
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.cartBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPreset(bq);
                      }}
                      aria-label={`Select ${label}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}