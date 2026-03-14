export interface Cyberdeck {
  id: string;
  name: string;
  baseRam: number;
  memorySlots: number;
  uploadSlots: number;
  gearSlots: number;
  drawCount: number;
  heatSink: number;
  trait: string | null;
  playstyle: string;
  flavorText: string;
}
