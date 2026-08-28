import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionStudio } from "@/components/sections/SectionStudio";
import { getSection, sections } from "@/lib/catalog";

type Params = Promise<{ section: string }>;

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: "Studio not found" };

  return {
    title: section.name,
    description: section.description,
    openGraph: {
      title: `${section.name} · Design Khajana`,
      description: section.description,
      type: "website",
    },
  };
}

export default async function SectionPage({ params }: { params: Params }) {
  const { section: slug } = await params;
  const section = getSection(slug);

  if (!section) notFound();

  return <SectionStudio section={section} />;
}