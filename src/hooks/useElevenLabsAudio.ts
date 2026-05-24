import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlayOptions {
  text: string;
  voiceId: string;
}

export function useElevenLabsAudio() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async ({ text, voiceId }: PlayOptions) => {
    setError(null);
    setIsLoading(true);
    try {
      stop();

      const { data, error: invokeError } = await supabase.functions.invoke(
        "elevenlabs-tts",
        { body: { text, voiceId } },
      );

      if (invokeError) throw invokeError;

      const blob =
        data instanceof Blob
          ? data
          : new Blob([data as BlobPart], { type: "audio/mpeg" });

      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
          urlRef.current = null;
        }
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Audio playback failed");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to play audio";
      setError(message);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  return { play, stop, isLoading, isPlaying, error };
}
