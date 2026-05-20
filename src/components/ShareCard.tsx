import { useState } from "react";
import QRCode from "qrcode";
import type { Word } from "../types";
import { LANGUAGES } from "../types";
import { useLocale } from "../contexts/LocaleContext";
import { usePortal } from "../contexts/PortalContext";
import Icon from "./Icon";

interface Props {
  word: Word;
  onClose: () => void;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generateCanvas(word: Word, portalName: string, url: string): Promise<HTMLCanvasElement> {
  // Vertical story format (1080x1920 at 2x for retina)
  const canvas = document.createElement("canvas");
  const w = 540;
  const h = 960;
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, w, h);

  // Top accent bar
  ctx.fillStyle = "#385C76";
  ctx.fillRect(0, 0, w, 5);

  // Portal name
  ctx.font = "500 12px Inter, sans-serif";
  ctx.fillStyle = "#9A8E7E";
  ctx.fillText(portalName.toUpperCase(), 40, 50);

  // Divider
  ctx.fillStyle = "#E8E0D4";
  ctx.fillRect(40, 65, 60, 1);

  // Language + type
  ctx.font = "500 13px Inter, sans-serif";
  ctx.fillStyle = "#9A8E7E";
  const lang = LANGUAGES.find((l) => l.code === word.language);
  const meta = `${lang?.name ?? ""} · ${(word.entryType ?? "word").charAt(0).toUpperCase() + (word.entryType ?? "word").slice(1)}${word.wordType ? ` · ${word.wordType}` : ""}`;
  ctx.fillText(meta, 40, 100);

  // Term
  ctx.font = "600 42px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "#1A1612";
  const termLines = wrapText(ctx, word.term, w - 80);
  let y = 160;
  for (const line of termLines.slice(0, 2)) {
    ctx.fillText(line, 40, y);
    y += 52;
  }

  // Translation
  y += 10;
  ctx.font = "italic 500 18px Inter, sans-serif";
  ctx.fillStyle = "#B8705A";
  const transLang = LANGUAGES.find((l) => l.code === (word.translationLanguage || "es"));
  ctx.fillText(`${transLang?.name ?? "Español"}: ${word.translation}`, 40, y);
  y += 40;

  // Meaning
  if (word.meaning) {
    ctx.font = "400 15px Inter, sans-serif";
    ctx.fillStyle = "#6B5E4F";
    const meaningLines = wrapText(ctx, word.meaning, w - 80);
    for (const line of meaningLines.slice(0, 6)) {
      ctx.fillText(line, 40, y);
      y += 22;
    }
    y += 15;
  }

  // Examples
  if (word.examples?.length > 0) {
    ctx.fillStyle = "#B8705A";
    ctx.fillRect(40, y, 3, 50);
    ctx.font = "italic 14px Inter, sans-serif";
    ctx.fillStyle = "#9A8E7E";
    const exLines = wrapText(ctx, `«${word.examples[0]}»`, w - 100);
    let ey = y + 16;
    for (const line of exLines.slice(0, 3)) {
      ctx.fillText(line, 54, ey);
      ey += 20;
    }
    y = ey + 20;
  }

  // Tags
  if (word.tags?.length > 0) {
    ctx.font = "400 12px Inter, sans-serif";
    ctx.fillStyle = "#C4BAA8";
    ctx.fillText(word.tags.map((t) => `#${t}`).join("  "), 40, y + 10);
  }

  // --- Bottom section ---
  // QR Code
  const qrSize = 100;
  const qrY = h - 160;
  try {
    const qrDataUrl = await QRCode.toDataURL(url, { width: qrSize * 2, margin: 0, color: { dark: "#1A1612", light: "#FAF7F2" } });
    const qrImg = new Image();
    await new Promise<void>((resolve) => { qrImg.onload = () => resolve(); qrImg.src = qrDataUrl; });
    ctx.drawImage(qrImg, w - 40 - qrSize, qrY, qrSize, qrSize);
  } catch {}

  // URL text
  ctx.font = "400 12px Inter, sans-serif";
  ctx.fillStyle = "#385C76";
  const shortUrl = url.replace(/^https?:\/\//, "");
  ctx.fillText(shortUrl, 40, qrY + 20);

  // "Scan to open" hint
  ctx.font = "400 11px Inter, sans-serif";
  ctx.fillStyle = "#C4BAA8";
  ctx.fillText("Scansiona per aprire", 40, qrY + 40);

  // Bottom bar
  ctx.fillStyle = "#E8E0D4";
  ctx.fillRect(40, h - 40, w - 80, 1);
  ctx.font = "400 11px Inter, sans-serif";
  ctx.fillStyle = "#C4BAA8";
  ctx.fillText(`${portalName} — ${new Date().getFullYear()}`, 40, h - 18);

  return canvas;
}

export default function ShareCard({ word, onClose }: Props) {
  const { t } = useLocale();
  const { portal } = usePortal();
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const wordUrl = `${window.location.origin}/${word.language}/${word.slug || word.id}`;

  async function handleShareImage() {
    setGenerating(true);
    try {
      const canvas = await generateCanvas(word, portal.name, wordUrl);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) { setGenerating(false); return; }

      const file = new File([blob], `${word.term}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: word.term, text: `${word.term} — ${word.translation}`, files: [file] });
      } else {
        // Show preview
        setImageUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  }

  async function handleShareLink() {
    if (navigator.share) {
      await navigator.share({ title: word.term, text: `${word.term} — ${word.translation}`, url: wordUrl });
    } else {
      await navigator.clipboard.writeText(wordUrl);
    }
  }

  function downloadImage() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${word.term}.png`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded border border-sand/30 p-6 max-w-sm w-full mx-4 shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg text-espresso">{t("word.share")}</h3>
          <button onClick={onClose} className="text-stone hover:text-espresso p-1"><Icon name="close" size={18} /></button>
        </div>

        {/* Image preview */}
        {imageUrl && (
          <div className="mb-4">
            <img src={imageUrl} alt={word.term} className="w-full rounded border border-sand/30" />
            <button onClick={downloadImage} className="w-full mt-2 py-2.5 bg-cream text-walnut rounded text-sm hover:bg-sand/30 transition-all">
              {t("share.download")}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={handleShareImage} disabled={generating}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-espresso text-ivory rounded text-sm font-medium hover:bg-ink transition-all disabled:opacity-40">
            <Icon name="send" size={16} />
            {generating ? "..." : t("share.image")}
          </button>
          <button onClick={handleShareLink}
            className="w-full flex items-center justify-center gap-2.5 py-3 border border-sand/50 text-walnut rounded text-sm hover:bg-cream transition-all">
            <Icon name="globe" size={16} />
            {t("share.link")}
          </button>
        </div>
      </div>
    </div>
  );
}
