'use client';

import { Service } from "@/types/types";
import React, { useEffect, useState } from "react";
import ServiceCard from "../cards/ServiceCard";

const colorCycle = ['bg-accent', 'bg-primary', 'bg-secondary'];
const titleBgCycle = ['bg-primary', 'bg-white', 'bg-white'];
const darkArrowCycle = [true, true, false];

export default function ServiceSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/public/services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const servicesWithStyles = services.map((service, index) => ({
    ...service,
    titleTop: service.title.split(' ').slice(0, -1).join(' '),
    titleBottom: service.title.split(' ').slice(-1).join(' '),
    bg: colorCycle[index % colorCycle.length],
    titleBg: titleBgCycle[index % titleBgCycle.length],
    image: service.icon_url || `/images/s_${(index % 6) + 1}.png`,
    darkArrow: darkArrowCycle[index % darkArrowCycle.length],
    link: "/",
  }));

  if (loading) {
    return (
      <section className="">
        <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
          <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
            Services
          </div>
          <p className="text-p">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="">
      <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
        <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
          Services
        </div>
        <p className="text-p">
          At our digital marketing agency, we offer a range of services to help
          businesses grow and succeed online. These services include:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] mt-[80px]">
        {servicesWithStyles.map((service) => (
          <ServiceCard {...service} key={service.id} />
        ))}
      </div>
    </section>
  );
}
