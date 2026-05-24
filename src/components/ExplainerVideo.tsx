import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PipelinePlusMap from "./PipelinePlusMap";
import { useElevenLabsAudio } from "@/hooks/useElevenLabsAudio";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";

const SCENE_DURATIONS = [4000, 9000, 6000, 7000, 12000, 7000, 0];

const VOICEOVERS: Record<number, string> = {
  1: "When disaster strikes, customers move fast. They turn to Google and AI-driven search immediately. And in those critical moments, the companies that get found first often get the call first.",
  2: "BluePipe Digital is the strategic digital marketing partner helping PuroClean franchise owners strengthen online visibility, dominate local markets, and outrank competitors.",
  3: "Our digital marketing strategies are designed to help your franchise get found more often by the customers already searching for your services — through SEO, Google Business optimization, reputation management, and AI-driven search.",
  4: "But what truly makes BluePipe Digital different is Pipeline Plus. Pipeline Plus helps franchise owners extend their digital reach beyond their primary city and into surrounding local markets where customers are already searching. That means expanded reach, broader visibility, and additional lead generation across a larger service area.",
  5: "At BluePipe Digital, we help PuroClean franchise owners get found, get trusted, and grow. Through strategic digital marketing, local search optimization, reputation management, and Pipeline Plus — we help franchisees compete more effectively in the markets that matter most.",
};

// ---------- shared style helpers ----------
const display = { fontFamily: '"Bebas Neue", sans-serif', letterSpacing: "0.02em" };
const body = { fontFamily: '"DM Sans", sans-serif' };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ---------- persistent background ----------
function ParticleNetwork() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number };
    const N = 60;
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    let raf = 0;
    const loop = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      ctx.strokeStyle = "rgba(77,159,255,0.12)";
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            ctx.globalAlpha = 1 - Math.sqrt(d2) / 140;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(77,159,255,0.55)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

function PersistentBackground() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "#050d1a" }} />
      <ParticleNetwork />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(77,159,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(77,159,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(77,159,255,0.5), transparent)",
        }}
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,13,26,0.7) 100%)",
        }}
      />
    </>
  );
}

// ---------- scene components ----------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={0}
      className="text-xs tracking-[0.3em] uppercase"
      style={{ ...body, color: "#4d9fff" }}
    >
      {children}
    </motion.div>
  );
}

function Divider() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ originX: 0, height: 2, width: 80, background: "#1a6cf5" }}
      className="my-6"
    />
  );
}

function Caption({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.55, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="absolute bottom-24 left-0 right-0 text-center text-sm italic px-12 max-w-4xl mx-auto"
      style={{ ...body, color: "rgba(255,255,255,0.55)" }}
    >
      {text}
    </motion.p>
  );
}

function Scene0() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: "rgba(77,159,255,0.3)" }}
          initial={{ width: 200, height: 200, opacity: 0.6 }}
          animate={{ width: 700, height: 700, opacity: 0 }}
          transition={{ duration: 3, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
        style={{ width: "min(60vw, 700px)", aspectRatio: "16/9" }}
      >
        <video
          src="/bluepipe-intro.mp4"
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
      </motion.div>
    </div>
  );
}

function Scene1() {
  const results = [
    { name: "Competitor A Restoration", badge: "Top Ranked", badgeColor: "#f0a830" },
    { name: "Competitor B Services", badge: "Ranked #2", badgeColor: "rgba(255,255,255,0.3)" },
    { name: "Your Franchise", badge: "Not Visible", badgeColor: "#ef4444", danger: true },
  ];
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-12">
      <div className="max-w-5xl w-full">
        <Eyebrow>The Challenge</Eyebrow>
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-6xl md:text-8xl text-white leading-none"
          style={display}
        >
          When Disaster Strikes — Speed Wins
        </motion.h1>
        <Divider />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="rounded-2xl border p-6 mt-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(77,159,255,0.18)",
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)" }}>⌕</span>
            <span style={{ ...body, color: "rgba(255,255,255,0.9)" }}>
              water damage restoration near me
            </span>
          </div>

          <div className="space-y-3">
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.4, duration: 0.5 }}
                className="flex items-center justify-between px-4 py-4 rounded-lg relative"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: r.danger
                    ? "1px solid rgba(239,68,68,0.6)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: r.danger ? "0 0 24px rgba(239,68,68,0.25)" : "none",
                }}
              >
                {r.danger && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ border: "1px solid rgba(239,68,68,0.7)" }}
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
                <span style={{ ...body, color: "#fff", fontSize: 18 }}>
                  #{i + 1} — {r.name}
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    ...body,
                    background: r.badgeColor,
                    color: r.danger || r.badge === "Top Ranked" ? "#fff" : "#050d1a",
                    fontWeight: 500,
                  }}
                >
                  {r.badge}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Caption text={VOICEOVERS[1]} />
    </div>
  );
}

