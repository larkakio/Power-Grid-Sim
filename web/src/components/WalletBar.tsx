"use client";

import { useEffect, useState } from "react";
import { base } from "wagmi/chains";
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const connectors = useConnectors();
  const { connect, isPending: isConnecting, error: connectError } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);

  const wrong = isConnected && chainId !== base.id;

  useEffect(() => {
    if (isConnected) setSheetOpen(false);
  }, [isConnected]);

  return (
    <div className="relative z-20 w-full max-w-md px-3 pt-3">
      {wrong ? (
        <div
          className="neon-panel mb-3 flex flex-wrap items-center justify-between gap-2 border border-amber-400/50 p-3 text-xs text-amber-100"
          role="status"
        >
          <span>Wrong network — switch to Base.</span>
          <button
            type="button"
            className="neon-btn shrink-0 px-3 py-1.5 text-[11px]"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: base.id })}
          >
            {isSwitching ? "Switching…" : "Switch to Base"}
          </button>
        </div>
      ) : null}

      <div className="neon-panel flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0 font-mono text-[11px] text-cyan-100/90">
          {isConnected && address ? (
            <span className="truncate">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          ) : (
            <span className="text-fuchsia-200/80">Wallet offline</span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {isConnected ? (
            <button
              type="button"
              className="neon-btn-secondary px-3 py-1.5 text-[11px]"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              className="neon-btn px-4 py-2 text-xs font-semibold tracking-wide"
              onClick={() => setSheetOpen(true)}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting…" : "Connect wallet"}
            </button>
          )}
        </div>
      </div>

      {sheetOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Choose wallet"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="neon-panel max-h-[55vh] overflow-auto rounded-t-2xl border border-cyan-400/30 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 font-[family-name:var(--font-orbitron)] text-sm tracking-wide text-cyan-200">
              Select wallet
            </p>
            <ul className="flex flex-col gap-2">
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-violet-500/40 bg-violet-950/40 px-3 py-3 text-left text-sm text-violet-100 transition hover:border-cyan-400/60 hover:bg-cyan-950/30"
                    onClick={() =>
                      connect({ connector: c, chainId: base.id })
                    }
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            {connectError ? (
              <p className="mt-2 text-xs text-rose-300">{connectError.message}</p>
            ) : null}
            <button
              type="button"
              className="mt-4 w-full py-2 text-center text-xs text-slate-400"
              onClick={() => setSheetOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
