"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cellPorts,
  cloneGrid,
  getPoweredKeys,
  isLevelComplete,
  rotateWire,
  type Cell,
} from "@/lib/game/engine";
import { LEVELS } from "@/lib/game/levels";
import { loadProgress, onLevelComplete, saveProgress } from "@/lib/game/progress";

const SWIPE_MIN = 28;
const TAP_MAX = 14;

function useTilePointer(
  onRotate: (direction: "cw" | "ccw") => void,
  onTap: () => void,
) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const dist = Math.hypot(dx, dy);
    start.current = null;
    if (dist < TAP_MAX) {
      onTap();
      return;
    }
    if (dist < SWIPE_MIN) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      onRotate(dx > 0 ? "cw" : "ccw");
    } else {
      onRotate(dy > 0 ? "ccw" : "cw");
    }
  };

  return { onPointerDown, onPointerUp };
}

function strokeForMask(mask: number, powered: boolean): string {
  const c = 50;
  const edge = 8;
  const pts: [number, number][] = [];
  if (mask & 1) pts.push([c, edge]);
  if (mask & 2) pts.push([100 - edge, c]);
  if (mask & 4) pts.push([c, 100 - edge]);
  if (mask & 8) pts.push([edge, c]);
  const stroke = powered ? "#22d3ee" : "#86198f";
  const glow = powered ? "0 0 14px #00f5ff, 0 0 4px #a5f3fc" : "none";
  return pts
    .map(
      ([x, y]) =>
        `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="${stroke}" stroke-width="5" stroke-linecap="round" style="filter: drop-shadow(${glow})" />`,
    )
    .join("");
}

function WireTile({
  cell,
  powered,
  onRotate,
  onTap,
}: {
  cell: Cell & { kind: "wire" };
  powered: boolean;
  onRotate: (direction: "cw" | "ccw") => void;
  onTap: () => void;
}) {
  const mask = cellPorts(cell);
  const handlers = useTilePointer(onRotate, onTap);
  return (
    <div
      className="relative aspect-square min-h-[52px] cursor-pointer touch-manipulation rounded-lg border border-cyan-500/20 bg-[#070a12]/95 p-1 transition-transform active:scale-[0.98]"
      {...handlers}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        dangerouslySetInnerHTML={{ __html: strokeForMask(mask, powered) }}
      />
    </div>
  );
}

type NonWireCell = Exclude<Cell, { kind: "wire" }>;

function StaticCell({ cell, powered }: { cell: NonWireCell; powered: boolean }) {
  if (cell.kind === "blocked") {
    return (
      <div className="relative aspect-square min-h-[52px] rounded-lg border border-white/5 bg-[#0b0f18]/95" />
    );
  }
  if (cell.kind === "source") {
    return (
      <div className="relative flex aspect-square min-h-[52px] items-center justify-center rounded-lg border border-cyan-500/20 bg-[#070a12]/95">
        <div
          className={`h-10 w-10 rounded-full border-2 border-cyan-300 ${
            powered ? "bg-cyan-400/40 shadow-[0_0_24px_#00f5ff]" : "bg-cyan-900/30"
          }`}
        />
        <span className="sr-only">Reactor</span>
      </div>
    );
  }
  return (
    <div className="relative flex aspect-square min-h-[52px] items-center justify-center rounded-lg border border-fuchsia-500/20 bg-[#070a12]/95">
      <div
        className={`h-8 w-8 rounded-md border-2 ${
          powered
            ? "border-emerald-300 shadow-[0_0_20px_#34d399]"
            : "border-fuchsia-900/80"
        }`}
      />
      <span className="sr-only">Substation</span>
    </div>
  );
}

function GridCell({
  cell,
  powered,
  onRotateWire,
  onTapWire,
}: {
  cell: Cell;
  powered: boolean;
  onRotateWire: (direction: "cw" | "ccw") => void;
  onTapWire: () => void;
}) {
  if (cell.kind === "wire") {
    return (
      <WireTile
        cell={cell}
        powered={powered}
        onRotate={onRotateWire}
        onTap={onTapWire}
      />
    );
  }
  return <StaticCell cell={cell} powered={powered} />;
}

