
import { Linkedin, Github, Facebook, Twitter } from 'lucide-react';
import { Separator } from '../ui/separator';

interface IProps {
  name: string;
  position: string;
  experience: string;
  image: string;
  socials_json?: Record<string, string>;
}

function TeamCard({ name, position, experience, image, socials_json }: IProps) {
  const getSocialIcon = (social: string, url: string) => {
    const iconProps = { size: 20, className: 'cursor-pointer hover:opacity-70 transition-opacity' };
    
    switch (social.toLowerCase()) {
      case 'linkedin':
        return (
          <a key={social} href={url} target="_blank" rel="noopener noreferrer" className='bg-secondary text-primary p-2 rounded-full'>
            <Linkedin {...iconProps} />
          </a>
        );
      case 'github':
        return (
          <a key={social} href={url} target="_blank" rel="noopener noreferrer className='bg-secondary text-primary p-2 rounded-full">
            <Github {...iconProps} />
          </a>
        );
      case 'facebook':
        return (
          <a key={social} href={url} target="_blank" rel="noopener noreferrer className='bg-secondary text-primary p-2 rounded-full">
            <Facebook {...iconProps} />
          </a>
        );
      case 'twitter':
        return (
          <a key={social} href={url} target="_blank" rel="noopener noreferrer className='bg-secondary text-primary p-2 rounded-full">
            <Twitter {...iconProps} />
          </a>
        );
      default:
        return null;
    }
  };

  const hasSocials = socials_json && Object.keys(socials_json).length > 0;

  return (
    <div className="rounded-[45px] p-8 md:p-[31px] border border-secondary border-b-[6px]">
      <div className="flex justify-between">
        <div className="flex gap-[20px] items-end">
          <div>
            <img src={image || "/placeholder.svg"} alt="team image" />
          </div>
          <div>
            <p className="text-[20px] font-medium">{name}</p>
            <p>{position}</p>
          </div>
        </div>

        {hasSocials && (
          <div className="flex gap-3 items-start">
            {Object.entries(socials_json).map(([social, url]) => 
              url ? getSocialIcon(social, url) : null
            )}
          </div>
        )}
      </div>

      <div className="my-[28px]">
        <Separator className="border border-black" />
      </div>
      <div>
        <p className="text-p">{experience}</p>
      </div>
    </div>
  );
}

export default TeamCard;
