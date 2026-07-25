import { readFile } from "node:fs/promises";
import sharp from "sharp";

export interface SpineColor {
    hex: string;
    textColor: "dark" | "ivory";
}

const FALLBACK: SpineColor = { hex: "#6b4a35", textColor: "ivory" };

function toHex(r: number, g: number, b: number): string {
    const c = (n: number) => n.toString(16).padStart(2, "0");
    return `#${c(r)}${c(g)}${c(b)}`;
}

// WCAG relative luminance, cheap approximation using sRGB channel values directly.
function relativeLuminance(r: number, g: number, b: number): number {
    const [rl, gl, bl] = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function colorFromPixel(r: number, g: number, b: number): SpineColor {
    return {
        hex: toHex(r, g, b),
        textColor: relativeLuminance(r, g, b) > 0.5 ? "dark" : "ivory",
    };
}

/** For a manually chosen spine color — picks legible title/author text against it. */
export function spineColorFromHex(hex: string): SpineColor {
    const n = parseInt(hex.replace("#", ""), 16);
    return colorFromPixel((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

/**
 * HSV saturation and (HSL) lightness. HSV saturation is what "vividness" means
 * here — HSL saturation is a poor stand-in because it inflates pale, near-white
 * colors (e.g. a cream off-white can score >0.5 in HSL despite looking washed out).
 */
function saturationAndLightness(r: number, g: number, b: number): { s: number; l: number } {
    const [rn, gn, bn] = [r / 255, g / 255, b / 255];
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    const s = max === 0 ? 0 : (max - min) / max;
    return { s, l };
}

async function averageColorFromBuffer(buffer: Buffer): Promise<SpineColor> {
    const { data } = await sharp(buffer)
        .resize(1, 1, { fit: "cover" })
        .raw()
        .toBuffer({ resolveWithObject: true });
    const [r, g, b] = data;
    return colorFromPixel(r, g, b);
}

// Fine grid so a small bold accent (a title, a band) survives downsampling
// instead of blurring into the background it sits on.
const GRID = 128;
const QUANTIZE_STEP = 24;
// A bucket needs a few samples behind it to count — filters single-pixel
// compression noise, not real color.
const MIN_BUCKET_COUNT = 3;
// Skip near-black/near-white samples — usually margins or shadows, never "the vivid color".
const MIN_LIGHTNESS = 0.1;
const MAX_LIGHTNESS = 0.92;

/**
 * Finds the most vivid (saturated) color on a cover — not its average, which
 * washes out to a pale near-white the instant most of the cover is white
 * margin around one bold accent. Downsamples to a fine grid, buckets similar
 * colors together (quantized so JPEG noise doesn't split one patch of color
 * into many near-identical ones), then picks whichever qualifying bucket has
 * the highest saturation. Falls back to the plain average for covers with no
 * real color (grayscale, sepia).
 */
async function vividColorFromBuffer(buffer: Buffer): Promise<SpineColor> {
    const { data } = await sharp(buffer)
        .resize(GRID, GRID, { fit: "cover" })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
    for (let i = 0; i + 2 < data.length; i += 3) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        const key = `${Math.round(r / QUANTIZE_STEP)}-${Math.round(g / QUANTIZE_STEP)}-${Math.round(b / QUANTIZE_STEP)}`;
        const bucket = buckets.get(key);
        if (bucket) {
            bucket.r += r;
            bucket.g += g;
            bucket.b += b;
            bucket.count += 1;
        } else {
            buckets.set(key, { r, g, b, count: 1 });
        }
    }

    let best: { r: number; g: number; b: number; s: number } | null = null;
    for (const bucket of buckets.values()) {
        if (bucket.count < MIN_BUCKET_COUNT) continue;
        const r = bucket.r / bucket.count;
        const g = bucket.g / bucket.count;
        const b = bucket.b / bucket.count;
        const { s, l } = saturationAndLightness(r, g, b);
        if (l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) continue;
        if (!best || s > best.s) best = { r, g, b, s };
    }

    if (!best) return averageColorFromBuffer(buffer);
    return colorFromPixel(Math.round(best.r), Math.round(best.g), Math.round(best.b));
}

/**
 * Derives a spine color from a book cover's most vivid color, so a mostly-white
 * cover with one bold accent (a title, a band, a small illustration) tints the
 * spine with that accent instead of washing out to near-white. Falls back to a
 * neutral brown if the cover can't be fetched or decoded, so one broken cover
 * can't take down the whole shelf.
 */
export async function vividColorFromImage(url: string): Promise<SpineColor> {
    try {
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (!res.ok) return FALLBACK;
        return await vividColorFromBuffer(Buffer.from(await res.arrayBuffer()));
    } catch {
        return FALLBACK;
    }
}

/** Same as {@link vividColorFromImage}, but for a hand-picked cover on disk. */
export async function vividColorFromFile(absolutePath: string): Promise<SpineColor> {
    try {
        return await vividColorFromBuffer(await readFile(absolutePath));
    } catch {
        return FALLBACK;
    }
}
