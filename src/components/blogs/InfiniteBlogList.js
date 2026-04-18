"use client";

import { useEffect, useState, useRef } from "react";
import BlogList from "./BlogList";

export default function InfiniteBlogList({
  initialArticles,
  initialCursor,
  hasNextPage: initialHasNext,
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNext);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef();

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading) {
        setLoading(true);

        const res = await fetch("/api/blogs", {
          method: "POST",
          body: JSON.stringify({ cursor }),
        });

        const data = await res.json();

        setArticles((prev) => [
          ...prev,
          ...data.articles.map(e => e.node),
        ]);

        setCursor(data.articles.at(-1)?.cursor);
        setHasNextPage(data.pageInfo.hasNextPage);

        setLoading(false);
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [cursor, hasNextPage, loading]);

  return (
    <>
      <BlogList articles={articles} />

      <div ref={observerRef} className="h-20 flex justify-center items-center">
        {loading && <p>Loading...</p>}
        {!hasNextPage && <p>No more blogs</p>}
      </div>
    </>
  );
}