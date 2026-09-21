/**
 * Draws the FastTypingLab certificate (A4 landscape) on a canvas. One renderer
 * feeds the on-page preview, the PNG download and the PDF download so they can
 * never disagree.
 */
import { CERT_RULES } from './certificateRules';

export interface CertificateData {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  errors?: number;
  duration_seconds?: number;
  test_title: string;
  issued_at: string;
  is_valid?: boolean;
}

export const CERT_W = 2000;
export const CERT_H = 1414; // A4 landscape ratio (297 x 210)

const NAVY = '#12303A';
const TEAL = '#2A9DAE';
const GOLD = '#B8893B';
const GOLD_LIGHT = '#E4C57C';
const INK = '#1A2C31';
const MUTED = '#5F7A82';
const PAPER = '#FFFDF8';

const SERIF = 'Georgia, "Times New Roman", "Noto Serif Devanagari", "Mangal", serif';
const SANS = '"Segoe UI", Arial, "Noto Sans Devanagari", "Mangal", sans-serif';

/** Proficiency wording shown under the name. */
export function certificateLevel(wpm: number): string {
  if (wpm >= 60) return 'Expert';
  if (wpm >= 45) return 'Advanced';
  return 'Proficient';
}

export function certificateNumber(id: string): string {
  return `FTL-${id.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(text, x, y);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
}

/** Shrinks the font until `text` fits `maxWidth`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, start: number, min: number, maxWidth: number) {
  let size = start;
  while (size > min) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  ctx.font = `${weight} ${size}px ${family}`;
}

function corner(ctx: CanvasRenderingContext2D, x: number, y: number, sx: number, sy: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(0, 0);
  ctx.lineTo(90, 0);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 66);
  ctx.lineTo(16, 16);
  ctx.lineTo(66, 16);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function seal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Scalloped rosette
  const points = 28;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points;
    const rad = i % 2 === 0 ? r : r * 0.9;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, GOLD_LIGHT);
  g.addColorStop(0.5, GOLD);
  g.addColorStop(1, '#8C6524');
  ctx.fillStyle = g;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.64, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.round(r * 0.5)}px ${SERIF}`;
  ctx.fillText('FTL', cx, cy + r * 0.08);
  ctx.font = `600 ${Math.round(r * 0.15)}px ${SANS}`;
  spaced(ctx, 'VERIFIED', cx + 2, cy + r * 0.34, 3);
}

