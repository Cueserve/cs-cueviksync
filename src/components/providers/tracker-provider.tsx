"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_JOBS } from "@/lib/mock-data";

export type UserRole = "admin" | "manager" | "operator" | "rep";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Owner/Admin",
  manager: "Sales Manager",
  operator: "Office Administrator",
  rep: "Sales Rep",
};

export interface JobLineItem {
  id: string;
  lineNo: number;
  itemDescription: string;
  quantity: number;
  materialShortage: string;
  equipmentIssue: string;
}

export interface JobItem {
  id: string; // The parent job ID
  jobNo: string;
  orderDate: string;
  promisedDate: string;
  completedDate: string;
  deliveredDate: string;
  overdueReason: string;
  inThisWeek: boolean;
  invoiceValue: number;
  spoilagePercent: number;
  reprintRequired: boolean;
  notes?: string;
  items: JobLineItem[];
}

interface TrackerContextType {
  jobs: JobItem[];
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  updateJob: (id: string, updates: Partial<JobItem>) => void;
  addJob: (job: Omit<JobItem, "id">) => void;
  deleteJob: (id: string) => void;
  resetToInitial: () => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  useEffect(() => {
    const saved = localStorage.getItem("cuevik_tracker_jobs_v5");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJobs(JSON.parse(saved));
      } catch {
        // Fallback to INITIAL_JOBS if parsing fails
      }
    } else {
      localStorage.setItem(
        "cuevik_tracker_jobs_v5",
        JSON.stringify(INITIAL_JOBS),
      );
    }

    const savedRole = localStorage.getItem("cuevik_tracker_role");
    if (savedRole) {
      setSelectedRole(savedRole as UserRole);
    }
  }, []);

  const updateJob = (id: string, updates: Partial<JobItem>) => {
    setJobs((prev) => {
      const next = prev.map((job) =>
        job.id === id ? { ...job, ...updates } : job,
      );
      localStorage.setItem("cuevik_tracker_jobs_v5", JSON.stringify(next));
      return next;
    });
  };

  const addJob = (job: Omit<JobItem, "id">) => {
    setJobs((prev) => {
      const newId = String(
        prev.length > 0 ? Math.max(...prev.map((j) => parseInt(j.id))) + 1 : 1,
      );
      const newJob = { ...job, id: newId };
      const next = [...prev, newJob];
      localStorage.setItem("cuevik_tracker_jobs_v5", JSON.stringify(next));
      return next;
    });
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => {
      const next = prev.filter((job) => job.id !== id);
      localStorage.setItem("cuevik_tracker_jobs_v5", JSON.stringify(next));
      return next;
    });
  };

  const resetToInitial = () => {
    setJobs(INITIAL_JOBS);
    localStorage.setItem(
      "cuevik_tracker_jobs_v5",
      JSON.stringify(INITIAL_JOBS),
    );
  };

  return (
    <TrackerContext.Provider
      value={{
        jobs,
        selectedRole,
        setSelectedRole: (role) => {
          setSelectedRole(role);
          localStorage.setItem("cuevik_tracker_role", role);
        },
        updateJob,
        addJob,
        deleteJob,
        resetToInitial,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
