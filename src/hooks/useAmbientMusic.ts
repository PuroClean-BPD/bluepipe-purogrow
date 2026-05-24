import { useCallback, useEffect, useRef } from "react";

export function useAmbientMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const startedRef = useRef(false);

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    return ctx;
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const ctx = ensure();
    if (ctx.state === "suspended") ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    const mk = (freq: number, gainVal: number) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gainVal;
      o.connect(g);
      g.connect(master);
      o.start();
      return o;
    };

    const o1 = mk(55, 1);
    const o2 = mk(110, 0.5);
    const o3 = mk(220, 0.15);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();

    oscsRef.current = [o1, o2, o3, lfo];
    startedRef.current = true;
  }, [ensure]);

  const fadeIn = useCallback(() => {
    const ctx = ctxRef.current;
    const m = masterRef.current;
    if (!ctx || !m) return;
    m.gain.cancelScheduledValues(ctx.currentTime);
    m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
    m.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 3);
  }, []);

  const fadeOut = useCallback(() => {
    const ctx = ctxRef.current;
    const m = masterRef.current;
    if (!ctx || !m) return;
    m.gain.cancelScheduledValues(ctx.currentTime);
    m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
    m.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
  }, []);

  const unlock = useCallback(async () => {
    const ctx = ensure();
    if (ctx.state === "suspended") await ctx.resume();
  }, [ensure]);

  useEffect(() => {
    return () => {
      try {
        oscsRef.current.forEach((o) => {
          try {
            o.stop();
          } catch {
            // already stopped
          }
        });
        ctxRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  return { start, fadeIn, fadeOut, unlock };
}
