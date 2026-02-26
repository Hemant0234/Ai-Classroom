// import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
// import { Suspense } from "react";

// import { Loading } from "@/components/auth/loading";
// import { Toaster } from "@/components/ui/sonner";
// import { siteConfig } from "@/config";
// import { ConvexClientProvider } from "@/providers/convex-client-provider";
// import { ModalProvider } from "@/providers/modal-provider";
// import { ClerkProvider } from "@clerk/nextjs";


// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = siteConfig;

// export const viewport: Viewport = {
//   themeColor: "#fff",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//   <ClerkProvider>
//     <html lang="en">
//       <body className={inter.className}>
//         <Suspense fallback={<Loading />}>
//           <ConvexClientProvider>
//             <Toaster theme="light" closeButton richColors />
//             <ModalProvider />
//             {children}
//           </ConvexClientProvider>
//         </Suspense>
//       </body>
//     </html>
//   </ClerkProvider>
//   );

// }

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { Loading } from "@/components/auth/loading";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import { ModalProvider } from "@/providers/modal-provider";
import dynamic from "next/dynamic";

const ConnectPanel = dynamic(
  () => import("@/components/connect-panel").then((mod) => mod.ConnectPanel),
  { ssr: false }
);

const AiPanel = dynamic(
  () => import("@/components/ai-panel").then((mod) => mod.AiPanel),
  { ssr: false }
);

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = siteConfig;

export const viewport: Viewport = {
  themeColor: "#fff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ConvexClientProvider>
            <Toaster theme="light" closeButton richColors />
            <ModalProvider />
            <ConnectPanel />
            <AiPanel />
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
// import { ClerkProvider } from "@clerk/nextjs";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <ClerkProvider>
//           {children}
//         </ClerkProvider>
//       </body>
//     </html>
//   );
// }
