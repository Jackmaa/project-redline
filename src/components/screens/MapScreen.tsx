import { useEffect, useRef, useCallback, useState } from 'react';
import { useUIStore, Screen } from '../../stores/uiStore';
import { useRunStore } from '../../stores/runStore';
import { generateMap } from '../../game/map/mapGenerator';
import { computeLayout, renderMap, hitTestNode } from '../../canvas/mapRenderer';
import type { MapLayout } from '../../canvas/mapRenderer';
import { Act, NodeType } from '../../types/map';
import type { GameMap, MapNode } from '../../types/map';
import './MapScreen.css';

const ACT_NAMES: Record<Act, string> = {
  [Act.TheStreets]: 'THE STREETS',
  [Act.TheUndercity]: 'THE UNDERCITY',
  [Act.CorporateDistrict]: 'CORPORATE DISTRICT',
  [Act.TheTower]: 'THE TOWER',
};

const NODE_TYPE_LABELS: Record<string, string> = {
  [NodeType.Combat]: 'COMBAT',
  [NodeType.Elite]: 'ELITE',
  [NodeType.Event]: 'EVENT',
  [NodeType.Shop]: 'SHOP',
  [NodeType.RestSite]: 'REST SITE',
  [NodeType.Boss]: 'BOSS',
};

export function MapScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const { map, currentNodeId, moveToNode, setMap, currentAct, cyberdeck } = useRunStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<MapLayout | null>(null);
  const mapRef = useRef<GameMap | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  // Generate map if not already present
  useEffect(() => {
    if (!map) {
      const generated = generateMap(currentAct);
      setMap(generated);
    }
  }, [map, currentAct, setMap]);

  // Render canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const layout = computeLayout(map, width);
    layoutRef.current = layout;
    mapRef.current = map;

    canvas.width = layout.width * dpr;
    canvas.height = layout.height * dpr;
    canvas.style.width = `${layout.width}px`;
    canvas.style.height = `${layout.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderMap(ctx, map, layout, currentNodeId, dpr);
  }, [map, currentNodeId]);

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  // Scroll to current position on map load
  useEffect(() => {
    if (!layoutRef.current || !scrollRef.current) return;
    const nodeId = currentNodeId ?? map?.nodes.find((n) => n.row === 0)?.id;
    if (!nodeId) return;
    const pos = layoutRef.current.nodePositions.get(nodeId);
    if (!pos) return;
    // Scroll so the current node is near the bottom of the viewport
    const scrollTarget = pos.y - scrollRef.current.clientHeight + 100;
    scrollRef.current.scrollTop = Math.max(0, scrollTarget);
  }, [map, currentNodeId]);

  // Handle tap on canvas
  const handleCanvasTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      const layout = layoutRef.current;
      const currentMap = mapRef.current;
      if (!canvas || !layout || !currentMap) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const hit = hitTestNode(x, y, layout, currentMap.nodes);
      if (!hit) {
        setHoveredNode(null);
        return;
      }

      // If node is available and not visited, move there
      if (hit.available && !hit.visited) {
        // Mark current node visited, mark new node's children available
        const updatedNodes = currentMap.nodes.map((n) => {
          if (n.id === hit.id) return { ...n, visited: true, available: false };
          return n;
        });

        // Find children of the hit node and make them available
        const childIds = new Set(
          currentMap.paths.filter((p) => p.from === hit.id).map((p) => p.to),
        );
        const finalNodes = updatedNodes.map((n) => {
          if (childIds.has(n.id) && !n.visited) return { ...n, available: true };
          // If node was available but not the one we clicked, make it unavailable
          // (only nodes reachable from current position should be available)
          if (n.available && !n.visited && n.row === hit.row && n.id !== hit.id) {
            return { ...n, available: false };
          }
          return n;
        });

        const updatedMap = { ...currentMap, nodes: finalNodes };
        setMap(updatedMap);
        moveToNode(hit.id);
        setHoveredNode(hit);

        // Navigate to appropriate screen based on node type
        switch (hit.type) {
          case NodeType.Combat:
          case NodeType.Elite:
          case NodeType.Boss:
            setScreen(Screen.Combat);
            break;
          case NodeType.Event:
            setScreen(Screen.Event);
            break;
          case NodeType.Shop:
            setScreen(Screen.Shop);
            break;
          case NodeType.RestSite:
            setScreen(Screen.RestSite);
            break;
        }
      } else {
        setHoveredNode(hit);
      }
    },
    [moveToNode, setMap, setScreen],
  );

  if (!map) return null;

  return (
    <div className="screen map-screen">
      {/* Header bar */}
      <header className="map-header">
        <div className="map-header-left">
          <span className="map-act-label">ACT {currentAct}</span>
          <span className="map-act-name">{ACT_NAMES[currentAct]}</span>
        </div>
        <div className="map-header-right">
          {cyberdeck && (
            <span className="map-deck-name">{cyberdeck.name}</span>
          )}
        </div>
      </header>

      {/* Scrollable map area */}
      <div className="map-scroll" ref={scrollRef}>
        <canvas
          ref={canvasRef}
          className="map-canvas"
          onClick={handleCanvasTap}
          onTouchStart={handleCanvasTap}
        />
      </div>

      {/* Node info tooltip */}
      {hoveredNode && (
        <div className="map-node-info">
          <span className="map-node-type">{NODE_TYPE_LABELS[hoveredNode.type] ?? hoveredNode.type}</span>
          {hoveredNode.visited && <span className="map-node-visited">CLEARED</span>}
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        <span className="legend-item legend-combat">C <span className="legend-label">Combat</span></span>
        <span className="legend-item legend-elite">E <span className="legend-label">Elite</span></span>
        <span className="legend-item legend-event">? <span className="legend-label">Event</span></span>
        <span className="legend-item legend-shop">$ <span className="legend-label">Shop</span></span>
        <span className="legend-item legend-rest">R <span className="legend-label">Rest</span></span>
      </div>
    </div>
  );
}
