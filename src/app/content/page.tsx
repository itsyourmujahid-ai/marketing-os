/* @ts-nocheck */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ComingSoon } from "@/components/ui/ComingSoon";
import { getFeature, isFeatureAvailable } from "@/lib/features";

export default function ContentPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [feature, setFeature] = useState(getFeature(pathname));

  useEffect(() => {
    const handleChange = () => {
      setFeature(getFeature(usePathname()));
    };
    const una = window.addEventListener("popstate", handleChange);
    return () => una.removeEventListener("popstate", handleChange);
  }, [pathname, router]);

  if (!feature) {
    return null;
  }

  return (
    <ComingSoon
      featureName={feature.name}
      description={feature.description}
      icon={feature.icon}
      category={feature.status}
      onBack={() => {
        router.push("/dashboard");
      }}
    />
  );
}