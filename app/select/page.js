'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./select.module.css";
import { useBouquet } from "../context/BouquetContext";

const availableFlowers = [
  { id: 'f1', name: "Pink Tulip", image: "/assets/flower_new_tulip.png", trait: "Loves to seek the sun" },
  { id: 'f2', name: "Sunflower", image: "/assets/flower_new_sunflower.png", trait: "Radiates warm energy" },
  { id: 'f3', name: "Purple Lily", image: "/assets/flower_new_purple_lily.png", trait: "Graceful and elegant" },
  { id: 'f4', name: "Red Rose", image: "/assets/flower_new_red_rose.png", trait: "A hopeless romantic" },
  { id: 'f5', name: "White Daisy", image: "/assets/flower_new_daisy.png", trait: "Innocent and pure" },
  { id: 'f6', name: "Pink Peony", image: "/assets/flower_new_pink_peony.png", trait: "Very demure, very mindful" },
  { id: 'f7', name: "Blue Anemone", image: "/assets/flower_new_blue_anemone.png", trait: "A bit mysterious" },
  { id: 'f8', name: "Orange Ranunculus", image: "/assets/flower_new_orange_ranunculus.png", trait: "Bursting with charm" },
  { id: 'f9', name: "Pink Carnation", image: "/assets/flower_new_carnation.png", trait: "Always sweet and reliable" },
  { id: 'f10', name: "Yellow Daffodil", image: "/assets/flower_new_daffodil.png", trait: "Harbinger of joy" },
  { id: 'f11', name: "Violet Aster", image: "/assets/flower_new_aster.png", trait: "Wild and free-spirited" },
  // Fillers
  { id: 'f12', name: "Baby's Breath", image: "/assets/filler_babys_breath.png", trait: "Light as a cloud" },
  { id: 'f13', name: "Purple Statice", image: "/assets/filler_statice.png", trait: "Everlasting memory" },
  { id: 'f14', name: "Pink Snapdragon", image: "/assets/filler_snapdragon.png", trait: "Strong and tall" },
  { id: 'f15', name: "Green Poms", image: "/assets/filler_poms.png", trait: "Bouncy and fun" },
  { id: 'f16', name: "Pink Dianthus", image: "/assets/filler_dianthus.png", trait: "Sweet and spicy" },
  // Greenery options hidden by request for now
  // { id: 'f17', name: "Bells of Ireland", image: "/assets/greenery_bells_of_ireland.png", trait: "Brings good luck" },
  // { id: 'f18', name: "Ivy Vine", image: "/assets/greenery_ivy.png", trait: "Clings with affection" },
  // { id: 'f19', name: "Grevillea", image: "/assets/greenery_grevillea.png", trait: "Textured and bold" },
];

export default function SelectFlowers() {
  const router = useRouter();
  const { selectedFlowers, addFlower, removeFlower, setSelectedFlowers } = useBouquet();

  const handleAdd = (flower, e) => {
    console.log('[app/select] -> handleAdd Called for', flower.name);
    if (e) e.stopPropagation();
    addFlower(flower);
    console.log('[app/select] -> handleAdd Exited');
  };

  const handleRemove = (flower, e) => {
    console.log('[app/select] -> handleRemove Called for', flower.name);
    if (e) e.stopPropagation();
    removeFlower(flower.id);
    console.log('[app/select] -> handleRemove Exited');
  };

  const selectedCount = selectedFlowers.length;

  // Group selected flowers for the mini stack
  const selectedGroups = selectedFlowers.reduce((acc, flower) => {
    const existing = acc.find(f => f.name === flower.name);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ ...flower, count: 1 });
    }
    return acc;
  }, []);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Today's Fresh Picks</h1>
        <p className={styles.subtitle}>Pick at least 6—mix them up or go all in on one you love.</p>
      </header>

      <div className={styles.grid}>
        {availableFlowers.map((flower) => {
          const count = selectedFlowers.filter(f => f.name === flower.name).length;

          return (
            <div
              key={flower.id}
              className={`${styles.card} ${count > 0 ? styles.selectedCard : ''}`}
            >
              <div className={styles.imageContainer} onClick={(e) => handleAdd(flower, e)}>
                <Image
                  src={flower.image}
                  alt={flower.name}
                  fill
                  className={styles.image}
                  priority={availableFlowers.indexOf(flower) < 4}
                />
                <div className={styles.traitOverlay}>
                  <span className={styles.traitText}>{flower.trait}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <p className={styles.flowerName}>{flower.name}</p>
                {count > 0 ? (
                  <div className={styles.counterPill}>
                    <button className={styles.counterBtn} onClick={(e) => handleRemove(flower, e)}>-</button>
                    <span className={styles.counterValue}>{count}</span>
                    <button className={styles.counterBtn} onClick={(e) => handleAdd(flower, e)}>+</button>
                  </div>
                ) : (
                  <button className={styles.addInitialBtn} onClick={(e) => handleAdd(flower, e)}>+</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <motion.div
        className={styles.bottomBar}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className={styles.barLeft}>
          <span className={styles.barTitle}>Cart ({selectedCount})</span>
          <div className={styles.selectedStack}>
            {selectedGroups.slice(0, 5).map((g) => (
              <div key={g.name} className={styles.miniThumb}>
                <Image src={g.image} alt={g.name} fill className={styles.miniImage} />
                {g.count > 1 && <span className={styles.miniCount}>{g.count}</span>}
              </div>
            ))}
            {selectedGroups.length > 5 && <span style={{ alignSelf: 'center', opacity: 0.6 }}>+{selectedGroups.length - 5}</span>}
          </div>
        </div>

        <div className={styles.barRight}>
          {selectedCount > 0 && (
            <button
              className="btn-discard"
              onClick={() => {
                console.log('[app/select] -> Reset Garden Called');
                setSelectedFlowers([]);
              }}
            >
              Discard
            </button>
          )}
          <button
            className="btn-back"
            onClick={() => router.push('/')}
          >
            Go Back
          </button>
          <button
            className="btn-primary"
            disabled={selectedCount < 6}
            onClick={() => router.push('/arrange')}
          >
            {selectedCount < 6 ? `Pick ${6 - selectedCount} More` : "Arrange"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