function Scene2() {
  const pillars = [
    { icon: "📍", label: "Local Search" },
    { icon: "📈", label: "Rankings" },
    { icon: "⭐", label: "Reputation" },
    { icon: "🤖", label: "AI Visibility" },
  ];
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-12 text-center">
      <Eyebrow>Your Strategic Partner</Eyebrow>
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={2}
        className="text-7xl md:text-9xl text-white leading-none mt-4"
        style={display}
      >
        BluePipe Digital
      </motion.h1>
      <div className="flex justify-center"><Divider /></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-5xl">
        {pillars.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 + i * 0.15, duration: 0.5 }}
            className="rounded-xl px-6 py-8 text-center"
            style={{
              background: "rgba(26,108,245,0.06)",
              border: "1px solid rgba(77,159,255,0.35)",
            }}
          >
            <div className="text-4xl mb-3">{p.icon}</div>
            <div
              className="text-sm tracking-[0.2em] uppercase"
              style={{ ...body, color: "#fff" }}
            >
              {p.label}
            </div>
          </motion.div>
        ))}
      </div>
      <Caption text={VOICEOVERS[2]} />
    </div>
  );
}

function Scene3() {
  const cards = [
    { n: "01", title: "SEO", desc: "Rank higher for high-intent restoration terms" },
    { n: "02", title: "Google Business", desc: "Maximize local map pack visibility" },
    { n: "03", title: "Reputation", desc: "Build reviews and trust signals that convert" },
    { n: "04", title: "AI Search", desc: "Appear in ChatGPT, Perplexity, and AI results" },
  ];
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-12">
      <div className="max-w-5xl w-full">
        <Eyebrow>Core Digital Strategy</Eyebrow>
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-6xl md:text-8xl text-white leading-none"
          style={display}
        >
          Get Found. Get Trusted.
        </motion.h1>
        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.2, duration: 0.5 }}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(77,159,255,0.2)",
              }}
            >
              <div
                className="absolute -right-2 -top-4 text-9xl leading-none"
                style={{ ...display, color: "rgba(77,159,255,0.06)" }}
              >
                {c.n}
              </div>
              <div className="relative">
                <div
                  className="text-2xl mb-2"
                  style={{ ...display, color: "#4d9fff" }}
                >
                  {c.title}
                </div>
                <div style={{ ...body, color: "rgba(255,255,255,0.6)" }}>
                  {c.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Caption text={VOICEOVERS[3]} />
    </div>
  );
}

function Scene4() {
  const stats = [
    { value: "+3–5x", label: "Market Coverage", className: "left-12 top-1/2 -translate-y-1/2", delay: 2 },
    { value: "+60%", label: "Search Reach", className: "right-12 top-1/2 -translate-y-1/2", delay: 3 },
    { value: "24/7", label: "Lead Generation", className: "left-12 bottom-32", delay: 4 },
  ];
  return (
    <div className="relative w-full h-full">
      <PipelinePlusMap />

      <div className="absolute top-16 left-0 right-0 flex flex-col items-center text-center px-12 pointer-events-none">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="text-7xl md:text-9xl leading-none"
          style={display}
        >
          <span
            style={{
              background:
                "linear-gradient(90deg, #ffffff 0%, #4d9fff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Pipeline{" "}
          </span>
          <span style={{ color: "#f0a830" }}>Plus</span>
        </motion.h1>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-sm tracking-[0.3em] uppercase mt-3"
          style={{ ...body, color: "rgba(255,255,255,0.7)" }}
        >
          Expand Beyond Your Primary Market
        </motion.div>
      </div>

      {stats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: s.delay, type: "spring", stiffness: 200, damping: 18 }}
          className={`absolute ${s.className} px-5 py-4 rounded-xl text-center`}
          style={{
            background: "rgba(5,13,26,0.85)",
            border: "1px solid rgba(77,159,255,0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ ...display, color: "#4d9fff", fontSize: 36, lineHeight: 1 }}>
            {s.value}
          </div>
          <div
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{ ...body, color: "rgba(255,255,255,0.55)" }}
          >
            {s.label}
          </div>
        </motion.div>
      ))}
      <Caption text={VOICEOVERS[4]} />
    </div>
  );
}

