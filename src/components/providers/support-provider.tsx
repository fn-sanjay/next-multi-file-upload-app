"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SupportQuery {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  amount?: string;
  type: "storage" | "query";
  status: "pending" | "replied";
  reply?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

interface SupportContextType {
  queries: SupportQuery[];
  notifications: Notification[];
  addQuery: (query: Omit<SupportQuery, "id" | "status" | "createdAt">) => void;
  replyToQuery: (queryId: string, reply: string) => void;
  markNotificationRead: (id: string) => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider = ({ children }: { children: ReactNode }) => {
  const [queries, setQueries] = useState<SupportQuery[]>([
    {
      id: "1",
      userId: "user-1",
      userName: "Alex Rivera",
      subject: "Storage Increase",
      message: "I need more space for my 4K video projects.",
      amount: "100GB",
      type: "storage",
      status: "pending",
      createdAt: new Date(),
    },
    {
      id: "2",
      userId: "user-2",
      userName: "Sarah Chen",
      subject: "Missing Files",
      message: "I uploaded some files but can't see them in my 'Work' folder.",
      type: "query",
      status: "pending",
      createdAt: new Date(),
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome ",
      description: "Start managing your files with multi-threaded sync.",
      time: "2 hours ago",
      read: false,
      type: "info",
    },
  ]);

  const addQuery = (
    query: Omit<SupportQuery, "id" | "status" | "createdAt" | "type">,
  ) => {
    const newQuery: SupportQuery = {
      ...query,
      id: Math.random().toString(36).substr(2, 9),
      type: query.amount ? "storage" : "query",
      status: "pending",
      createdAt: new Date(),
    };
    setQueries((prev) => [newQuery, ...prev]);
  };

  const replyToQuery = (queryId: string, reply: string) => {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId ? { ...q, status: "replied", reply } : q,
      ),
    );

    const query = queries.find((q) => q.id === queryId);
    if (query) {
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title: "Admin Replied to Your Request",
        description: `Subject: ${query.subject}. Reply: ${reply.substring(0, 50)}...`,
        time: "Just now",
        read: false,
        type: "success",
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <SupportContext.Provider
      value={{
        queries,
        notifications,
        addQuery,
        replyToQuery,
        markNotificationRead,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error("useSupport must be used within a SupportProvider");
  }
  return context;
};
