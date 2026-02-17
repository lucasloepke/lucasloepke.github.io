declare module "canvas-confetti" {
  function confetti(options?: {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    [key: string]: unknown;
  }): Promise<void> | null;
  export = confetti;
}
