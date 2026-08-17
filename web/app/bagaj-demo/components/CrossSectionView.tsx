"use client";

import { useRef, useEffect } from "react";

interface TrunkData {
  botW: number;
  topW: number;
  botD: number;
  topD: number;
  hL: number;
  hR: number;
  hC: number;
  archW: number;
  archH: number;
  archD: number;
  lipH: number;
}

export function RearCrossSection({
  car,
  color,
  width = 340,
  height = 230,
}: {
  car: TrunkData;
  color: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr;
    c.height = height * dpr;
    c.style.width = width + "px";
    c.style.height = height + "px";
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const baseY = height - 28;
    const sc = (width - 70) / car.botW;
    const bw = (car.botW * sc) / 2;
    const tw = (car.topW * sc) / 2;
    const hl = car.hL * sc;
    const hr = car.hR * sc;
    const hc = car.hC * sc;

    // Gradient fill
    const grad = ctx.createLinearGradient(cx, baseY, cx, baseY - hc);
    grad.addColorStop(0, hexToRgba(color, 0.18));
    grad.addColorStop(1, hexToRgba(color, 0.06));

    // Main shape with slight curves
    ctx.beginPath();
    ctx.moveTo(cx - bw, baseY);
    ctx.lineTo(cx - bw, baseY - 2);
    ctx.bezierCurveTo(
      cx - bw, baseY - hl * 0.3,
      cx - tw - 4, baseY - hl,
      cx - tw, baseY - hl
    );
    ctx.quadraticCurveTo(cx, baseY - hc - 3, cx + tw, baseY - hr);
    ctx.bezierCurveTo(
      cx + tw + 4, baseY - hr,
      cx + bw, baseY - hr * 0.3,
      cx + bw, baseY - 2
    );
    ctx.lineTo(cx + bw, baseY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wheel arches with rounded top
    const aw = car.archW * sc;
    const ah = car.archH * sc;
    const archGrad = ctx.createLinearGradient(0, baseY, 0, baseY - ah);
    archGrad.addColorStop(0, "rgba(224,93,75,0.18)");
    archGrad.addColorStop(1, "rgba(224,93,75,0.06)");

    [cx - bw, cx + bw - aw].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - ah + 4);
      ctx.quadraticCurveTo(x, baseY - ah, x + 4, baseY - ah);
      ctx.lineTo(x + aw - 4, baseY - ah);
      ctx.quadraticCurveTo(x + aw, baseY - ah, x + aw, baseY - ah + 4);
      ctx.lineTo(x + aw, baseY);
      ctx.closePath();
      ctx.fillStyle = archGrad;
      ctx.fill();
      ctx.strokeStyle = "#e05d4b";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Dimension lines
    dimLine(ctx, cx - bw, baseY + 16, cx + bw, baseY + 16, `${car.botW} cm`, "#78716C");
    dimLine(ctx, cx - tw, baseY - Math.max(hl, hr) - 14, cx + tw, baseY - Math.max(hl, hr) - 14, `${car.topW} cm`, "#78716C");
    dimLineV(ctx, cx + bw + 14, baseY, cx + bw + 14, baseY - hr, `${car.hR} cm`, "#78716C");

    // Arch label
    ctx.fillStyle = "#e05d4b";
    ctx.font = "500 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("tekerlek kutusu", cx - bw + aw / 2, baseY - ah - 6);
  }, [car, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block", margin: "0 auto" }}
    />
  );
}

export function SideCrossSection({
  car,
  color,
  width = 340,
  height = 230,
}: {
  car: TrunkData;
  color: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr;
    c.height = height * dpr;
    c.style.width = width + "px";
    c.style.height = height + "px";
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const leftX = 45;
    const baseY = height - 28;
    const sc = (width - 90) / car.botD;
    const bd = car.botD * sc;
    const td = car.topD * sc;
    const h = car.hC * sc;
    const lipH = car.lipH * sc;

    // Gradient fill
    const grad = ctx.createLinearGradient(leftX, baseY, leftX, baseY - h);
    grad.addColorStop(0, hexToRgba(color, 0.15));
    grad.addColorStop(1, hexToRgba(color, 0.05));

    // Side profile with rounded corners
    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(leftX + bd - 3, baseY);
    ctx.quadraticCurveTo(leftX + bd, baseY, leftX + bd, baseY - 3);
    ctx.lineTo(leftX + bd, baseY - lipH);
    // Slope line (rear window)
    ctx.lineTo(leftX + td, baseY - h);
    ctx.lineTo(leftX + 3, baseY - h);
    ctx.quadraticCurveTo(leftX, baseY - h, leftX, baseY - h + 3);
    ctx.lineTo(leftX, baseY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hatch lines for slope area (arka cam eğimi)
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = hexToRgba(color, 0.1);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 30; i++) {
      const x = leftX + td + (bd - td) * (i / 30);
      ctx.beginPath();
      ctx.moveTo(x, baseY - h);
      ctx.lineTo(x + 15, baseY);
      ctx.stroke();
    }
    ctx.restore();

    // Lip indicator
    if (car.lipH > 3) {
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftX + bd, baseY);
      ctx.lineTo(leftX + bd, baseY - lipH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Lip arrow
      ctx.fillStyle = "#EA580C";
      ctx.font = "500 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`eşik: ${car.lipH}cm`, leftX + bd + 8, baseY - lipH / 2 + 3);
    }

    // Slope label
    ctx.fillStyle = hexToRgba(color, 0.5);
    ctx.font = "italic 9px sans-serif";
    ctx.save();
    const mx = leftX + (bd + td) / 2;
    const my = baseY - (h + lipH) / 2;
    const ang = Math.atan2(h - lipH, bd - td);
    ctx.translate(mx, my);
    ctx.rotate(-ang);
    ctx.textAlign = "center";
    ctx.fillText("arka cam eğimi", 0, -6);
    ctx.restore();

    // Dimension lines
    ctx.textAlign = "center";
    dimLine(ctx, leftX, baseY + 16, leftX + bd, baseY + 16, `${car.botD} cm (zemin)`, "#78716C");
    dimLine(ctx, leftX, baseY - h - 14, leftX + td, baseY - h - 14, `${car.topD} cm (üst)`, "#78716C");
    dimLineV(ctx, leftX - 14, baseY, leftX - 14, baseY - h, `${car.hC} cm`, "#78716C");
  }, [car, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block", margin: "0 auto" }}
    />
  );
}

function dimLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  col: string
) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 0.75;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // tick marks
  ctx.beginPath();
  ctx.moveTo(x1, y1 - 3);
  ctx.lineTo(x1, y1 + 3);
  ctx.moveTo(x2, y2 - 3);
  ctx.lineTo(x2, y2 + 3);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // label with background
  ctx.font = "500 10px sans-serif";
  ctx.textAlign = "center";
  const tx = (x1 + x2) / 2;
  const tw = ctx.measureText(label).width + 8;
  ctx.fillStyle = "#FFFBF7";
  ctx.fillRect(tx - tw / 2, y1 - 12, tw, 14);
  ctx.fillStyle = "#44403C";
  ctx.fillText(label, tx, y1 - 2);
}

function dimLineV(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  col: string
) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 0.75;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1 - 3, y1);
  ctx.lineTo(x1 + 3, y1);
  ctx.moveTo(x2 - 3, y2);
  ctx.lineTo(x2 + 3, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#44403C";
  ctx.font = "500 10px sans-serif";
  ctx.save();
  ctx.translate(x1 - 6, (y1 + y2) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
