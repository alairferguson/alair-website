declare module "*.mdx" {
    import type { ComponentType } from "react";

    export const metadata: {
        title?: string;
        date?: string;
        section?: string;
    };

    const MDXComponent: ComponentType<{
        // MDX 3 accepts a map of tag/component overrides (e.g. `{ a: CustomLink }`).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components?: Record<string, ComponentType<any>>;
    }>;
    export default MDXComponent;
}
