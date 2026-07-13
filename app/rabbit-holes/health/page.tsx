import type { Metadata } from "next";
import HealthDemo from "./HealthDemo";

export const metadata: Metadata = {
    title: "75 Hard Tracker | Rabbit Holes | Alair",
};

export default function HealthPage() {
    return <HealthDemo />;
}
