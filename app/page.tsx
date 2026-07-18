import HomeClient from "./components/HomeClient";
import { getBookshelfSpines } from "@/lib/bookshelf";
import { getWritingPosts } from "@/lib/writing";
import { PDF_PIECES } from "@/lib/writing-display";

export default async function Home() {
    const mdxPosts = await getWritingPosts();
    const pdfPosts = PDF_PIECES.map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        section: p.section,
    }));
    const writingPosts = [...mdxPosts, ...pdfPosts].sort((a, b) =>
        b.date.localeCompare(a.date)
    );
    const spines = await getBookshelfSpines();
    return <HomeClient writingPosts={writingPosts} spines={spines} />;
}