function Scene5() {
  const lines = [
    { text: "Found.", color: "#fff" },
    { text: "Trusted.", color: "#fff" },
    { text: "Growing.", color: "#f0a830" },
  ];
  const badges = ["More Visibility", "More Trust", "More Leads"];
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-12 text-center">
      <Eyebrow>The Result</Eyebrow>
      <div className="mt-4">
        {lines.map((l, i) => (
          <motion.div
            key={l.text}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.25, duration: 0.6 }}
            className="text-7xl md:text-9xl leading-[0.95]"
            style={{ ...display, color: l.color }}
          >
            {l.text}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        {badges.map((b, i) => (
          <motion.div
            key={b}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + i * 0.2, type: "spring", stiffness: 200, damping: 18 }}
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{ background: "rgba(26,108,245,0.1)", border: "1px solid rgba(77,159,255,0.3)" }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: "#1a6cf5", color: "#fff" }}
            >
              ✓
            </span>
            <span style={{ ...body, color: "#fff" }}>{b}</span>
          </motion.div>
        ))}
      </div>
      <Caption text={VOICEOVERS[5]} />
    </div>
  );
}

function Scene6({ onReplay }: { onReplay: () => void }) {
  const [showReplay, setShowReplay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowReplay(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-12">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: "rgba(77,159,255,0.2)" }}
          initial={{ width: 200, height: 200, opacity: 0.5 }}
          animate={{ width: 800, height: 800, opacity: 0 }}
          transition={{ duration: 4, delay: i * 1.1, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="text-7xl md:text-9xl leading-none" style={display}>
          <span style={{ color: "#fff" }}>BluePipe</span>{" "}
          <span style={{ color: "#4d9fff" }}>Digital</span>
        </div>
        <div
          className="mt-4 text-sm md:text-base"
          style={{ ...body, color: "rgba(255,255,255,0.55)" }}
        >
          Strategic Digital Marketing Partner for PuroClean Franchise Owners
        </div>
        <div
          className="mt-8 text-xs md:text-sm tracking-wider"
          style={{ ...body, color: "rgba(255,255,255,0.7)" }}
        >
          SEO &nbsp;•&nbsp; Google Business Optimization &nbsp;•&nbsp; Reputation Management
          &nbsp;•&nbsp; <span style={{ color: "#4d9fff" }}>Pipeline Plus Lead Generation</span>
        </div>
        {showReplay && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onReplay}
            className="mt-10 px-6 py-3 rounded-full"
            style={{
              ...body,
              background: "rgba(26,108,245,0.15)",
              border: "1px solid rgba(77,159,255,0.5)",
              color: "#fff",
            }}
          >
            ↺ Replay
          </motion.button>
        )}
      </motion.div>
      <div
        className="absolute bottom-8 left-0 right-0 text-center text-xs"
        style={{ ...body, color: "rgba(255,255,255,0.3)" }}
      >
        bluepipedigital.com
      </div>
    </div>
  );
}

// ---------- main ----------

export default function ExplainerVideo() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefetching, setPrefetching] = useState(false);

  const texts = useMemo(() => VOICEOVERS, []);
  const { prefetchAll, playScene, stop, state } = useElevenLabsAudio({ texts });
  const music = useAmbientMusic();

  const advanceTimer = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const sceneStartRef = useRef<number>(0);
  const elapsedAtPauseRef = useRef<number>(0);

  // play scene VO + handle music fades
  useEffect(() => {
    if (!started) return;
    stop();
    elapsedAtPauseRef.current = 0;
    sceneStartRef.current = performance.now();
    setProgress(0);

    if (sceneIdx === 1) music.fadeIn();
    if (sceneIdx === 6) music.fadeOut();

    const t = setTimeout(() => {
      if (VOICEOVERS[sceneIdx]) playScene(sceneIdx);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx, started]);

  // auto-advance + progress
  useEffect(() => {
    if (!started || paused) return;
    const duration = SCENE_DURATIONS[sceneIdx];
    if (!duration) return;

    sceneStartRef.current = performance.now() - elapsedAtPauseRef.current;

    const tick = () => {
      const elapsed = performance.now() - sceneStartRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        setSceneIdx((i) => Math.min(i + 1, SCENE_DURATIONS.length - 1));
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      elapsedAtPauseRef.current = performance.now() - sceneStartRef.current;
    };
  }, [sceneIdx, paused, started]);

  const goto = useCallback(
    (i: number) => {
      if (i < 0 || i >= SCENE_DURATIONS.length) return;
      setSceneIdx(i);
    },
    [],
  );

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return;
      if (e.key === "ArrowRight" || e.code === "Space") {
        e.preventDefault();
        goto(Math.min(sceneIdx + 1, SCENE_DURATIONS.length - 1));
      } else if (e.key === "ArrowLeft") {
        goto(Math.max(sceneIdx - 1, 0));
      } else if (e.key.toLowerCase() === "p") {
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goto, sceneIdx, started]);

  const handleBegin = useCallback(async () => {
    setPrefetching(true);
    await music.unlock();
    music.start();
    await prefetchAll();
    setPrefetching(false);
    setStarted(true);
    setSceneIdx(0);
  }, [music, prefetchAll]);

  const handleReplay = useCallback(() => {
    setSceneIdx(0);
    setPaused(false);
    music.fadeIn();
  }, [music]);

  const totalScenes = SCENE_DURATIONS.length;
  const renderScene = () => {
    switch (sceneIdx) {
      case 0:
        return <Scene0 />;
      case 1:
        return <Scene1 />;
      case 2:
        return <Scene2 />;
      case 3:
        return <Scene3 />;
      case 4:
        return <Scene4 />;
      case 5:
        return <Scene5 />;
      case 6:
        return <Scene6 onReplay={handleReplay} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#050d1a", color: "#fff" }}
    >
      <PersistentBackground />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/5">
        <motion.div
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #1a6cf5, #4d9fff)",
            width: `${progress * 100}%`,
          }}
        />
      </div>

      {/* Top chrome */}
      <div
        className="absolute top-5 left-6 z-20 text-xl"
        style={{ ...display, color: "#fff", letterSpacing: "0.1em" }}
      >
        BLUEPIPE <span style={{ color: "#4d9fff" }}>DIGITAL</span>
      </div>
      <div
        className="absolute top-6 right-6 z-20 text-xs tracking-[0.25em]"
        style={{ ...body, color: "rgba(255,255,255,0.5)" }}
      >
        {String(sceneIdx + 1).padStart(2, "0")} / {String(totalScenes).padStart(2, "0")}
      </div>

      {/* Scenes */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full"
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot nav */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i)}
            className="transition-all"
            style={{
              height: 6,
              width: i === sceneIdx ? 28 : 6,
              borderRadius: 999,
              background: i === sceneIdx ? "#4d9fff" : "rgba(255,255,255,0.25)",
            }}
            aria-label={`Go to scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Controls bottom right */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={() => goto(Math.max(0, sceneIdx - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={() => setPaused((p) => !p)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          aria-label={paused ? "Play" : "Pause"}
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <button
          onClick={() => goto(Math.min(totalScenes - 1, sceneIdx + 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* Begin overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            key="overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-8"
            style={{ background: "rgba(5,13,26,0.92)", backdropFilter: "blur(6px)" }}
          >
            <div className="text-6xl md:text-8xl" style={display}>
              BLUEPIPE <span style={{ color: "#4d9fff" }}>DIGITAL</span>
            </div>
            <div
              className="mt-3 text-sm tracking-[0.3em] uppercase"
              style={{ ...body, color: "rgba(255,255,255,0.6)" }}
            >
              PuroClean National Convention
            </div>

            {!prefetching ? (
              <button
                onClick={handleBegin}
                className="mt-10 px-8 py-4 rounded-full text-base"
                style={{
                  ...body,
                  background: "linear-gradient(90deg, #1a6cf5, #4d9fff)",
                  color: "#fff",
                  letterSpacing: "0.05em",
                }}
              >
                ▶  Begin Presentation
              </button>
            ) : (
              <div className="mt-10 flex flex-col items-center gap-4">
                <div style={{ ...body, color: "rgba(255,255,255,0.75)" }}>
                  Preparing your presentation
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </div>
                <div
                  style={{ width: 220, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 999 }}
                >
                  <div
                    style={{
                      width: `${state.total ? (state.loaded / state.total) * 100 : 0}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #1a6cf5, #4d9fff)",
                      borderRadius: 999,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
