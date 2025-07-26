import { cn } from "@/lib/utils";
import {
  IconCalendarEvent,
  IconUsers,
  IconMessageCircle,
  IconStar,
  IconSearch,
  IconCamera,
  IconShield,
  IconHeart,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Event Management",
      description:
        "Create, manage, and discover events with detailed requirements and specifications for creative professionals.",
      icon: <IconCalendarEvent />,
    },
    {
      title: "Professional Discovery",
      description:
        "Find the perfect creative professionals using advanced filters for skills, location, availability, and ratings.",
      icon: <IconSearch />,
    },
    {
      title: "Smart Matching",
      description:
        "Our intelligent algorithm connects event planners with the most suitable creative professionals for their projects.",
      icon: <IconUsers />,
    },
    {
      title: "Real-time Messaging",
      description: "Communicate instantly with professionals and planners through our integrated chat system.",
      icon: <IconMessageCircle />,
    },
    {
      title: "Portfolio Showcase",
      description: "Creative professionals can display their best work and build their reputation through stunning portfolios.",
      icon: <IconCamera />,
    },
    {
      title: "Reviews & Ratings",
      description:
        "Build trust through authentic reviews and ratings from completed events and collaborations.",
      icon: <IconStar />,
    },
    {
      title: "Secure Booking",
      description:
        "Safe and secure booking system with confirmation notifications and status tracking.",
      icon: <IconShield />,
    },
    {
      title: "Community Building",
      description: "Join a thriving community of event professionals and expand your network in the industry.",
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-border",
        (index === 0 || index === 4) && "lg:border-l dark:border-border",
        index < 4 && "lg:border-b dark:border-border"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted dark:from-black to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted dark:from-black to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted dark:bg-muted group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
