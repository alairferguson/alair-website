import HomeClient from "./components/HomeClient";
import { getWritingPosts } from "@/lib/writing";

export default async function Home() {
    const writingPosts = await getWritingPosts();
    return <HomeClient writingPosts={writingPosts} />;
}
