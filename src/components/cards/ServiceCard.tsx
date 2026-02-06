import Image from "next/image";
import { cn } from "../../lib/utils"
import Link from "next/link";

interface IProps {
  titleTop: string;
  titleBottom: string;
  bg: string;
  titleBg: string;
  image: string;
  darkArrow?: boolean;
  link?: string;
}

function ServiceCard({
  titleTop,
  titleBottom,
  bg,
  titleBg,
  image,
  darkArrow = true,
  link = "/",
}: IProps) {
  return (
    <div
      className={cn(
        bg,
        "rounded-[45px] p-8 md:p-[50px] border-[1px] border-b-[6px] border-black"
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col justify-between gap-20">
            <div className="block font-medium text-h3Mobile md:text-h3">
              <div
                className={cn(
                  " bg-primary rounded-[7px] px-2 w-fit",
                  titleBg
                )}
              >
                {titleTop}{" "}
              </div>
              <div
                className={cn(
                  " bg-primary rounded-[7px] inline-block p-2",
                  titleBg
                )}
              >
                {titleBottom}{" "}
              </div>
            </div>
            <Link href={link}>
              <div className="flex gap-2 items-center">
                <div>
                  {darkArrow ? (
                    <Image src="/images/arrow_dark.png" alt="dark arrow icon" height={40} width={40}/>
                  ) : (
                    <Image src="/images/arrow_light.png" alt="light arrow icon" height={40} width={40} />
                  )}
                </div>
                <p className={cn("text-h4Mobile md:text-h4", darkArrow ? "text-black" : "text-white")}>
                  Learn more
                </p>
              </div>
            </Link>
        </div>
        <div className="relative w-[200px] h-[160px] md:w-[260px] md:h-[200px]">
          <Image
            src={image}
            alt="card icon"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
    
  );
}

export default ServiceCard;
