import Link from "next/link";
import type { WritingPost } from "@/lib/writing";

type WritingLinkProps = {
    post: WritingPost;
};

export function WritingLink({ post }: WritingLinkProps) {
    return (
        <li key={post.slug}>
            <Link
                href={`/writing/${post.slug}`}
                className="hover:text-primary flex flex-row items-baseline gap-2"
            >
                <span className="font-medium">{post.title}</span>
                {post.date && (
                    <>
                        <span className="grow border-b-2 border-dotted border-[rgba(0,0,0,0.8)] self-center"></span>
                        <span className="text-[rgba(0,0,0,0.8)]">
                            {post.date}
                        </span>
                    </>
                )}
            </Link>
        </li>
    );
}
