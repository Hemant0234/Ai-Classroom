"use client";

import type { PropsWithChildren } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <SignedIn>
        <main className="h-full">
          <Sidebar />

          <div className="h-full pl-[92px]">
            <div className="h-full">
              <Navbar />
              {children}
            </div>
          </div>
        </main>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default DashboardLayout;
