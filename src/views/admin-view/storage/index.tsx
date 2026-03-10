"use client";

import { StorageContent } from "./storage-content";

export default function AdminStorageView() {
  return (
    <div className="flex-1 space-y-8 p-8 bg-black">
      <StorageContent />
    </div>
  );
}
