// "use client";

// import { useAuth } from "@clerk/nextjs";
// import { AuthLoading, Authenticated, Unauthenticated, ConvexReactClient } from "convex/react";
// import { ConvexProviderWithClerk } from "convex/react-clerk";
// import type { PropsWithChildren } from "react";

// import { Loading } from "@/components/auth/loading";

// const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
// const convex = new ConvexReactClient(convexUrl);

// export const ConvexClientProvider = ({ children }: PropsWithChildren) => {
//   return (
//     <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
//       <Authenticated>{children}</Authenticated>
//       <Unauthenticated>
//         <RedirectToSignIn />
//       </Unauthenticated>
//       <AuthLoading>
//         <Loading />
//       </AuthLoading>
//     </ConvexProviderWithClerk>
//   );
// };


"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { PropsWithChildren } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(convexUrl);

export const ConvexClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
      {children}
    </ConvexProviderWithClerk>
  );
};