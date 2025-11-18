"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "sonner";

export default function HomePage() {
  return (
    <>
      <MainLayout />
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}
