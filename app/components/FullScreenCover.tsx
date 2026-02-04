export default function FullScreenCover() {
    return (
        <div
            style={{
                position: "fixed",
                top: "1svh",
                width: "100vw",
                zIndex: 50,

                // Fade out at the top and bottom so Safari's cutoff looks intentional
                maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
            }}
        >
            {/* The full screen cover */}
            <div style={{
                backgroundColor: "rgba(255,0,0,0.5)",
                border: "16px solid blue",
                height: "98svh",
            }} />
        </div>
    );
}