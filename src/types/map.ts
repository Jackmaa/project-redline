export const Act = {
  TheStreets: 1,
  TheUndercity: 2,
  CorporateDistrict: 3,
  TheTower: 4,
} as const;
export type Act = (typeof Act)[keyof typeof Act];

export const NodeType = {
  Combat: 'Combat',
  Elite: 'Elite',
  Event: 'Event',
  Shop: 'Shop',
  RestSite: 'RestSite',
  Boss: 'Boss',
} as const;
export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface MapNode {
  id: string;
  type: NodeType;
  act: Act;
  row: number;
  col: number;
  visited: boolean;
  available: boolean;
}

export interface MapPath {
  from: string;
  to: string;
}

export interface GameMap {
  act: Act;
  nodes: MapNode[];
  paths: MapPath[];
}
