import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-72KFD3RXMX";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1035841049088530";

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
        {META_PIXEL_ID ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                height="1"
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                style={{ display: "none" }}
                width="1"
              />
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
