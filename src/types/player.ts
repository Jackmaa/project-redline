export const HeatZone = {
  Safe: 'Safe',
  Overclocked: 'Overclocked',
  Redline: 'Redline',
  Crash: 'Crash',
} as const;
export type HeatZone = (typeof HeatZone)[keyof typeof HeatZone];

export interface PlayerResources {
  integrity: number;
  maxIntegrity: number;
  ram: number;
  maxRam: number;
  heat: number;
  firewall: number;
}

export function getHeatZone(heat: number): HeatZone {
  if (heat >= 90) return HeatZone.Crash;
  if (heat >= 70) return HeatZone.Redline;
  if (heat >= 40) return HeatZone.Overclocked;
  return HeatZone.Safe;
}
