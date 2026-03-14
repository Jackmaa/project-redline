import { Act, NodeType } from '../../types/map';
import type { MapNode, MapPath, GameMap } from '../../types/map';

/**
 * Generates a StS-style branching map for a given act.
 *
 * Structure:
 * - Row 0: 2-3 starting combat nodes
 * - Rows 1-13: mixed node types (14 rows of content)
 * - Row 14: Boss node
 *
 * Rules from design:
 * - 12-16 nodes per act
 * - Combat ~50%, Events ~20%, Shops ~10%, Elite ~10%, Rest ~10%
 * - Multiple paths, at least 1 elite path
 * - Shops spaced evenly
 * - No more than 3 combats in a row on any path
 */

const TOTAL_ROWS = 15; // 0 = start, 14 = boss
const COLS_MIN = 2;
const COLS_MAX = 4;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function getColumnsForRow(row: number, rng: () => number): number {
  if (row === 0) return 3; // starting row always 3 options
  if (row === TOTAL_ROWS - 1) return 1; // boss row always 1
  // Vary width: narrow in middle rows for tension, wider at decision points
  if (row === 4 || row === 9) return 2; // chokepoints
  const base = COLS_MIN + Math.floor(rng() * (COLS_MAX - COLS_MIN + 1));
  return Math.min(base, COLS_MAX);
}

function assignNodeType(
  row: number,
  _col: number,
  totalRows: number,
  rng: () => number,
  isElitePath: boolean,
): NodeType {
  if (row === 0) return NodeType.Combat;
  if (row === totalRows - 1) return NodeType.Boss;

  // Fixed placements for pacing
  if (row === 7) return NodeType.Shop; // mid-act shop
  if (row === 12) return NodeType.RestSite; // pre-boss rest

  // Elite on designated path
  if (isElitePath && (row === 5 || row === 10)) return NodeType.Elite;

  // Weighted random for remaining
  const roll = rng();
  if (roll < 0.45) return NodeType.Combat;
  if (roll < 0.65) return NodeType.Event;
  if (roll < 0.78) return NodeType.Combat; // extra combat weight
  if (roll < 0.88) return NodeType.RestSite;
  if (roll < 0.95) return NodeType.Elite;
  return NodeType.Shop;
}

function enforceNoCombatStreak(nodes: MapNode[], paths: MapPath[]): void {
  // Build adjacency: for each node, find what leads into it
  const parentMap = new Map<string, string[]>();
  for (const p of paths) {
    const existing = parentMap.get(p.to) ?? [];
    existing.push(p.from);
    parentMap.set(p.to, existing);
  }

  const nodeMap = new Map<string, MapNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  // Check each node: if it and all its parents for 2 levels are Combat, switch it
  for (const node of nodes) {
    if (node.type !== NodeType.Combat) continue;
    if (node.row <= 1) continue;

    const parents = parentMap.get(node.id) ?? [];
    const allParentsCombat = parents.length > 0 && parents.every((pid) => {
      const p = nodeMap.get(pid);
      if (!p || p.type !== NodeType.Combat) return false;
      // Check grandparents too
      const grandparents = parentMap.get(pid) ?? [];
      return grandparents.some((gid) => nodeMap.get(gid)?.type === NodeType.Combat);
    });

    if (allParentsCombat) {
      node.type = NodeType.Event;
    }
  }
}

export function generateMap(act: Act, seed?: number): GameMap {
  const rng = seededRandom(seed ?? Date.now());

  const nodes: MapNode[] = [];
  const paths: MapPath[] = [];
  const rowColumns: number[] = [];

  // Decide which column index will be the "elite path"
  const eliteCol = Math.floor(rng() * COLS_MAX);

  // Generate nodes row by row
  for (let row = 0; row < TOTAL_ROWS; row++) {
    const cols = getColumnsForRow(row, rng);
    rowColumns.push(cols);

    for (let col = 0; col < cols; col++) {
      const isElitePath = col === eliteCol % cols;
      const type = assignNodeType(row, col, TOTAL_ROWS, rng, isElitePath);

      nodes.push({
        id: `${row}-${col}`,
        type,
        act,
        row,
        col,
        visited: false,
        available: row === 0, // only first row available at start
      });
    }
  }

  // Generate paths connecting adjacent rows
  for (let row = 0; row < TOTAL_ROWS - 1; row++) {
    const currentCols = rowColumns[row];
    const nextCols = rowColumns[row + 1];

    for (let col = 0; col < currentCols; col++) {
      const fromId = `${row}-${col}`;

      // Map current column position to next row's columns
      const ratio = nextCols / currentCols;
      const primaryTarget = Math.min(Math.floor(col * ratio), nextCols - 1);

      // Always connect to the aligned target
      paths.push({ from: fromId, to: `${row + 1}-${primaryTarget}` });

      // Sometimes add a branching path to an adjacent column
      if (rng() < 0.4 && primaryTarget + 1 < nextCols) {
        paths.push({ from: fromId, to: `${row + 1}-${primaryTarget + 1}` });
      }
      if (rng() < 0.3 && primaryTarget - 1 >= 0) {
        paths.push({ from: fromId, to: `${row + 1}-${primaryTarget - 1}` });
      }
    }

    // Ensure every next-row node has at least one incoming path
    for (let nextCol = 0; nextCol < nextCols; nextCol++) {
      const toId = `${row + 1}-${nextCol}`;
      const hasIncoming = paths.some((p) => p.to === toId);
      if (!hasIncoming) {
        // Connect from nearest current-row node
        const nearestCol = Math.min(
          Math.round(nextCol * (currentCols / nextCols)),
          currentCols - 1,
        );
        paths.push({ from: `${row}-${nearestCol}`, to: toId });
      }
    }
  }

  // Deduplicate paths
  const pathSet = new Set(paths.map((p) => `${p.from}|${p.to}`));
  const dedupedPaths = [...pathSet].map((key) => {
    const [from, to] = key.split('|');
    return { from, to };
  });

  enforceNoCombatStreak(nodes, dedupedPaths);

  return { act, nodes, paths: dedupedPaths };
}
