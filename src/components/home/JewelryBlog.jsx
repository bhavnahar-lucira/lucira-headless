"use client";

import Image from "next/image";
import Link from "next/link";

const BLOGS = [
  {
    id: "1",
    image: "/images/blogs/1.jpg",
    readTime: "4 min read",
    date: "January 04, 2026",
    title: "How Many Types Of Diamond: A Comprehensive 2026 Guide",
    excerpt:
      "When choosing the perfect piece of jewelry, you might wonder, how many types of diamond truly exist? The question of how many diamond varieties are available can feel overwhelming at first.",
    href: "/blogs/how-many-types-of-diamond",
  },
  {
    id: "2",
    image: "/images/blogs/2.jpg",
    readTime: "6 min read",
    date: "May 23, 2025",
    title: "What Is 9kt Gold? Your Complete Guide To Affordable Luxury",
    excerpt:
      "When exploring the world of fine jewelry, you'll encounter various gold purities. Among them, 9 karat gold stands out as a popular choice for style and value.",
    href: "/blogs/what-is-9kt-gold",
  },
  {
    id: "3",
    image: "/images/blogs/3.jpg",
    readTime: "3 min read",
    date: "January 12, 2026",
    title: "Valentine Day Gift for Wife: Elegant Jewelry Ideas",
    excerpt:
      "Valentine's Day is more than a date on the calendar. It's a celebration of togetherness, affection, and the beautiful bond you share with the one you love.",
    href: "/blogs/valentine-day-gift-for-wife",
  },
  {
    id: "4",
    image: "/images/blogs/4.jpg",
    readTime: "10 min read",
    date: "March 04, 2025",
    title: "Elegant Diamond Nose Pin Design Collection – By Lucira Jewelry",
    excerpt:
      "When subtlety meets sparkle, it creates an everlasting impression and that's exactly what Lucira Jewelry brings you with its diamond nose pin collection.",
    href: "/blogs/diamond-nose-pin-design-collection",
  },
];

function BlogCard({ blog }) {
  return (
    <Link
      href={blog.href}
      className="group block overflow-hidden rounded-sm border border-[#ddd6d2] bg-white"
    >
      <div className="relative aspect-[1/1.02] w-full overflow-hidden">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="px-2.5 py-3">
        <div className="mb-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span>{blog.readTime}</span>
          <span className="h-3 w-px bg-black" />
          <span>{blog.date}</span>
        </div>

        <h3 className="line-clamp-2 min-h-13 text-lg leading-6 font-bold text-black">
          {blog.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-5 text-[#767676]">
          {blog.excerpt}
        </p>
      </div>
    </Link>
  );
}

export default function JewelryBlog() {
  return (
     <section className="w-full mt-15 overflow-hidden">
      <div className="container-main">
        <div className="text-center mb-6">
          <h2 className="main-title font-extrabold font-abhaya mb-1.5 text-3xl">Jewelry Blog By Lucira</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BLOGS.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        <div className="mt-8 flex justify-center pb-10">
          <Link
            href="/blogs"
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-8 text-base font-bold uppercase tracking-wide text-white transition hover:opacity-90"
          >
            Read All Blogs
          </Link>
        </div>
      </div>
    </section>
  );
}
