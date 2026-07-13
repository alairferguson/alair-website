// Sample data for the demo — every day 1-20 is a fully completed day.

const READ_NOTES = [
    "10 pages of Atomic Habits",
    "Chapter on compounding",
    "Nonfiction, 20 min",
    "Finished chapter 4",
    "Back on the habits book",
];

const WORKOUT1_NOTES = [
    "Outdoor run, 45 min",
    "Legs + core",
    "Push day",
    "Long walk outside",
    "Upper body",
];

const WORKOUT2_NOTES = [
    "Indoor bike, 30 min",
    "Yoga flow",
    "Pull day",
    "Stretch + mobility",
    "Second walk, evening",
];

const DIET_NOTES = [
    "No alcohol today",
    "Meal prepped Sunday",
    "Stayed on plan",
    "Home-cooked all day",
    "No sugar today",
];

function pick(list: string[], day: number): string {
    return list[(day - 1) % list.length];
}

export function getDemoNotes(day: number) {
    return {
        readNote: pick(READ_NOTES, day),
        workout1Note: pick(WORKOUT1_NOTES, day),
        workout2Note: pick(WORKOUT2_NOTES, day),
        dietNote: pick(DIET_NOTES, day),
    };
}

/** Deterministic hue per day so the placeholder photos + streak reel feel varied. */
export function hueForDay(day: number): number {
    return (day * 47) % 360;
}
