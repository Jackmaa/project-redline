import { NodeType } from '../types/map';
import type { MapNode, MapPath, GameMap } from '../types/map';

/** Layout constants */
const NODE_RADIUS = 14;
const ROW_SPACING = 72;
const PADDING_X = 40;
const PADDING_TOP = 48;
const PADDING_BOTTOM = 40;

/** Color palette matching CSS vars */
const COLORS = {
  bgDark: '#0a0a0f',
  borderDim: '#2a2a3a',
  textDim: '#55556a',
  textSecondary: '#8888a0',
  textPrimary: '#e0e0e8',
  neonRed: '#ff3344',
  neonCyan: '#00d4ff',
  neonGreen: '#00ff9f',
  neonYellow: '#ffee00',
  neonMagenta: '#ff00aa',
  bgPanel: '#12121a',
};

/** Node type colors and labels */
const NODE_STYLES: Record<NodeType, { color: string; label: string }> = {
  [NodeType.Combat]: { color: COLORS.neonRed, label: 'C' },
  [NodeType.Elite]: { color: COLORS.neonYellow, label: 'E' },
  [NodeType.Event]: { color: COLORS.neonCyan, label: '?' },
  [NodeType.Shop]: { color: COLORS.neonGreen, label: '$' },
  [NodeType.RestSite]: { color: COLORS.neonGreen, label: 'R' },
  [NodeType.Boss]: { color: COLORS.neonRed, label: 'B' },
};

export interface MapLayout {
  width: number;
  height: number;
  nodePositions: Map<string, { x: number; y: number }>;
}

export function computeLayout(map: GameMap, canvasWidth: number): MapLayout {
  const positions = new Map<string, { x: number; y: number }>();

  // Find max row
  let maxRow = 0;
  const rowNodes = new Map<number, MapNode[]>();
  for (const node of map.nodes) {
    maxRow = Math.max(maxRow, node.row);
    const row = rowNodes.get(node.row) ?? [];
    row.push(node);
    rowNodes.set(node.row, row);
  }

  const usableWidth = canvasWidth - PADDING_X * 2;

  for (const [row, nodes] of rowNodes) {
    const cols = nodes.length;
    const spacing = cols === 1 ? 0 : usableWidth / (cols - 1);
    const startX = cols === 1 ? canvasWidth / 2 : PADDING_X;

    // Sort by column index for consistent positioning
    nodes.sort((a, b) => a.col - b.col);

    for (let i = 0; i < nodes.length; i++) {
      const x = startX + i * spacing;
      // Row 0 at bottom, higher rows go up — but we render top-to-bottom
      // so invert: boss (maxRow) at top, start (0) at bottom
      const y = PADDING_TOP + (maxRow - row) * ROW_SPACING;
      positions.set(nodes[i].id, { x, y });
    }
  }

  const height = PADDING_TOP + maxRow * ROW_SPACING + PADDING_BOTTOM;
  return { width: canvasWidth, height, nodePositions: positions };
}

export function renderMap(
  ctx: CanvasRenderingContext2D,
  map: GameMap,
  layout: MapLayout,
  currentNodeId: string | null,
  dpr: number,
): void {
  const { width, height, nodePositions } = layout;
  ctx.clearRect(0, 0, width * dpr, height * dpr);
  ctx.save();
  ctx.scale(dpr, dpr);

  // Build quick lookup
  const nodeMap = new Map<string, MapNode>();
  for (const n of map.nodes) nodeMap.set(n.id, n);

  // Draw paths
  for (const path of map.paths) {
    const from = nodePositions.get(path.from);
    const to = nodePositions.get(path.to);
    if (!from || !to) continue;

    const fromNode = nodeMap.get(path.from);
    const toNode = nodeMap.get(path.to);
    const isVisitedPath = fromNode?.visited && (toNode?.visited || toNode?.available);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);

    // Slight curve for visual interest
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offsetX = (to.x - from.x) * 0.1;
    ctx.quadraticCurveTo(midX + offsetX, midY, to.x, to.y);

    ctx.strokeStyle = isVisitedPath ? COLORS.textDim : COLORS.borderDim;
    ctx.lineWidth = isVisitedPath ? 1.5 : 1;
    ctx.stroke();
  }

  // Draw nodes
  for (const node of map.nodes) {
    const pos = nodePositions.get(node.id);
    if (!pos) continue;

    const style = NODE_STYLES[node.type];
    const isCurrent = node.id === currentNodeId;
    const isAvailable = node.available && !node.visited;

    ctx.beginPath();

    if (node.type === NodeType.Boss) {
      // Boss: diamond shape
      ctx.moveTo(pos.x, pos.y - NODE_RADIUS - 4);
      ctx.lineTo(pos.x + NODE_RADIUS + 4, pos.y);
      ctx.lineTo(pos.x, pos.y + NODE_RADIUS + 4);
      ctx.lineTo(pos.x - NODE_RADIUS - 4, pos.y);
      ctx.closePath();
    } else if (node.type === NodeType.Elite) {
      // Elite: hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const r = NODE_RADIUS + 2;
        const px = pos.x + r * Math.cos(angle);
        const py = pos.y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      // Standard: circle
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
    }

    // Fill
    if (node.visited) {
      ctx.fillStyle = COLORS.bgPanel;
    } else if (isCurrent) {
      ctx.fillStyle = style.color + '33';
    } else {
      ctx.fillStyle = COLORS.bgDark;
    }
    ctx.fill();

    // Stroke
    if (isCurrent) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = 2.5;
      // Glow effect
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 12;
    } else if (isAvailable) {
      ctx.strokeStyle = style.color + 'aa';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    } else if (node.visited) {
      ctx.strokeStyle = COLORS.textDim;
      ctx.lineWidth = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = COLORS.borderDim;
      ctx.lineWidth = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = isCurrent
      ? style.color
      : isAvailable
        ? style.color + 'cc'
        : node.visited
          ? COLORS.textDim
          : COLORS.borderDim;
    ctx.font = `600 ${NODE_RADIUS * 0.9}px 'IBM Plex Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(style.label, pos.x, pos.y + 1);
  }

  ctx.restore();
}

export function hitTestNode(
  x: number,
  y: number,
  layout: MapLayout,
  nodes: MapNode[],
): MapNode | null {
  const hitRadius = NODE_RADIUS + 8; // extra tap area for mobile
  for (const node of nodes) {
    const pos = layout.nodePositions.get(node.id);
    if (!pos) continue;
    const dx = x - pos.x;
    const dy = y - pos.y;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      return node;
    }
  }
  return null;
}
