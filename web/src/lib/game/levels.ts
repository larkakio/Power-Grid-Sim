import type { Cell } from "./engine";

export interface LevelDef {
  id: string;
  title: string;
  hint: string;
  grid: Cell[][];
}

const b = (): Cell => ({ kind: "blocked" });
const s = (): Cell => ({ kind: "source" });
const k = (): Cell => ({ kind: "sink" });
const w = (
  shape: "straight" | "corner" | "tee" | "cross",
  rotation: number,
): Cell => ({ kind: "wire", shape, rotation });

export const LEVELS: LevelDef[] = [
  {
    id: "neon-boot",
    title: "First Arc",
    hint: "Swipe a wire tile: horizontal motion rotates clockwise, vertical counter-clockwise. Tap rotates once. Route plasma to every substation.",
    grid: [
      [s(), w("straight", 0), w("straight", 0), k()],
    ],
  },
  {
    id: "long-haul",
    title: "Long Haul",
    hint: "Align every segment east–west so the chain conducts across the row.",
    grid: [
      [s(), w("straight", 0), w("straight", 0), w("straight", 0), k()],
    ],
  },
  {
    id: "double-bend",
    title: "Double Bend",
    hint: "A tee junction splits flow. Aim corners so the last turn feeds the city stack.",
    grid: [
      [s(), w("straight", 0), w("corner", 0), b()],
      [b(), b(), w("tee", 0), w("corner", 0)],
      [b(), b(), b(), k()],
    ],
  },
];
