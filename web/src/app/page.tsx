import { CheckInPanel } from "@/components/CheckInPanel";
import { PowerGridGame } from "@/components/game/PowerGridGame";
import { WalletBar } from "@/components/WalletBar";

export default function Home() {
  return (
    <>
      <WalletBar />
      <header className="mb-6 mt-4 w-full max-w-md text-center">
        <p className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-[0.55em] text-fuchsia-400/80">
          BASE // NEON GRID OPS
        </p>
        <h1 className="mt-3 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-violet-400 bg-clip-text font-[family-name:var(--font-orbitron)] text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          Power Grid Sim
        </h1>
        <p className="mx-auto mt-2 max-w-sm font-mono text-[11px] leading-relaxed text-cyan-100/65">
          Rotate conduits with swipes. Feed every substation from the reactor
          stack — daily check-in lives on-chain below.
        </p>
      </header>

      <main className="flex w-full flex-1 flex-col items-center">
        <PowerGridGame />
        <CheckInPanel />
      </main>
    </>
  );
}
