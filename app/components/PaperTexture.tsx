const PAPER_TEXTURE_STYLE = {
    backgroundImage: 'url("/paper-texture-tile.png")',
    backgroundRepeat: "repeat" as const,
    backgroundSize: "128px 128px",
};

export default function PaperTexture({ className }: { className?: string }) {
    return (
        <div
            className={`pointer-events-none absolute inset-0 mix-blend-multiply opacity-50 ${className ?? ""}`}
            style={PAPER_TEXTURE_STYLE}
            aria-hidden="true"
        />
    );
}
