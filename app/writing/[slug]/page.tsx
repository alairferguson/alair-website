import Link from "next/link";
import { notFound } from "next/navigation";
import Paper from "@/app/components/Paper";
import { getWritingSlugs } from "@/lib/writing";

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return getWritingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    try {
        const mod = await import(`@/content/writing/${slug}.mdx`);
        const meta = mod.metadata as { title?: string };
        return { title: meta?.title ? `${meta.title} | Alair` : "Writing | Alair" };
    } catch {
        return { title: "Writing | Alair" };
    }
}

export default async function WritingArticlePage({ params }: PageProps) {
    const { slug } = await params;

    let Post: React.ComponentType;
    let metadata: { title?: string; date?: string };
    try {
        const mod = await import(`@/content/writing/${slug}.mdx`);
        Post = mod.default;
        metadata = mod.metadata ?? {};
    } catch {
        notFound();
    }

    return (
        <div className="flex min-h-dvh box-border items-center justify-center font-body p-10">
            <main className="flex min-h-full w-full max-w-4xl flex-col items-center justify-between gap-16">
                <Paper id="article" showHomeButton homeButtonLink="/#writing" landscape>
                    <div className="h-full w-full outline-0 flex flex-col justify-start items-center gap-4 md:gap-8 min-h-0">
                        <article className="flex-1 w-full flex flex-col gap-4 text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply leading-relaxed prose prose-headings:font-heading prose-headings:italic prose-p:my-2 prose-ul:my-2 prose-li:my-0 max-w-none">
                            <header className="text-center mb-4">
                                <h1 className="text-3xl font-heading mix-blend-multiply uppercase tracking-wide">
                                    {metadata.title}
                                </h1>
                                {metadata.date && (
                                    <p className="text-[rgba(0,0,0,0.6)] text-sm mt-1">
                                        {metadata.date}
                                    </p>
                                )}
                            </header>
                            <Post />
                        </article>

                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply text-left self-start mt-4">
                            <Link href="/#writing" className="hover:text-primary">
                                ← Back to Writing
                            </Link>
                        </p>
                    </div>
                </Paper>
            </main>
        </div>
    );
}
