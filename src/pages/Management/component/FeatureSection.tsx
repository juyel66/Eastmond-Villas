import { Button } from "@/components/ui/button";
import React from "react";
import { FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

/**
 * FeatureSection
 * - Shadcn + Tailwind (TSX)
 * - All copy & image come from props
 * - Layout can flip with imageSide="left" | "right"
 *
 * Example:
 * <FeatureSection
 *   title="Tailored, White-Glove Service"
 *   description="Every villa is distinct, tailored to your needs..."
 *   bullets=[
 *     "Tailored, White-Glove Service",
 *     "Elite Maintenance & Upkeep",
 *     "Experience the Eastmond Villas Difference",
 *     "Exclusive Owner Benefits",
 *   ]
 *   imageUrl="/assets/white-glove.jpg"
 *   imageAlt="Outdoor dining at a luxury villa"
 *   imageSide="right"
 *   onCtaClick={() => console.log("contact clicked")}
 * />
 */

export type FeatureSectionProps = {
  title: string;
  description?: string;
  bullets?: string[];
  imageUrl: string;
  imageAlt?: string;
  imageSide?: "left" | "right"; // default: right
  className?: string;
  onCtaClick?: () => void; // CTA is static copy; handler optional
};

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  bullets = [],
  imageUrl,
  imageAlt = "",
  imageSide = "right",
  className,
  onCtaClick,
}) => {
  return (
    <section className={["w-full mt-15", className ?? ""].join(" ")}>
      <div
        className={[
          `
        flex flex-col
      ${imageSide === "right" ? "md:flex-row-reverse" : "md:flex-row"}
          justify-between gap-60 items-center
        `,
        ].join(" ")}
      >
        {/* Media */}
        <div className="">
          <div className="">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="h-full w-full object-cover   rounded-br-5xl rounded-tl-5xl"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2  ">
          <div className="rounded-3xl">
            <h2 className="text-4xl font-bold  text-slate-900">{title}</h2>
            {description ? (
              <p className="mt-3 text-xl text-[#475569]">{description}</p>
            ) : null}

            {bullets.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {bullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-slate-700">
                    <FaCheck
                      className=" text-[#009689]"
                      aria-hidden
                    />
                    <span className="text-black">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-6">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl text-lg font-bold px-5 text-[#009689] border-[#009689] hover:bg-[#009689] hover:text-white hover:border-[#009689]  shadow-lg"
                onClick={onCtaClick}
              >
                <a href="/contact">Contact Our Team</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
