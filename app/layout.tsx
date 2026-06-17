import type { Metadata } from "next";
import localFont from "next/font/local";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
// import DappledLight from "./components/DappledLight";
// import FullScreenCover from "./components/FullScreenCover";

const gimletDisplay = localFont({
    src: "../public/fonts/GimletDisplayCompressed-Italic-Testing.woff2",
    variable: "--font-heading",
    style: "italic",
});

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    variable: "--font-body",
});

export const metadata: Metadata = {
    title: "Alair Ferguson Hautzinger",
    description: "Alair's personal website",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${gimletDisplay.variable} ${ebGaramond.variable}`}>
            <body>
                {/* <FullScreenCover /> */}
                {/* <DappledLight /> */}
                {children}
            </body>
        </html>
    );
}
