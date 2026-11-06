import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function MHeader({ title, back, right }: { title: string; back?: string; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-background/95 px-4 backdrop-blur">
      {back && <Link to={back} className="-ml-2 grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="Quay lại"><ChevronLeft className="size-5" /></Link>}
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {right}
    </div>
  );
}
