import HomeClient from "./components/HomeClient";
import { getWritingPosts } from "@/lib/writing";
import { LINKED_PIECES } from "@/lib/writing-display";

export default async function Home() {
    const mdxPosts = await getWritingPosts();
    const linkedPosts = LINKED_PIECES.map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        section: p.section,
        href: p.href,
        credit: p.credit,
    }));
    const writingPosts = [...mdxPosts, ...linkedPosts].sort((a, b) =>
        b.date.localeCompare(a.date)
    );
    return <HomeClient writingPosts={writingPosts} />;
}
