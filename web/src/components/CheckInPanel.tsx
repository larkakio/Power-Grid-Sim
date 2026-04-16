"use client";

import { useMemo } from "react";
import { base } from "wagmi/chains";
import { isAddress } from "viem";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { checkInAbi } from "@/lib/abi/checkIn";
import { getCheckInDataSuffix } from "@/lib/builder/getCheckInDataSuffix";

function contractAddress(): `0x${string}` | undefined {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS?.trim();
  if (!raw || !isAddress(raw)) return undefined;
  return raw as `0x${string}`;
}

export function CheckInPanel() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  const addr = contractAddress();
  const dataSuffix = useMemo(() => getCheckInDataSuffix(), []);
  const ready = Boolean(addr && isConnected);

  async function onCheckIn() {
    if (!addr) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    await writeContractAsync({
      address: addr,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      value: 0n,
      ...(dataSuffix ? { dataSuffix } : {}),
    });
  }

  const disabled = !ready || isPending || isSwitching;

  return (
    <div className="neon-panel mt-4 w-full max-w-md px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.2em] text-fuchsia-300/90">
            Daily on-chain
          </p>
          <p className="mt-1 font-mono text-[10px] text-cyan-200/60">
            Check in once per day on Base (gas only). Builder attribution suffix
            attached when configured.
          </p>
        </div>
        <button
          type="button"
          className="neon-btn shrink-0 px-5 py-2.5 text-xs font-semibold"
          disabled={disabled}
          onClick={() => void onCheckIn()}
        >
          {!addr
            ? "Set contract in env"
            : !isConnected
              ? "Connect to check in"
              : isPending || isSwitching
                ? "Working…"
                : "Check in"}
        </button>
      </div>
    </div>
  );
}
