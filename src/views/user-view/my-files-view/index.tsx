"use client";

import type { ComponentType } from "react";
import { CategoryCards } from "./category-cards";
import { MyFilesHeader } from "./my-files-header";
import { MyFilesSection } from "./my-files-section";
import { PartialUploads } from "./partial-uploads";
import { RecentFolders } from "./recent-folders";
import { RecentFilesTable } from "./recent-files-table";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections: Array<{
  id: string;
  component: ComponentType;
  withSeparator?: boolean;
}> = [
  { id: "categories", component: CategoryCards, withSeparator: false },
  { id: "uploads", component: PartialUploads },
  { id: "pinned-folders", component: RecentFolders },
  { id: "recent-files", component: RecentFilesTable },
];

export default function MyFilesView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-10 max-w-400 mx-auto pb-20">
          <MyFilesHeader />
          {sections.map(({ id, component: Section, withSeparator }) => (
            <MyFilesSection key={id} withSeparator={withSeparator}>
              <Section />
            </MyFilesSection>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
