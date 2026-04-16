import { describe, expect, it } from "vitest";
import { cloneGrid, isLevelComplete } from "./engine";
import { LEVELS } from "./levels";

describe("isLevelComplete", () => {
  it("is false on level 1 initial layout", () => {
    expect(isLevelComplete(cloneGrid(LEVELS[0]!.grid))).toBe(false);
  });

  it("is true when row wires are horizontal", () => {
    const g = cloneGrid(LEVELS[0]!.grid);
    g[0]![1] = { kind: "wire", shape: "straight", rotation: 1 };
    g[0]![2] = { kind: "wire", shape: "straight", rotation: 1 };
    expect(isLevelComplete(g)).toBe(true);
  });
});
