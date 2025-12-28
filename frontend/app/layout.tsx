import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ARGUS • Real-Time Incident Response Platform",
    description:
        "Real-time situational awareness for emergency responders. Report incidents, coordinate responses, and save lives with millisecond precision.",
    keywords: ["incident response", "emergency", "real-time", "responders", "safety"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>{children}</body>
        </html>
    );
}
