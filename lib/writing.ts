import { readdirSync } from "fs";
import path from "path";

const WRITING_DIR = path.join(process.cwd(), "content/writing");

export type WritingPost = {
    slug: string;
    title: string;
    date: string;
};

export async function getWritingPosts(): Promise<WritingPost[]> {
    const files = readdirSync(WRITING_DIR).filter((f) => f.endsWith(".mdx"));
    const posts: WritingPost[] = [];

    for (const file of files) {
        const slug = file.replace(/\.mdx$/, "");
        const mod = await import(`@/content/writing/${slug}.mdx`);
        const meta = mod.metadata as { title?: string; date?: string };
        posts.push({
            slug,
            title: meta?.title ?? slug,
            date: meta?.date ?? "",
        });
    }

    return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getWritingSlugs(): string[] {
    return readdirSync(WRITING_DIR)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx$/, ""));
}
