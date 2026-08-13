import { MDXRemote } from "next-mdx-remote/rsc";

import { mdxComponents } from "@/components/lesson/mdx-components";

export function LessonBody({ source }: { source: string }) {
  return <MDXRemote components={mdxComponents} source={source} />;
}
