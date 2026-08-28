import { useEffect, useRef, useState } from "react";

const CROSSFADE_SECONDS = 2;

/**
 * Reproduce el sonido ambiental de un environment, con crossfade en el
 * punto de loop para disimular cortes audibles (incluso si el archivo
 * no viene con un loop perfecto).
 *
 * Si `soundFile` es null, genera ruido marrón (brown noise) 100% con Web Audio API,
 * sin archivo. Si tiene un archivo asociado, lo descarga una vez,
 * decodifica el buffer completo, y encadena copias superpuestas con
 * fade-out/fade-in cruzado en cada vuelta.
 *
 * Regla de la spec: nunca se reproduce nada sin interacción explícita
 * (play()).
 */
export function useAmbientSound(soundFile: string | null, volume: number) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const stoppedRef = useRef(true);

  useEffect(() => {
    stop();
    bufferRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundFile]);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = volume;
  }, [volume]);

  function clearScheduled() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        // ya pudo haber terminado solo
      }
    });
    activeSourcesRef.current = [];
  }

  function scheduleLoopingPlayback(ctx: AudioContext, buffer: AudioBuffer, masterGain: GainNode) {
    const duration = buffer.duration;
    const crossfade = Math.min(CROSSFADE_SECONDS, duration / 4); // nunca más de 1/4 del clip

    function playCycle(isFirst: boolean) {
      if (stoppedRef.current) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const perSourceGain = ctx.createGain();
      source.connect(perSourceGain).connect(masterGain);

      const now = ctx.currentTime;
      perSourceGain.gain.setValueAtTime(isFirst ? 1 : 0, now);
      if (!isFirst) {
        perSourceGain.gain.linearRampToValueAtTime(1, now + crossfade);
      }
      // fade-out hacia el final de este ciclo, donde entra el siguiente
      perSourceGain.gain.setValueAtTime(1, now + duration - crossfade);
      perSourceGain.gain.linearRampToValueAtTime(0, now + duration);

      source.start(now);
      source.stop(now + duration + 0.1);
      activeSourcesRef.current.push(source);

      const nextCycleDelayMs = (duration - crossfade) * 1000;
      const timeoutId = window.setTimeout(() => playCycle(false), nextCycleDelayMs);
      timeoutsRef.current.push(timeoutId);
    }

    playCycle(true);
  }

  async function playFile(file: string) {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;

      if (!bufferRef.current) {
        const res = await fetch(file);
        if (!res.ok) throw new Error("not-found");
        const arrayBuffer = await res.arrayBuffer();
        bufferRef.current = await ctx.decodeAudioData(arrayBuffer);
      }

      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      stoppedRef.current = false;
      scheduleLoopingPlayback(ctx, bufferRef.current, masterGain);
      setPlaying(true);
      setError(null);
    } catch {
      setError(
        `No se encontró el archivo de sonido (${file}). Agrégalo en public${file.replace(
          import.meta.env.BASE_URL,
          "/",
        )} — ver README.`,
      );
      setPlaying(false);
    }
  }

  function playBrownNoise() {
    const ctx = new AudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Leaky integrator: produces −6 dB/octave (brown/red noise) power spectrum.
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }

    // Normalize to peak = 1.0 to prevent clipping while maximizing headroom.
    const peak = data.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    if (peak > 0) {
      for (let i = 0; i < bufferSize; i++) data[i] /= peak;
    }

    // 10 ms micro-fade at buffer boundaries to eliminate any loop-seam click.
    const fadeSamples = Math.round(0.01 * ctx.sampleRate);
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      data[i] *= t;
      data[bufferSize - 1 - i] *= t;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true; // señal estacionaria: el punto de loop es inaudible

    const gain = ctx.createGain();
    gain.gain.value = volume;
    noise.connect(gain).connect(ctx.destination);
    noise.start();

    audioCtxRef.current = ctx;
    masterGainRef.current = gain;
    activeSourcesRef.current = [noise];
    stoppedRef.current = false;
    setPlaying(true);
    setError(null);
  }

  function play() {
    if (soundFile === null) {
      playBrownNoise();
    } else {
      void playFile(soundFile);
    }
  }

  function stop() {
    stoppedRef.current = true;
    clearScheduled();
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    masterGainRef.current = null;
    setPlaying(false);
  }

  useEffect(() => stop, []); // limpiar al desmontar

  return { playing, error, play, stop };
}
