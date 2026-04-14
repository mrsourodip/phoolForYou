'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

    setSelectedGreeneryBase,
    setBouquetImage,
    selectedGreeneryBase,
    removeFlower
  } = useBouquet();

  const [arranged, setArranged] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [stageScale, setStageScale] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      // Only apply scaling on mobile resolutions (< 768px)
      if (window.innerWidth < 768) {
        const padding = 48; // Increased padding for mobile safety margin
        const availableWidth = window.innerWidth - padding;
        if (availableWidth < 420) {
          setStageScale(availableWidth / 420);
        } else {
          setStageScale(1);
        }
      } else {
        setStageScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    // Tutorial auto-dismiss on mount is now replaced by interaction dismissal
    return () => {};
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
    if (!canvasRef.current) return;

    setIsCapturing(true);
    setArrangedFlowers(arranged);

    try {
      const domtoimage = (await import('dom-to-image-more')).default;

      const dataUrl = await domtoimage.toPng(canvasRef.current, {
        width: 420,
        height: 510,
        bgcolor: 'transparent',
        style: { transform: 'none', left: '0', top: '0' }
      });

      setBouquetImage(dataUrl);
      router.push('/message');
    } catch (err) {
      console.error("Capture failed:", err);
      router.push('/message');
    }

    setIsCapturing(false);
  };

  // ─── Drag handlers ───
  const onPointerDown = (flowerId) => {
    // Dismiss tutorial on first interaction
    if (showTutorial) setShowTutorial(false);
    
    // Bring the flower to the top by maximizing its Z
    setArranged(prev => {
      const maxZ = Math.max(...prev.map(f => f.position.z), 10);
      return prev.map(f => {
        if ((f.uid || f.id) === flowerId) {
          return { ...f, position: { ...f.position, z: maxZ + 1 } };
        }
        return f;
      });
    });
  };

  const onFlowerDragEnd = (flowerId, info) => {
    // Check if we dropped over the "Stand" (bottom right area)
    // Canvas: 420x510. Top left of canvas is at 0,0 relative to its container.
    // However, flower positions are tracked relative to their "left: 120, top: 165" starting point.
    // The Stand is roughly at x: 300+, y: 400+ relative to the canvas origin.

    const finalX = info.point.x;
    const finalY = info.point.y;

    // Simplest detection: check the info.offset or just the local position within the canvas
    const x = arranged.find(f => (f.uid || f.id) === flowerId)?.position.x + info.offset.x;
    const y = arranged.find(f => (f.uid || f.id) === flowerId)?.position.y + info.offset.y;

    // The Stand is roughly at local coordinates (x > 80, y > 150) given starting (0,0) is center
    // Let's use a simpler check: if it's in the bottom right 100px of the 420x510 canvas
    if (x > 100 && y > 140) {
      // Remove it!
      // Animate out is handled by the presence of the flower in the set
      removeFlower(flowerId);
      setArranged(prev => prev.filter(f => (f.uid || f.id) !== flowerId));
      return;
    }

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

          <button
            id="add-blooms-btn"
            className="btn-secondary"
            onClick={() => router.push('/select')}
            style={{ width: '100%' }}
          >
            Add More Blooms
          </button>

          <button id="shuffle-btn" className="btn-secondary" onClick={doShuffle} style={{ width: '100%' }}>
            Shuffle Arrangement
          </button>
        </div>

        {/* RIGHT: The Canvas */}
        <div className={styles.canvasCol}>
          <div 
            className={styles.canvasContainer}
            style={{ 
              width: 420 * stageScale, 
              height: 510 * stageScale 
            }}
          >
            <div 
              className={styles.canvas} 
              ref={canvasRef}
              style={{ 
                transform: `scale(${stageScale})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Tutorial overlay */}
              {showTutorial && (
                <div className={styles.tutorialOverlay}>
                  <motion.div 
                    className={styles.tutorialHint}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      scale: [0.8, 1, 1, 0.8],
                      x: [0, 80, 80, 80]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      times: [0, 0.2, 0.8, 1]
                    }}
                  >
                    <div className={styles.ripple} />
                    <span className={styles.hintText}>
                      {stageScale < 1 ? "TAP & HOLD TO DRAG" : "DRAG TO ARRANGE"}
                    </span>
                  </motion.div>
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

              {/* Draggable flowers */}
              {arranged.map(flower => {
                const id = flower.uid || flower.id;
                return (
                  <motion.div
                    key={id}
                    className={styles.flowerLayer}
                    drag
                    dragMomentum={false}
                    dragElastic={0.1}
                    whileDrag={{
                      scale: 1.3,
                      cursor: 'grabbing',
                      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))'
                    }}
                    onPointerDown={() => onPointerDown(id)}
                    onDragEnd={(e, info) => onFlowerDragEnd(id, info)}
                    initial={{
                      x: flower.position.x,
                      y: flower.position.y,
                      scale: flower.position.scale,
                      rotate: flower.position.rot,
                      opacity: 1
                    }}
                    animate={{
                      x: flower.position.x,
                      y: flower.position.y,
                      scale: flower.position.scale,
                      rotate: flower.position.rot,
                      opacity: 1
                    }}
                    exit={{ 
                      x: 130, 
                      y: 150, 
                      scale: 0.2, 
                      opacity: 0,
                      rotate: 15,
                      transition: { duration: 0.4, ease: "easeIn" } 
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    style={{
                      zIndex: flower.position.z,
                      left: '175px',
                      top: '220px',
                      cursor: 'grab'
                    }}
                  >
                    <Image
                      className={hasGreenery ? styles.maskedFlower : ''}
                      src={flower.image}
                      alt={flower.name}
                      width={120}
                      height={120}
                      style={{ objectFit: 'contain', pointerEvents: 'none' }}
                      draggable={false}
                    />
                  </motion.div>
                );
              })}

              {/* The Flower Stand (Removal Zone) - Hide during capture */}
              {!isCapturing && (
                <div className={styles.flowerStand}>
                  <div className={styles.standIcon}>🧺</div>
                  <div className={styles.standLabel}>Stand</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button id="nav-back-arrange" className="btn-back" onClick={() => router.push('/select')}>
          Back to Garden
        </button>
        <button
          id="nav-next-arrange"
          className="btn-primary"
          onClick={handleNext}
          disabled={isCapturing}
        >
          {isCapturing ? "Tying..." : "Tie Ribbon"}
        </button>
      </div>
    </div>
  );
}
