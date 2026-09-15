export default function RoundsLoop() {
    return (
        <div className="ipd-rounds-loop">
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                width={1600}
                height={900}
                aria-label="Two players choosing cooperate or defect each round, with payoffs filing into a score history."
                src="/rabbit-holes/llm-IPD-tournament/rounds-loop.mp4"
            />
        </div>
    );
}
