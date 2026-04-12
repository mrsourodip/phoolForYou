'use client';

import { createContext, useContext, useState } from 'react';

const BouquetContext = createContext(undefined);

export function BouquetProvider({ children }) {
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [arrangedFlowers, setArrangedFlowers] = useState([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [selectedGreeneryBase, setSelectedGreeneryBase] = useState(1);
  const [message, setMessage] = useState('');
  const [bouquetImage, setBouquetImage] = useState(null);
  const [cardTint, setCardTint] = useState({ name: 'Warm Linen', value: '#EDE8DF', description: 'For when you just want to say hello' });

  const addFlower = (flower) => {
    console.log('[Context] -> addFlower Called');
    setSelectedFlowers((prev) => [...prev, { ...flower, uid: crypto.randomUUID() }]);
    console.log('[Context] -> addFlower Exited');
  };

  const removeFlower = (id) => {
    console.log('[Context] -> removeFlower Called');
    setSelectedFlowers((prev) => {
      const index = prev.findIndex(f => f.uid === id || f.id === id);
      if (index !== -1) {
        const newArr = [...prev];
        newArr.splice(index, 1);
        console.log('[Context] -> removeFlower Exited (Removed)');
        return newArr;
      }
      console.log('[Context] -> removeFlower Exited (Not Found)');
      return prev;
    });
  };

  return (
    <BouquetContext.Provider
      value={{
        selectedFlowers,
        setSelectedFlowers,
        addFlower,
        removeFlower,
        arrangedFlowers,
        setArrangedFlowers,
        selectedPresetIndex,
        setSelectedPresetIndex,
        selectedGreeneryBase,
        setSelectedGreeneryBase,
        message,
        setMessage,
        bouquetImage,
        setBouquetImage,
        cardTint,
        setCardTint
      }}
    >
      {children}
    </BouquetContext.Provider>
  );
}

export function useBouquet() {
  const context = useContext(BouquetContext);
  if (context === undefined) {
    throw new Error('useBouquet must be used within a BouquetProvider');
  }
  return context;
}
