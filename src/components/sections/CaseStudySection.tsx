'use client';
import Link from "next/link";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import { CaseStudy } from "@/types/types";
import Image from "next/image";

export default function CaseStudySection() {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await fetch('/api/public/case-studies');
        const data = await response.json();
        setStudies(data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch case studies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, []);

  if (loading) {
    return (
      <section className="">
        <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
          <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
            Case Studies
          </div>
          <p className="text-p">Loading case studies...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="">
      <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
        <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
          Case Studies
        </div>
        <p className="text-p">
          Explore Real-Life Examples of Our Proven Digital Marketing Success
          through Our Case Studies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center rounded-[45px] gap-[40px] mt-[80px] bg-secondary text-white p-8 md:p-[50px]">
        {studies.map((study, index) => (
          <div className="flex justify-between items-center" key={index}>
            <div>
              <p className="pb-[20px] pr-5">{study.short_description}</p>
              {study.link_url ? (
                <Link href={study.link_url} className="flex gap-2 items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-primary">Learn more</span>
                  <Image src="/images/arrow_rotate.png" width={20} height={20} alt="arrow"/>
                </Link>
              ) : (
                <span className="text-muted-foreground text-sm">No link available</span>
              )}
            </div>
            {index !== 2 && (
              <div className="hidden md:block">
                <Separator orientation="vertical" className="h-[186px]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
