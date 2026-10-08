// Generates images/icon.png — a 256x256 "MDSL" wordmark icon.
// Pure-JS (pngjs), no native deps. Run from a dir where pngjs is installed:
//   NODE_PATH=<node_modules> node build/generate-icon.cjs
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const SIZE = 256;
const png = new PNG({ width: SIZE, height: SIZE });

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

function set(x, y, rgba) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (SIZE * y + x) << 2;
  const a = rgba[3] === undefined ? 255 : rgba[3];
  if (a === 255) {
    png.data[i] = rgba[0]; png.data[i + 1] = rgba[1]; png.data[i + 2] = rgba[2]; png.data[i + 3] = 255;
  } else {
    // alpha blend over existing
    const da = png.data[i + 3] / 255, sa = a / 255;
    const oa = sa + da * (1 - sa);
    png.data[i] = Math.round((rgba[0] * sa + png.data[i] * da * (1 - sa)) / (oa || 1));
    png.data[i + 1] = Math.round((rgba[1] * sa + png.data[i + 1] * da * (1 - sa)) / (oa || 1));
    png.data[i + 2] = Math.round((rgba[2] * sa + png.data[i + 2] * da * (1 - sa)) / (oa || 1));
    png.data[i + 3] = Math.round(oa * 255);
  }
}

// background: vertical dark-navy gradient
const bgTop = hex("#16282f"), bgBot = hex("#0a141a");
for (let y = 0; y < SIZE; y++) {
  const c = mix(bgTop, bgBot, y / (SIZE - 1));
  for (let x = 0; x < SIZE; x++) set(x, y, [...c, 255]);
}

// subtle top-left glow
const glow = hex("#2fb3c0");
for (let y = 0; y < SIZE; y++)
  for (let x = 0; x < SIZE; x++) {
    const d = Math.hypot(x - 40, y - 30) / 260;
    if (d < 1) set(x, y, [...glow, Math.round(28 * (1 - d))]);
  }

// 5x7 block glyphs
const G = {
  M: ["10001", "11011", "10101", "10001", "10001", "10001", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  S: ["01110", "10001", "10000", "01110", "00001", "10001", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
};
const word = "MDSL";
const s = 9;                       // pixel scale
const gw = 5 * s, gap = 1 * s;     // glyph width, gap
const totalW = word.length * gw + (word.length - 1) * gap;
const totalH = 7 * s;
const x0 = Math.round((SIZE - totalW) / 2);
const y0 = Math.round((SIZE - totalH) / 2) - 6;

const blue = hex("#5aa9e6"), teal = hex("#4ec9b0");
for (let gi = 0; gi < word.length; gi++) {
  const g = G[word[gi]];
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 5; c++)
      if (g[r][c] === "1") {
        const px = x0 + gi * (gw + gap) + c * s;
        const py = y0 + r * s;
        const t = (px + s / 2) / SIZE;
        const col = mix(blue, teal, t);
        for (let dy = 0; dy < s; dy++)
          for (let dx = 0; dx < s; dx++) set(px + dx, py + dy, [...col, 255]);
      }
}

// accent underline bar (gradient)
const barY = y0 + totalH + 16, barH = 7, barW = 150;
const barX = Math.round((SIZE - barW) / 2);
for (let y = 0; y < barH; y++)
  for (let x = 0; x < barW; x++) {
    const t = x / barW;
    const col = mix(teal, blue, t);
    const edge = Math.min(y, barH - 1 - y, x, barW - 1 - x);
    set(barX + x, barY + y, [...col, edge < 1 ? 180 : 255]);
  }

const out = path.join(__dirname, "..", "images", "icon.png");
fs.mkdirSync(path.dirname(out), { recursive: true });
png.pack().pipe(fs.createWriteStream(out)).on("close", () => {
  console.log("wrote", out, `${SIZE}x${SIZE}`);
});
