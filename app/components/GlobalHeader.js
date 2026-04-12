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
    setCardTint({ name: 'Warm Linen', value: '#EDE8DF', description: 'For when you just want to say hello' })
    router.push('/');
  };

  // Don't show header on home page
  if (pathname === '/') return null;

  return (
    <header className="globalHeader">
      <button
        onClick={handleLogoClick}
        className="headerBtn"
        title="Start fresh — go home"
      >
        <Image src="/assets/logo.png" alt="FoolForYou" width={32} height={32} />
        <span className="headerTitle">
          FoolForYou
        </span>
      </button>
    </header>
  );
}
