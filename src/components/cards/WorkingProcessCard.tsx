import { cn } from "../../lib/utils"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

interface IProps {
  label: string;
  title: string;
  description: string;
  currentValue: string;
}

function WorkingProcessCard({
  label,
  title,
  description,
  currentValue,
}: IProps) {
  return (
    <div
      className={cn(
        currentValue === `item-${label}` ? "bg-primary" : "bg-accent",
        "rounded-[45px] p-8 md:p-[50px] border-[1px] border-b-[6px] border-black mb-[30px]"
      )}
    >
      <AccordionItem value={`item-${label}`}>
        <AccordionTrigger className="hover:no-underline">
          {" "}
          <div className="flex items-center gap-4">
            <span className="text-h1Mobile md:text-h1 font-bold">{label}</span>{" "}
            <span className="text-p md:text-h3 font-medium">{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-pMobile md:text-p">{description}</AccordionContent>
      </AccordionItem>
    </div>
  );
}

export default WorkingProcessCard;
