import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

export function getCheckInDataSuffix(): Hex | undefined {
  const raw = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (raw?.startsWith("0x")) {
    return raw as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code?.trim()) {
    return undefined;
  }
  return Attribution.toDataSuffix({ codes: [code.trim()] });
}
