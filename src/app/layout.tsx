import type { Metadata } from "next";
import { Noto_Sans_JP, Chakra_Petch } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: 'swap',
  weight: ["300", "400", "500", "700"],
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  display: 'swap',
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coreberg Social | Cinematic Monolith",
  description: "Intelligence for the Real World. AIの可能性を現実世界へ落とし込み、「人間の可能性」を最大化する。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${chakraPetch.variable} h-full antialiased bg-black`}
    >
      <body className="min-h-full flex flex-col font-sans bg-base text-primary">{children}</body>
    </html>
  );
}
