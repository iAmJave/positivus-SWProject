'use client';

import { TeamMember } from "@/types/types";
import React, { useEffect, useState } from "react";
import MainButton from "../common/MainButton";
import TeamCard from "../cards/TeamCard";

function TeamSection() {
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/public/team-members');
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
          <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
            Team
          </div>
          <p className="text-p">Loading team members...</p>
        </div>
      </section>
    );
  }

  const teamsWithImages = teams.map((team, index) => ({
    ...team,
    name: team.name,
    position: team.role,
    experience: team.overview,
    socials_json: team.socials_json || undefined,
    image: team.avatar_url || `/images/t_${(index % 6) + 1}.png`,
  }));

  const displayedTeams = showAll ? teamsWithImages : teamsWithImages.slice(0, 6);

  return (
    <section>
      <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
        <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
          Team
        </div>
        <p className="text-p">
          Meet the skilled and experienced team behind our successful digital
          marketing strategies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] mt-[80px]">
        {displayedTeams.map((team) => (
          <TeamCard {...team} key={team.id} />
        ))}
      </div>

      {teams.length > 6 && (
        <div className="mt-[40px] flex justify-end">
          <MainButton
            text={showAll ? "Show less" : "See all team"}
            action={() => setShowAll(!showAll)}
            classes="bg-secondary text-white text-[18px] w-full md:w-[231px] hover:text-black"
          />
        </div>
      )}
    </section>
  );
}

export default TeamSection;
