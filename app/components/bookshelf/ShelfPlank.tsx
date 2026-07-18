type ShelfPlankProps = {
    className?: string;
};

/**
 * Polished mahogany shelf — layered grain, soft specular, quiet academic wood.
 */
export default function ShelfPlank({ className }: ShelfPlankProps) {
    return (
        <div className={`relative w-full select-none ${className ?? ""}`} aria-hidden="true">
            {/* Top face */}
            <div
                className="relative h-[22px] w-full"
                style={{
                    backgroundColor: "#5c2a1c",
                    backgroundImage: [
                        // Fine pore / ray flecks
                        "repeating-linear-gradient(90deg, transparent 0px, transparent 7px, rgba(255,220,180,0.04) 7px, transparent 8px, transparent 19px, rgba(0,0,0,0.06) 19px, transparent 20px)",
                        // Tight growth rings
                        "repeating-linear-gradient(90deg, rgba(30,10,6,0.22) 0px, transparent 1px, transparent 2px, rgba(255,210,170,0.05) 3px, transparent 4px, transparent 6px)",
                        // Broader irregular bands (cathedral suggestion, subdued)
                        "repeating-linear-gradient(92deg, rgba(25,8,5,0.18) 0px, transparent 4px, transparent 34px, rgba(90,40,24,0.2) 48px, transparent 62px, transparent 90px)",
                        // Soft top-lit polish (not a hard chrome stripe)
                        "linear-gradient(180deg, rgba(255,236,210,0.22) 0%, rgba(255,220,190,0.06) 14%, transparent 38%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.28) 100%)",
                        // Natural mahogany body — muted, not candy-striped
                        "linear-gradient(90deg, #3d1810 0%, #6a3220 18%, #7a3d28 40%, #5e2c1c 58%, #4a2016 78%, #3a1610 100%)",
                    ].join(", "),
                    boxShadow:
                        "inset 0 1px 0 rgba(255,232,200,0.28), inset 0 -2px 3px rgba(0,0,0,0.28), inset 0 0 10px rgba(20,6,4,0.12)",
                }}
            />

            {/* Front lip: denser end-grain feel, quieter shadow */}
            <div
                className="relative h-2 w-full"
                style={{
                    backgroundColor: "#2a120c",
                    backgroundImage: [
                        "repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, transparent 1px, transparent 3px, rgba(255,200,160,0.04) 4px, transparent 6px)",
                        "linear-gradient(180deg, rgba(255,215,175,0.12) 0%, transparent 35%, rgba(0,0,0,0.4) 100%)",
                        "linear-gradient(90deg, #1e0e0a 0%, #3a1a12 45%, #2a120c 100%)",
                    ].join(", "),
                    boxShadow:
                        "inset 0 1px 0 rgba(255,220,180,0.14), 0 5px 12px rgba(30,8,4,0.28), 0 1px 2px rgba(0,0,0,0.2)",
                }}
            />
        </div>
    );
}
