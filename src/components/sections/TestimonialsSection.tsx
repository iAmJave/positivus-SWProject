'use client';

import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "@components/carousel/EmblaCarousel";
import "@/components/carousel/carousel.css";
import { useEffect, useState } from "react";
import { Testimonial } from "@/types/types";

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/public/testimonials');
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const OPTIONS: EmblaOptionsType = { loop: true };

  const formattedTestimonials = testimonials.map((t) => ({
    testimonial: t.message,
    name: t.name,
    role: t.role_company,
  }));

  if (loading) {
    return (
      <section>
        <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
          <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
            Testimonials
          </div>
          <p className="text-p">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
        <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
          Testimonials
        </div>
        <p className="text-p">
          Meet the skilled and experienced team behind our successful digital
          marketing strategies
        </p>
      </div>
      <div className="bg-secondary md:rounded-[45px] rounded-3xl mt-[80px]">
        <EmblaCarousel slides={testimonials} options={OPTIONS} />
      </div>
    </section>
  );
};

export default TestimonialSection;
