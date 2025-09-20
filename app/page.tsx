import clsx from "clsx";

import LandingHero from "@/components/pages/landing/hero";
import { LandingHeader } from "@/components/pages/landing/header/landing-header";

import LandingPageCSS from "./landing-page.module.css";

export default function Home() {
  return (
    <main className={clsx("min-h-screen", LandingPageCSS.background)}>
      <LandingHeader />
      <LandingHero />
    </main>
  );
}
