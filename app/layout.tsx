import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-72KFD3RXMX";

export const metadata: Metadata = {
  metadataBase: new URL("https://roicontabilidade.com.br"),
  title: "Diagnóstico Simples Nacional Híbrido | ROI Contabilidade",
  description:
    "Responda ao diagnóstico da ROI Contabilidade e entenda se o Simples Nacional Híbrido deve entrar no radar da sua empresa.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Diagnóstico Simples Nacional Híbrido | ROI Contabilidade",
    description:
      "Um diagnóstico inicial para empresas do Simples que querem entender impactos de IBS/CBS, crédito tributário e competitividade.",
    type: "website",
    images: ["/logo-roi.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
