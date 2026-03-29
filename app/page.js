'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const handleStart = () => {
    router.push("/select");
  };

  const handleSelectPreset = (bouquet) => {
    setArrangedFlowers([{ ...bouquet, type: 'preset' }]);
    setBouquetImage(bouquet.image);
    router.push("/message");
  };

  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <Image src="/assets/logo.png" alt="FoolForYou" width={120} height={120} style={{ marginBottom: '-1.5rem' }} priority />
        <h1 className={styles.title}>Always a fool for you</h1>
        <p className={styles.subtitle}>Crafted in pixels. Delivered to the heart.</p>
        <button onClick={handleStart} className="btn-primary">
          Lets Phool Together!
        </button>
      </main>

      <section className={styles.gallery}>
        <h2 className={styles.galleryTitle}>Lazy fool? We've got your phool.</h2>
        <div className={styles.grid}>
          {mockBouquets.map((bq) => (
            <div
              key={bq.id}
              className={styles.card}
              onClick={() => handleSelectPreset(bq)}
            >
              <h3 className={styles.name}>{bq.name}</h3> {/* Name on top */}

              <div className={styles.imageWrapper}>
                <Image
                  src={bq.image}
                  alt={bq.name}
                  fill
                  className={styles.cardImage}
                />
              </div>

              <button
                className={styles.cartBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPreset(bq);
                }}
                aria-label={`Add ${bq.name} to cart`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="17" cy="20" r="1" />
                  <path d="M3 3h2l2.4 12.5a2 2 0 0 0 2 1.5h7.2a2 2 0 0 0 2-1.6L21 7H6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}