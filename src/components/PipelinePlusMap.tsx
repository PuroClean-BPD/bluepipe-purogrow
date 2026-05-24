import { useEffect, useRef } from "react";

interface MarketDot {
  x: number;
  y: number;
  label: string;
  appearAt: number;
}

const MARKETS: MarketDot[] = [
  { x: -160, y: -80, label: "North Market", appearAt: 1500 },
  { x: 160, y: -80, label: "East Market", appearAt: 1800 },
  { x: -200, y: 40, label: "West Suburbs", appearAt: 2100 },
  { x: 200, y: 60, label: "East Suburbs", appearAt: 2400 },
  { x: -90, y: 150, label: "South Market", appearAt: 2700 },
  { x: 100, y: 140, label: "SE Market", appearAt: 3000 },
  { x: 0, y: -180, label: "NW Market", appearAt: 3300 },
  { x: -250, y: -150, label: "Regional Hub", appearAt: 3600 },
];

const LEAD_LABELS = [
  "New Lead — Water Damage",
  "New Lead — Mold Remediation",
  "Inbound Call — Fire Restoration",
  "New Lead — Emergency Flood",
];

interface Lead {
  x: number;
  y: number;
  label: string;
  startedAt: number;
}

export default function PipelinePlusMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const leads: Lead[] = [];
    let lastLead = 0;

    const drawDot = (x: number, y: number, r: number, color: string) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(26,108,245,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawRing = (
      x: number,
      y: number,
      progress: number,
      maxR: number,
      color: string,
    ) => {
      const r = progress * maxR;
      const alpha = (1 - progress) * 0.6;
      ctx.strokeStyle = color.replace("ALPHA", String(alpha));
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawDashedArc = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      progress: number,
    ) => {
      ctx.save();
      ctx.strokeStyle = "rgba(77, 159, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 - 30;
      ctx.beginPath();
      const steps = 40;
      const endStep = Math.floor(steps * progress);
      for (let i = 0; i <= endStep; i++) {
        const t = i / steps;
        const px =
          (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
        const py =
          (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawLabel = (x: number, y: number, text: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = '500 11px "DM Sans", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(text.toUpperCase(), x, y - 14);
      ctx.restore();
    };

    const drawLeadPill = (lead: Lead, t: number) => {
      const elapsed = t - lead.startedAt;
      const dur = 2500;
      if (elapsed > dur) return false;
      const p = elapsed / dur;
      const alpha = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
      const offsetY = -p * 50;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      const text = "● " + lead.label;
      ctx.font = '500 11px "DM Sans", sans-serif';
      const w = ctx.measureText(text).width + 18;
      const h = 22;
      const px = lead.x - w / 2;
      const py = lead.y + offsetY - h - 8;
      ctx.fillStyle = "rgba(5, 13, 26, 0.92)";
      ctx.strokeStyle = "rgba(77,159,255,0.7)";
      ctx.lineWidth = 1;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(px + r, py);
      ctx.lineTo(px + w - r, py);
      ctx.quadraticCurveTo(px + w, py, px + w, py + r);
      ctx.lineTo(px + w, py + h - r);
      ctx.quadraticCurveTo(px + w, py + h, px + w - r, py + h);
      ctx.lineTo(px + r, py + h);
      ctx.quadraticCurveTo(px, py + h, px, py + h - r);
      ctx.lineTo(px, py + r);
      ctx.quadraticCurveTo(px, py, px + r, py);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#4d9fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, lead.x, py + h / 2);
      ctx.restore();
      return true;
    };

    const loop = (now: number) => {
      const t = now - start;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Primary city ring pulses
      for (let i = 0; i < 2; i++) {
        const phase = ((t / 1000 + i * 0.6) % 2) / 2;
        drawRing(cx, cy, phase, 90, "rgba(255,255,255,ALPHA)");
      }

      // Primary city dot
      drawDot(cx, cy, 10, "rgba(255,255,255,0.95)");
      drawLabel(cx, cy, "Primary Market", 1);

      // Surrounding markets
      MARKETS.forEach((m) => {
        if (t < m.appearAt) return;
        const localT = t - m.appearAt;
        const appear = Math.min(1, localT / 600);
        const x = cx + m.x;
        const y = cy + m.y;

        // arc
        drawDashedArc(cx, cy, x, y, Math.min(1, localT / 800));

        // ring pulses
        const ringPhase = ((localT / 1200) % 1.5) / 1.5;
        drawRing(x, y, ringPhase, 40, "rgba(77,159,255,ALPHA)");

        ctx.save();
        ctx.globalAlpha = appear;
        drawDot(x, y, 6, "#4d9fff");
        ctx.restore();
        drawLabel(x, y, m.label, appear);
      });

      // Spawn leads after 4s
      if (t > 4000 && t - lastLead > 1500) {
        lastLead = t;
        const m = MARKETS[Math.floor(Math.random() * MARKETS.length)];
        const label = LEAD_LABELS[Math.floor(Math.random() * LEAD_LABELS.length)];
        leads.push({
          x: cx + m.x,
          y: cy + m.y,
          label,
          startedAt: t,
        });
      }

      for (let i = leads.length - 1; i >= 0; i--) {
        const alive = drawLeadPill(leads[i], t);
        if (!alive) leads.splice(i, 1);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
