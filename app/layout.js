import "./globals.css";
import { BouquetProvider } from "./context/BouquetContext";
import GlobalHeader from "./components/GlobalHeader";

export const metadata = {
  title: "FoolForYou | Digital Bouquets",
  description: "Always a fool for you. Send a beautiful digital bouquet to your loved ones.",
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BouquetProvider>
          <GlobalHeader />
          {children}
        </BouquetProvider>
      </body>
    </html>
  );
}
