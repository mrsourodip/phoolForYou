'use client';

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useBouquet } from "../context/BouquetContext";

export default function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSelectedFlowers, setArrangedFlowers, setMessage, setBouquetImage, setSelectedGreeneryBase, setCardTint } = useBouquet();

  const handleLogoClick = () => {
    if (pathname === '/') return;
    
    // Full reset
    setSelectedFlowers([]);
    setArrangedFlowers([]);
    setMessage('');
    setBouquetImage(null);
    setSelectedGreeneryBase(1);
    setCardTint({ name: 'Artisan Cream', value: '#FDFCFA' });
    router.push('/');
  };

  // Don't show header on home page
  if (pathname === '/') return null;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 24px',
      background: 'rgba(245, 244, 236, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
    }}>
      <button
        onClick={handleLogoClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
        }}
        title="Start fresh — go home"
      >
        <Image src="/assets/logo.png" alt="FoolForYou" width={32} height={32} />
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: '1.1rem',
          color: '#333',
          fontWeight: 400,
        }}>
          FoolForYou
        </span>
      </button>
    </header>
  );
}
