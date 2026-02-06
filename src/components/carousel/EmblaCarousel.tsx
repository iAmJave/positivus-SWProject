import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import { PrevButton, NextButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
import { Testimonial } from "@/types/types";
import Image from "next/image";

type PropType = {
  slides: Testimonial[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="flex md:-ml-8 px-2">
          {slides.map((slide, index) => (
            <div className="md:flex-[0_0_70%] flex-[0_0_100%] md:pl-8 px-2 select-none max-w-[750px] py-10" key={index}>
              <div className="relative min-h-64 p-6 md:p-12 border border-primary md:my-12 my-8 rounded-3xl ">
                <div className="absolute md:h-16 md:w-16 h-10 w-10 border-b border-r border-primary rotate-45 md:-bottom-8 -bottom-5 md:left-16 left-10 bg-secondary "></div>
                <p className="text-white md:md:text-lg font-normal">"{slide.message}"</p>
              </div>
              <div className="ml-14 md:ml-24 pt-2 text-h4">
                <h4 className="text-primary">{slide.name}</h4>
                <p className="text-white">{slide.role_company}</p>
              </div>
            </div>
          ))} 
        </div>
      </div>

      <div className=" flex justify-between max-w-3xl  mx-auto md:pt-20  p-8">
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <div className="flex gap-4">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={index === selectedIndex ? " text-secondary" : " text-white"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ rotate: 90 }}
              
            >
              <Image src="/images/star.svg" alt="star" width={16} height={16} />
            </DotButton>
          ))}
        </div>
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>
    </section>
  );
};

export default EmblaCarousel;
