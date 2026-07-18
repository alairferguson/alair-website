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

/**
 * Derives a spine color from a book cover by downsampling it to a single
 * pixel (its average color) — simple and deterministic, no palette/vibrant
 * dependency needed. Falls back to a neutral brown if the cover can't be
 * fetched or decoded, so one broken cover can't take down the whole shelf.
 */
export async function averageColorFromImage(url: string): Promise<SpineColor> {
    try {
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (!res.ok) return FALLBACK;

        const buffer = Buffer.from(await res.arrayBuffer());
        const { data } = await sharp(buffer)
            .resize(1, 1, { fit: "cover" })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const [r, g, b] = data;
        const luminance = relativeLuminance(r, g, b);

        return {
            hex: toHex(r, g, b),
            textColor: luminance > 0.5 ? "dark" : "ivory",
        };
    } catch {
        return FALLBACK;
    }
}