export function drawCertificate(canvas: HTMLCanvasElement, data: CertificateData, qr?: CanvasImageSource | null) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = CERT_W;
  canvas.height = CERT_H;
  const W = CERT_W;
  const H = CERT_H;
  const cx = W / 2;

  // Paper
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Faint watermark ring behind the text
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.arc(cx, H / 2 + 20, 250 + i * 34, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Frames: navy outer, gold inner
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 16;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(68, 68, W - 136, H - 136);
  corner(ctx, 68, 68, 1, 1);
  corner(ctx, W - 68, 68, -1, 1);
  corner(ctx, 68, H - 68, 1, -1);
  corner(ctx, W - 68, H - 68, -1, -1);

  // Brand
  const bg = ctx.createLinearGradient(cx - 40, 130, cx + 40, 210);
  bg.addColorStop(0, NAVY);
  bg.addColorStop(1, TEAL);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(cx - 40, 128, 80, 80, 20);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = `bold 46px ${SERIF}`;
  ctx.fillText('F', cx, 187);
  ctx.fillStyle = NAVY;
  ctx.font = `bold 40px ${SERIF}`;
  ctx.fillText('FastTypingLab', cx, 260);

  // Title
  ctx.fillStyle = GOLD;
  ctx.font = `600 26px ${SANS}`;
  spaced(ctx, 'CERTIFICATE OF', cx + 4, 330, 10);
  ctx.fillStyle = NAVY;
  ctx.font = `bold 84px ${SERIF}`;
  ctx.fillText('Typing Proficiency', cx, 414);

  // Rule with diamond
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 260, 450); ctx.lineTo(cx - 24, 450);
  ctx.moveTo(cx + 24, 450); ctx.lineTo(cx + 260, 450);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, 438); ctx.lineTo(cx + 12, 450); ctx.lineTo(cx, 462); ctx.lineTo(cx - 12, 450);
  ctx.closePath();
  ctx.fill();

  // Recipient
  ctx.fillStyle = MUTED;
  ctx.font = `italic 30px ${SERIF}`;
  ctx.fillText('This certificate is proudly presented to', cx, 522);

  ctx.fillStyle = INK;
  fitFont(ctx, data.username, 'italic bold', SERIF, 104, 48, W - 520);
  ctx.fillText(data.username, cx, 640);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  const nameW = Math.min(ctx.measureText(data.username).width + 80, W - 400);
  ctx.beginPath();
  ctx.moveTo(cx - nameW / 2, 668);
  ctx.lineTo(cx + nameW / 2, 668);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = `28px ${SERIF}`;
  const dur = formatDuration(data.duration_seconds);
  ctx.fillText(
    `for achieving ${certificateLevel(data.wpm)} typing speed and accuracy in a${dur ? ` ${dur}` : ''} timed test`,
    cx, 724,
  );

  // Requirements table: what the certificate demands vs what was achieved.
  const rows: Array<[string, string, string]> = [
    ['Typing speed (net words per minute)', `${CERT_RULES.minWpm} WPM`, `${data.wpm} WPM`],
    ['Typing accuracy', `${CERT_RULES.minAccuracy}%`, `${Math.round(data.accuracy * 10) / 10}%`],
    ['Test duration', `${CERT_RULES.minSeconds / 60} min`, dur || '-'],
  ];
  const cols = [520, 230, 230, 200];
  const tableW = cols.reduce((x, y) => x + y, 0);
  const tx = cx - tableW / 2;
  const ty = 758;
  const headH = 48;
  const rowH = 54;
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.roundRect(tx, ty, tableW, headH, [14, 14, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 20px ${SANS}`;
  ctx.textAlign = 'left';
  const heads = ['REQUIREMENT', 'MINIMUM', 'ACHIEVED', 'RESULT'];
  let hx = tx;
  heads.forEach((h, i) => {
    if (i === 0) { ctx.textAlign = 'left'; spaced(ctx, h, hx + 28, ty + 31, 3); }
    else { ctx.textAlign = 'center'; spaced(ctx, h, hx + cols[i] / 2 + 2, ty + 31, 3); }
    hx += cols[i];
  });
  rows.forEach((r, ri) => {
    const y = ty + headH + ri * rowH;
    ctx.fillStyle = ri % 2 === 0 ? 'rgba(18,48,58,0.05)' : 'rgba(18,48,58,0.09)';
    ctx.fillRect(tx, y, tableW, rowH);
    let x = tx;
    ctx.fillStyle = INK;
    ctx.font = `26px ${SERIF}`;
    ctx.textAlign = 'left';
    ctx.fillText(r[0], x + 28, y + 36);
    x += cols[0];
    ctx.textAlign = 'center';
    ctx.fillStyle = MUTED;
    ctx.font = `26px ${SANS}`;
    ctx.fillText(r[1], x + cols[1] / 2, y + 36);
    x += cols[1];
    ctx.fillStyle = NAVY;
    ctx.font = `bold 30px ${SANS}`;
    ctx.fillText(r[2], x + cols[2] / 2, y + 37);
    x += cols[2];
    ctx.fillStyle = '#1E8A4C';
    ctx.font = `bold 24px ${SANS}`;
    ctx.fillText('✓ MET', x + cols[3] / 2, y + 36);
  });
  ctx.strokeStyle = 'rgba(184,137,59,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(tx, ty, tableW, headH + rowH * rows.length, 14);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 1; i < cols.length; i++) {
    const lx = tx + cols.slice(0, i).reduce((p, q) => p + q, 0);
    ctx.moveTo(lx, ty + headH); ctx.lineTo(lx, ty + headH + rowH * rows.length);
  }
  ctx.strokeStyle = 'rgba(184,137,59,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Test + date
  ctx.fillStyle = INK;
  fitFont(ctx, data.test_title, '600', SANS, 28, 18, W - 500);
  ctx.fillText(data.test_title, cx, 1008);
  const dateStr = new Date(data.issued_at || Date.now())
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = MUTED;
  ctx.font = `24px ${SANS}`;
  ctx.fillText(`Issued on ${dateStr}`, cx, 1046);

  // Footer: signature (left), seal (centre), QR (right)
  const footY = 1230;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(190, footY); ctx.lineTo(590, footY);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = `italic bold 40px ${SERIF}`;
  ctx.fillText('FastTypingLab', 390, footY - 16);
  ctx.fillStyle = MUTED;
  ctx.font = `600 18px ${SANS}`;
  spaced(ctx, 'AUTHORISED SIGNATORY', 390 + 2, footY + 34, 4);

  seal(ctx, cx, 1180, 100);

  // QR
  const qrSize = 190;
  const qrX = W - 190 - qrSize;
  const qrY = footY - qrSize - 20;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  if (qr) ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'center';
  ctx.font = `600 16px ${SANS}`;
  spaced(ctx, 'SCAN TO VERIFY', qrX + qrSize / 2 + 2, qrY + qrSize + 36, 3);

  // ID line
  ctx.fillStyle = MUTED;
  ctx.font = `20px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(`Certificate No. ${certificateNumber(data.id)}`, 120, H - 96);
  ctx.textAlign = 'right';
  ctx.fillText('Verify at fasttypinglab.com/certificate', W - 120, H - 96);
}

export function verifyUrl(origin: string, id: string): string {
  return `${origin}/certificate?verify=${id}`;
}

/** QR code for the verification link, as a drawable image. */
export async function makeQr(url: string): Promise<HTMLImageElement> {
  const QR = await import('qrcode');
  const dataUrl = await QR.toDataURL(url, { margin: 0, width: 380, errorCorrectionLevel: 'M', color: { dark: NAVY, light: '#FFFFFF' } });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('QR failed'));
    img.src = dataUrl;
  });
  return img;
}

export async function certificateToPdf(canvas: HTMLCanvasElement): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
  return pdf.output('blob');
}
