export type RabbitHole = {
    slug: string;
    title: string;
    position: {
        top?: string;
        left?: string;
        right?: string;
        bottom?: string;
    };
};

export const RABBIT_HOLES: RabbitHole[] = [
    {
        slug: "health",
        title: "Health",
        position: { top: "28%", left: "10%" },
    },
    {
        slug: "plants",
        title: "Plants",
        position: { top: "16%", right: "12%" },
    },
    {
        slug: "llm-axelrod-tournament",
        title: "LLM Axelrod Tournament",
        position: { top: "56%", right: "10%" },
    },
];

export function getRabbitHoleSlugs(): string[] {
    return RABBIT_HOLES.map((hole) => hole.slug);
}

export function getRabbitHole(slug: string): RabbitHole | undefined {
    return RABBIT_HOLES.find((hole) => hole.slug === slug);
}
