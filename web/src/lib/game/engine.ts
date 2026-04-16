export const PORT_N = 1;
export const PORT_E = 2;
export const PORT_S = 4;
export const PORT_W = 8;

export type WireShape = "straight" | "corner" | "tee" | "cross";

export type Cell =
  | { kind: "blocked" }
  | { kind: "source" }
  | { kind: "sink" }
  | { kind: "wire"; shape: WireShape; rotation: number };

const SHAPE_BASE: Record<WireShape, number> = {
  straight: PORT_N | PORT_S,
  corner: PORT_N | PORT_E,
  tee: PORT_N | PORT_E | PORT_S,
  cross: PORT_N | PORT_E | PORT_S | PORT_W,
};

export function rotatePortsCw(mask: number): number {
  const n = mask & PORT_N;
  const e = mask & PORT_E;
  const s = mask & PORT_S;
  const w = mask & PORT_W;
  let r = 0;
  if (w) r |= PORT_N;
  if (n) r |= PORT_E;
  if (e) r |= PORT_S;
  if (s) r |= PORT_W;
  return r;
}

export function portsForWire(shape: WireShape, rotation: number): number {
  let m = SHAPE_BASE[shape];
  const steps = ((rotation % 4) + 4) % 4;
  for (let i = 0; i < steps; i++) {
    m = rotatePortsCw(m);
  }
  return m;
}

export function cellPorts(cell: Cell): number {
  switch (cell.kind) {
    case "blocked":
      return 0;
    case "source":
    case "sink":
      return PORT_N | PORT_E | PORT_S | PORT_W;
    case "wire":
      return portsForWire(cell.shape, cell.rotation);
    default:
      return 0;
  }
}

const DR = [-1, 0, 1, 0] as const;
const DC = [0, 1, 0, -1] as const;
const OPP: readonly number[] = [PORT_S, PORT_W, PORT_N, PORT_E];

export function isLevelComplete(grid: readonly (readonly Cell[])[]): boolean {
  const rows = grid.length;
  if (rows === 0) return true;
  const cols = grid[0]?.length ?? 0;

  const sources: { r: number; c: number }[] = [];
  const sinks: { r: number; c: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]?.[c];
      if (!cell) continue;
      if (cell.kind === "source") sources.push({ r, c });
      if (cell.kind === "sink") sinks.push({ r, c });
    }
  }

  if (sinks.length === 0) return true;
  if (sources.length === 0) return false;

  const visited = new Set<string>();
  const q: { r: number; c: number }[] = [...sources];

  for (const s of sources) {
    visited.add(`${s.r},${s.c}`);
  }

  while (q.length) {
    const cur = q.pop()!;
    const ports = cellPorts(grid[cur.r]![cur.c]!);

    for (let d = 0; d < 4; d++) {
      const bit = [PORT_N, PORT_E, PORT_S, PORT_W][d]!;
      if ((ports & bit) === 0) continue;

      const nr = cur.r + DR[d]!;
      const nc = cur.c + DC[d]!;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;

      const neighbor = grid[nr]![nc]!;
      const np = cellPorts(neighbor);
      if ((np & OPP[d]!) === 0) continue;

      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      q.push({ r: nr, c: nc });
    }
  }

  for (const s of sinks) {
    if (!visited.has(`${s.r},${s.c}`)) return false;
  }
  return true;
}

export function rotateWire(cell: Cell, direction: "cw" | "ccw"): Cell {
  if (cell.kind !== "wire") return cell;
  const delta = direction === "cw" ? 1 : 3;
  return {
    ...cell,
    rotation: (cell.rotation + delta + 400) % 4,
  };
}

export function cloneGrid(grid: readonly (readonly Cell[])[]): Cell[][] {
  return grid.map((row) => row.map((c) => ({ ...c })));
}

export function getPoweredKeys(grid: readonly (readonly Cell[])[]): Set<string> {
  const rows = grid.length;
  if (rows === 0) return new Set();
  const cols = grid[0]?.length ?? 0;

  const sources: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]?.[c];
      if (cell?.kind === "source") sources.push({ r, c });
    }
  }

  const visited = new Set<string>();
  const q: { r: number; c: number }[] = [...sources];
  for (const s of sources) {
    visited.add(`${s.r},${s.c}`);
  }

  while (q.length) {
    const cur = q.pop()!;
    const ports = cellPorts(grid[cur.r]![cur.c]!);

    for (let d = 0; d < 4; d++) {
      const bit = [PORT_N, PORT_E, PORT_S, PORT_W][d]!;
      if ((ports & bit) === 0) continue;

      const nr = cur.r + DR[d]!;
      const nc = cur.c + DC[d]!;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;

      const neighbor = grid[nr]![nc]!;
      const np = cellPorts(neighbor);
      if ((np & OPP[d]!) === 0) continue;

      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      q.push({ r: nr, c: nc });
    }
  }

  return visited;
}
