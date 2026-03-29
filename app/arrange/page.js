'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import domtoimage from "dom-to-image-more";
import styles from "./arrange.module.css";
import { useBouquet } from "../context/BouquetContext";

// Polar coordinate scatter limits (tuned for 420x510 canvas)
const SCATTER_RADIUS = 120;
const SCATTER_RADIUS_MIN = 25;

// Index 0 = None (null), 1-3 = greenery images
const GREENERY_BASES = [
  null,
  "/assets/greenery_base_new_1.png",
  "/assets/greenery_base_new_2.png",
  "/assets/greenery_base_new_3.png"
];

export default function ArrangeFlowers() {
  const router = useRouter();
  const {
    selectedFlowers,
    arrangedFlowers,
    setArrangedFlowers,
    selectedGreeneryBase,
    setSelectedGreeneryBase,
    setBouquetImage
  } = useBouquet();

  const [arranged, setArranged] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const canvasRef = useRef(null);

  // ─── Mount: restore previous arrangement or scatter fresh ───
  useEffect(() => {
    console.log('[app/arrange] -> useEffect mount');
    if (selectedFlowers.length === 0) {
      router.push('/select');
      return;
    }

    if (arrangedFlowers && arrangedFlowers.length === selectedFlowers.length) {
      setArranged(JSON.parse(JSON.stringify(arrangedFlowers)));
    } else {
      doShuffle();
    }

    // Tutorial auto-dismiss
    const timer = setTimeout(() => setShowTutorial(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // ─── Shuffle: polar coordinate scatter ───
  const doShuffle = () => {
    console.log('[app/arrange] -> doShuffle Called');
    const shuffled = [...selectedFlowers].sort(() => 0.5 - Math.random());

    const mapped = shuffled.map((flower, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = SCATTER_RADIUS_MIN + Math.random() * (SCATTER_RADIUS - SCATTER_RADIUS_MIN);
      return {
        ...flower,
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          scale: 1 + Math.random() * 0.35,
          rot: (Math.random() * 16) - 8,
          z: 10 + i
        }
      };
    });

    setArranged(mapped);
    console.log('[app/arrange] -> doShuffle Exited');
  };

  // ─── Capture snapshot & navigate ───
  const handleNext = async () => {
    console.log('[app/arrange] -> handleNext Called');
    if (!canvasRef.current) return;

    setIsCapturing(true);
    setArrangedFlowers(arranged);

    try {
      const dataUrl = await domtoimage.toPng(canvasRef.current, {
        width: 420,
        height: 510,
        bgcolor: 'transparent',
        style: { transform: 'none', left: '0', top: '0' }
      });
      setBouquetImage(dataUrl);
      console.log('[app/arrange] -> handleNext Success');
      router.push('/message');
    } catch (err) {
      console.error("Capture failed:", err);
      router.push('/message');
    }

    setIsCapturing(false);
  };

  // ─── Drag end handler ───
  const onFlowerDragEnd = (flowerId, info) => {
    console.log('[app/arrange] -> onFlowerDragEnd');
    setArranged(prev =>
      prev.map(f => {
        if ((f.uid || f.id) === flowerId) {
          return {
            ...f,
            position: {
              ...f.position,
              x: f.position.x + info.offset.x,
              y: f.position.y + info.offset.y
            }
          };
        }
        return f;
      })
    );
  };

  // Whether the user chose a greenery backdrop (not "None")
  const hasGreenery = selectedGreeneryBase !== 0;

  return (
    <div className={styles.page}>

      {/* ─── HEADER ─── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Go Wild With It</h1>
        <p className={styles.subtitle}>Drag the flowers around. Pick a backdrop. Make it yours.</p>
      </header>

      {/* ─── MAIN SPLIT: Options (left) | Canvas (right) ─── */}
      <div className={styles.split}>

        {/* LEFT: Greenery options + Shuffle */}
        <div className={styles.optionsCol}>
          <div>
            <h3 className={styles.sectionLabel}>Backdrop</h3>
            <div className={styles.greeneryGrid}>
              {GREENERY_BASES.map((base, idx) => (
                <button
                  key={idx}
                  id={`greenery-option-${idx}`}
                  className={`${styles.greeneryCard} ${selectedGreeneryBase === idx ? styles.greeneryCardActive : ''}`}
                  onClick={() => setSelectedGreeneryBase(idx)}
                >
                  {base ? (
                    <Image src={base} alt={`Greenery ${idx}`} fill style={{ objectFit: 'cover' }} sizes="120px" />
                  ) : (
                    <span className={styles.greeneryCardLabel}>None</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button id="shuffle-btn" className="btn-secondary" onClick={doShuffle} style={{ width: '100%' }}>
            🔀 Shuffle
          </button>
        </div>

        {/* RIGHT: The Canvas */}
        <div className={styles.canvasCol}>
          <div className={styles.canvas} ref={canvasRef}>

            {/* Tutorial overlay */}
            {showTutorial && (
              <div className={styles.tutorialOverlay}>
                <div className={styles.handEmoji}>👆</div>
              </div>
            )}

            {/* Greenery base (only when not "None") */}
            {hasGreenery && (
              <div className={styles.greeneryBase}>
                <Image
                  src={GREENERY_BASES[selectedGreeneryBase]}
                  alt="Greenery Base"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            )}

            {/* Baby's breath filler — only with greenery */}
            {hasGreenery && (
              <div className={styles.fillerLayer}>
                <Image
                  src="/assets/filler_babys_breath.png"
                  alt="Baby's Breath"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Draggable flowers */}
            {arranged.map(flower => {
              const id = flower.uid || flower.id;
              return (
                <motion.div
                  key={id}
                  className={`${styles.flowerLayer} ${hasGreenery ? styles.maskedFlower : ''}`}
                  drag
                  dragMomentum={false}
                  whileDrag={{ scale: 1.1, zIndex: 100 }}
                  onDragEnd={(e, info) => onFlowerDragEnd(id, info)}
                  initial={{
                    x: flower.position.x,
                    y: flower.position.y,
                    scale: flower.position.scale,
                    rotate: flower.position.rot
                  }}
                  animate={{
                    x: flower.position.x,
                    y: flower.position.y,
                    scale: flower.position.scale,
                    rotate: flower.position.rot
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{
                    zIndex: flower.position.z,
                    width: '180px',
                    height: '180px',
                    left: '120px',
                    top: '165px',
                    cursor: 'grab'
                  }}
                >
                  <Image
                    src={flower.image}
                    alt={flower.name}
                    fill
                    style={{ objectFit: 'contain', pointerEvents: 'none' }}
                    sizes="180px"
                    draggable={false}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── FOOTER NAV ─── */}
      <div className={styles.footer}>
        <button id="nav-back-arrange" className="btn-back" onClick={() => router.push('/select')}>
          ← Garden
        </button>
        <button
          id="nav-next-arrange"
          className="btn-primary"
          onClick={handleNext}
          disabled={isCapturing}
        >
          {isCapturing ? "Tying..." : "Tie Ribbon 🎀"}
        </button>
      </div>
    </div>
  );
}
