import type { MDXComponents } from "mdx/types";

const defaults: MDXComponents = {
    a: ({ href, children, ...props }) => (
        <a
            href={href}
            {...props}
            className="hover:text-primary underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
            {children}
        </a>
    ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...defaults,
        ...components,
    };
}
