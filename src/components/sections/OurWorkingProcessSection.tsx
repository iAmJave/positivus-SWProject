"use client";

import React, { useEffect, useState } from "react";
import WorkingProcessCard from "../cards/WorkingProcessCard";
import { Accordion } from "../ui/accordion";
import { WorkingProcess } from "@/types/types";

function OurWorkingProcessSection() {
  const [processes, setProcesses] = useState<WorkingProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");

  const handleAccordionChange = (value: string) => {
    setValue(value);
  };

    useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch('/api/public/working-processes');
        const data = await response.json();
        setProcesses(data);
      } catch (error) {
        console.error('Failed to fetch working processes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  const processesWithLabels = processes.map((process) => ({
    ...process,
    label: `${String(process.step_no).padStart(2, '0')}`,
  }));

  if (loading) {
    return (
      <section className="">
        <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
          <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
            Our Working Process
          </div>
          <p className="text-p">Loading working processes...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="">
      <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
        <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
          Our Working Process
        </div>
        <p className="text-p">
          Step-by-Step Guide to Achieving Your Business Goals
        </p>
      </div>

      <div className="mt-[80px]">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          onValueChange={handleAccordionChange}
        >
          {processesWithLabels.map((process) => (
            <WorkingProcessCard {...process} currentValue={value} key={process.id} />
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default OurWorkingProcessSection;