export function PowerGridGame() {
  const [ready, setReady] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>(() =>
    cloneGrid(LEVELS[0]!.grid),
  );
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const winTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winLock = useRef(false);

  useEffect(() => {
    const p = loadProgress();
    setLevelIndex(p.currentIndex);
    setGrid(cloneGrid(LEVELS[p.currentIndex]!.grid));
    setMaxUnlocked(p.maxUnlockedIndex);
    setReady(true);
  }, []);

  const powered = getPoweredKeys(grid);

  const rotateAt = useCallback(
    (r: number, c: number, direction: "cw" | "ccw") => {
      setGrid((g) => {
        const next = g.map((row) => row.map((x) => ({ ...x })));
        const cell = next[r]?.[c];
        if (!cell || cell.kind !== "wire") return g;
        next[r]![c] = rotateWire(cell, direction);
        return next;
      });
    },
    [],
  );

  const tapAt = useCallback(
    (r: number, c: number) => {
      rotateAt(r, c, "cw");
    },
    [rotateAt],
  );

  useEffect(() => {
    if (!ready) return;
    if (!isLevelComplete(grid)) {
      winLock.current = false;
      if (winTimer.current) {
        clearTimeout(winTimer.current);
        winTimer.current = null;
      }
      return;
    }
    if (winLock.current) return;
    winLock.current = true;
    winTimer.current = setTimeout(() => {
      const state = onLevelComplete(levelIndex, LEVELS.length);
      setMaxUnlocked(state.maxUnlockedIndex);
      setLevelIndex(state.currentIndex);
      setGrid(cloneGrid(LEVELS[state.currentIndex]!.grid));
      winLock.current = false;
      winTimer.current = null;
    }, 1000);
    return () => {
      if (winTimer.current) clearTimeout(winTimer.current);
    };
  }, [grid, levelIndex, ready]);

  function selectLevel(idx: number) {
    if (idx < 0 || idx > maxUnlocked) return;
    setLevelIndex(idx);
    setGrid(cloneGrid(LEVELS[idx]!.grid));
    saveProgress({ maxUnlockedIndex: maxUnlocked, currentIndex: idx });
  }

  if (!ready) {
    return (
      <div className="flex h-72 w-full max-w-md items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40">
        <p className="font-mono text-xs text-cyan-200/60">Loading grid…</p>
      </div>
    );
  }

  const level = LEVELS[levelIndex]!;
  const complete = isLevelComplete(grid);

  return (
    <div className="flex w-full max-w-md flex-col items-stretch gap-4">
      <div className="text-center">
        <p className="font-[family-name:var(--font-orbitron)] text-lg tracking-[0.35em] text-cyan-200">
          {level.title}
        </p>
        <p className="mt-1 font-mono text-[11px] text-fuchsia-200/70">
          Level {levelIndex + 1} / {LEVELS.length}
        </p>
      </div>

      <p className="text-center font-mono text-[11px] leading-relaxed text-cyan-100/70">
        {level.hint}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {LEVELS.map((L, i) => (
          <button
            key={L.id}
            type="button"
            disabled={i > maxUnlocked}
            onClick={() => selectLevel(i)}
            className={`h-9 min-w-[2.25rem] rounded-md border px-2 font-mono text-xs ${
              i === levelIndex
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                : i <= maxUnlocked
                  ? "border-violet-500/40 text-violet-100 hover:border-cyan-400/50"
                  : "cursor-not-allowed border-white/10 text-white/20"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div
        className="grid gap-2 p-2"
        style={{
          gridTemplateColumns: `repeat(${level.grid[0]?.length ?? 1}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <GridCell
              key={`${r}-${c}`}
              cell={cell}
              powered={powered.has(`${r},${c}`)}
              onRotateWire={(dir) => rotateAt(r, c, dir)}
              onTapWire={() => tapAt(r, c)}
            />
          )),
        )}
      </div>

      <div
        className={`neon-panel text-center font-mono text-xs ${
          complete ? "border-emerald-400/50 text-emerald-200" : "text-cyan-200/80"
        }`}
      >
        {complete
          ? "Grid stable — routing next sector…"
          : "Route power to every substation."}
      </div>
    </div>
  );
}
