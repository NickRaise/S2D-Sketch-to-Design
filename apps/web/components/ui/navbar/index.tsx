"use client";
import { CircleQuestionMark, Hash, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "../button";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

interface ITabs {
  label: string;
  path: string;
  href: string;
  icon: React.ReactNode;
}

const Navbar = () => {
  const params = useSearchParams();
  const projectId = params.get("projectId");

  const pathname = usePathname();
  const hasCanvas = pathname.includes("canvas");
  const hasStyleGuide = pathname.includes("style-guide");

  // TODO: fetch user data using the global state storage
  let user: any;

  const tabs: ITabs[] = [
    {
      label: "Canvas",
      path: "canvas",
      href: `/dashboard/${user?.name}/canvas?projectId=${projectId}`,
      icon: <Hash className="w-4 h-4" />,
    },
    {
      label: "Style Guide",
      path: "style-guide",
      href: `/dashboard/${user?.name}/style-guide?projectId=${projectId}`,
      icon: <LayoutTemplate className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <div className="grid grid-col-2 lg:grid-cols-3 p-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-full border-3 border-white bg-black flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-white"></div>
          </Link>

          {/* TEMP: Commented out logic */}
          {/* {!hasCanvas ||
            (!hasStyleGuide && ( */}
          <div className="lg:inline-block hidden rounded-full text-primary/60 border border-white/12 backdrop-blur-xl bg-white/8 px-4 py-2 text-sm saturate-150">
            {/* fetch the project name using the useProject hook */}
            {/* Project / {project?.name} */}
            Project / Test project
          </div>
          {/* ))} */}
        </div>

        <div className="lg:flex hidden items-center justify-center gap-2">
          <div className="flex items-center gap-2 backdrop-blur-xl bg-white/8 border border/white/12 rounded-full p-2 saturate-150">
            {tabs.map((tab) => {
              const isActive = pathname.includes(tab.path);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                    isActive
                      ? "bg-white/12 text-white border border-white/16 backdrop-blur-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/6 border border-transparent",
                  ].join(" ")}
                >
                  <span
                    className={
                      isActive
                        ? "opacity-100"
                        : "opacity-70 group-hover:opacity-90"
                    }
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className=" flex items-center gap-4 justify-end">
        <span className="text-sm text-white/50"> Todo: credits</span>
        <Button
          variant="secondary"
          className="rounded-full h-12 w-12 flex-items-center justify-center backdrop-blur-xl bg-white/8 border border-white/12 saturate-120 hover:bg-white/12"
        >
          <CircleQuestionMark className="size-5 text-white" />
        </Button>
        <Avatar className="size-5 ml-2">
          <AvatarImage src={user?.image} />
          <AvatarFallback>
            {user?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default Navbar;
