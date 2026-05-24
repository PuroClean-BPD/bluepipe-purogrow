import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_ID = "pNInz6obpgDQGcFmaJgB";
const MODEL_ID = "eleven_turbo_v2_5";

type SceneTexts = Record<number, string>;

interface UseElevenLabsAudioOptions {
  texts: SceneTexts;
}

interface PrefetchState {
  ready: boolean;
  loaded: number;
  total: number;
}

export function useElevenLabsAudio({ texts }: UseElevenLabsAudioOptions) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlMapRef = useRef<Record<number, string>>({});
  const [state, setState] = useState<PrefetchState>({
    ready: false,
    loaded: 0,
    total: Object.keys(texts).length,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      Object.values(urlMapRef.current).forEach((u) => URL.revokeObjectURL(u));
      urlMapRef.current = {};
    };
  }, []);

  const fetchScene = useCallback(
    async (idx: number, text: string) => {
      if (!apiKey) throw new Error("No API key");
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: MODEL_ID,
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true,
            },
          }),
        },
      );
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
      const buf = await res.arrayBuffer();
      const url = URL.createObjectURL(
        new Blob([buf], { type: "audio/mpeg" }),
      );
      urlMapRef.current[idx] = url;
    },
    [apiKey],
  );

  const prefetchAll = useCallback(async () => {
    const entries = Object.entries(texts).map(
      ([k, v]) => [Number(k), v] as const,
    );
    setState({ ready: false, loaded: 0, total: entries.length });

    if (!apiKey) {
      setState({ ready: true, loaded: entries.length, total: entries.length });
      return;
    }

    let loaded = 0;
    await Promise.all(
      entries.map(async ([idx, text]) => {
        try {
          await fetchScene(idx, text);
        } catch (e) {
          console.warn("ElevenLabs fetch failed for scene", idx, e);
        } finally {
          loaded += 1;
          setState((s) => ({ ...s, loaded }));
        }
      }),
    );
    setState({ ready: true, loaded: entries.length, total: entries.length });
  }, [apiKey, fetchScene, texts]);

  const speakFallback = useCallback((text: string) => {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 0.9;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }, []);

  const playScene = useCallback(
    (idx: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      const url = urlMapRef.current[idx];
      const text = texts[idx];
      if (url) {
        audio.src = url;
        audio.play().catch(() => {
          if (text) speakFallback(text);
        });
      } else if (text) {
        speakFallback(text);
      }
    },
    [speakFallback, texts],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ignore
    }
  }, []);

  return { prefetchAll, playScene, stop, state, hasKey: !!apiKey };
}
