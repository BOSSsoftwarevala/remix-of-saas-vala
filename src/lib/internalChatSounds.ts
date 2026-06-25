// Lightweight Web Audio synth so the enterprise sound packs work
// with zero external files. Each sound is a short, designed tone.
import type { SoundAsset } from "@/data/internal-chat/assets";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function playSound(s: Pick<SoundAsset, "freq" | "type" | "dur" | "sweep">) {
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = s.type;
  osc.frequency.setValueAtTime(s.freq, now);
  if (s.sweep) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, s.sweep), now + s.dur);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + s.dur);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + s.dur + 0.02);
}
