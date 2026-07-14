export type PlayerKind = "classic" | "llm";

export type Fingerprint = {
    cooperation_rate: number;
    niceness: number;
    retaliation: number;
    forgiveness: number;
    provocability: number;
};

export type MetricId =
    | keyof Fingerprint
    | "mean_score_per_turn";

export type Metric = {
    id: MetricId;
    label: string;
    shortLabel: string;
    description: string;
    domain: [number, number] | "auto";
};

export type Player = {
    id: string;
    kind: PlayerKind;
    model: string | null;
    persona: string | null;
    label: string;
    shortLabel: string;
    color: string;
    fingerprint: Fingerprint;
    outcomes: {
        wins: number;
        meanScorePerTurn: number;
        totalScore: number;
        matches: number;
    };
    ranked?: {
        rank: number;
        meanNormalisedScore: number;
    };
    nearestClassic?: {
        id: string;
        label: string;
        distance: number;
    };
    nearestClassicRanking?: Array<{
        id: string;
        label: string;
        distance: number;
    }>;
};

export type Series = {
    id: string;
    label: string;
    color: string;
    playerIds: string[];
};

export type Report = {
    version: number;
    generatedAt: string;
    title: string;
    subtitle: string;
    meta: {
        players: number;
        classics: number;
        llms: number;
        matchesPerPlayer: number | null;
        turns: number | null;
        fingerprintDimensions: Array<keyof Fingerprint>;
        defaultAxes: { x: MetricId; y: MetricId };
    };
    metrics: Metric[];
    players: Player[];
    series: Series[];
    cooperationMatrix: {
        players: string[];
        values: Record<string, Record<string, number>>;
    };
};
