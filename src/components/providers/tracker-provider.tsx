"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

const INITIAL_JOBS: JobItem[] = [
  {
    id: "1",
    jobNo: "J-1001",
    orderDate: "2026-07-28",
    promisedDate: "2026-08-04",
    completedDate: "2026-08-03",
    deliveredDate: "2026-08-04",
    overdueReason: "",
    inThisWeek: false,
    invoiceValue: 1250,
    spoilagePercent: 3.5,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "1-1",
        lineNo: 1,
        itemDescription: "Letterheads - Nova Legal, 100gsm",
        quantity: 1000,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "2",
    jobNo: "J-0995",
    orderDate: "2026-07-20",
    promisedDate: "2026-07-27",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "Material delay - board stock",
    inThisWeek: false,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "2-1",
        lineNo: 1,
        itemDescription: "Flyers - Green Grocer, A5 gloss",
        quantity: 2000,
        materialShortage: "Waiting on board stock delivery",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "3",
    jobNo: "J-1010",
    orderDate: "2026-08-03",
    promisedDate: "2026-08-10",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "3-1",
        lineNo: 1,
        itemDescription: "Business cards - Acme Realty, 16pt matte",
        quantity: 500,
        materialShortage: "",
        equipmentIssue: "",
      },
      {
        id: "3-2",
        lineNo: 2,
        itemDescription: "Trifold brochures - Acme Realty, A4 150gsm",
        quantity: 100,
        materialShortage: "",
        equipmentIssue: "",
      },
      {
        id: "3-3",
        lineNo: 3,
        itemDescription: "Booklet - Acme Realty, 12pp saddle stitch",
        quantity: 10,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "4",
    jobNo: "J-1002",
    orderDate: "2026-07-28",
    promisedDate: "2026-08-03",
    completedDate: "2026-08-02",
    deliveredDate: "2026-08-03",
    overdueReason: "",
    inThisWeek: false,
    invoiceValue: 1850,
    spoilagePercent: 5.0,
    reprintRequired: true,
    notes: "",
    items: [
      {
        id: "4-1",
        lineNo: 1,
        itemDescription: "Posters - Cine Hub, A2 matte",
        quantity: 250,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "5",
    jobNo: "J-1003",
    orderDate: "2026-07-29",
    promisedDate: "2026-08-05",
    completedDate: "2026-08-04",
    deliveredDate: "2026-08-06",
    overdueReason: "Late courier pickup",
    inThisWeek: false,
    invoiceValue: 2400,
    spoilagePercent: 1.2,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "5-1",
        lineNo: 1,
        itemDescription: "Menu cards - Spice Route, 350gsm",
        quantity: 300,
        materialShortage: "",
        equipmentIssue: "",
      },
      {
        id: "5-2",
        lineNo: 2,
        itemDescription: "Table tents - Spice Route, A5 folded",
        quantity: 60,
        materialShortage: "",
        equipmentIssue: "",
      },
      {
        id: "5-3",
        lineNo: 3,
        itemDescription: "Takeaway bags - Spice Route, kraft",
        quantity: 500,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "6",
    jobNo: "J-0998",
    orderDate: "2026-07-25",
    promisedDate: "2026-08-01",
    completedDate: "2026-07-30",
    deliveredDate: "2026-07-31",
    overdueReason: "",
    inThisWeek: false,
    invoiceValue: 980,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "6-1",
        lineNo: 1,
        itemDescription: "Invoice books - Patel Traders, 2-part NCR",
        quantity: 150,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "7",
    jobNo: "J-0999",
    orderDate: "2026-07-23",
    promisedDate: "2026-07-30",
    completedDate: "2026-07-31",
    deliveredDate: "2026-08-02",
    overdueReason: "Foil stock arrived late",
    inThisWeek: false,
    invoiceValue: 3150,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "7-1",
        lineNo: 1,
        itemDescription: "Wedding invites - Sharma, foil pressed",
        quantity: 200,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "8",
    jobNo: "J-1011",
    orderDate: "2026-08-02",
    promisedDate: "2026-08-09",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "8-1",
        lineNo: 1,
        itemDescription: "Roll-up banner - FitZone, 850mm",
        quantity: 2,
        materialShortage: "",
        equipmentIssue: "",
      },
      {
        id: "8-2",
        lineNo: 2,
        itemDescription: "Membership cards - FitZone, PVC",
        quantity: 300,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  },
  {
    id: "9",
    jobNo: "J-1012",
    orderDate: "2026-07-26",
    promisedDate: "2026-08-01",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "Awaiting artwork approval",
    inThisWeek: true,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "9-1",
        lineNo: 1,
        itemDescription: "Stickers - Bloom Cafe, die-cut vinyl",
        quantity: 1000,
        materialShortage: "",
        equipmentIssue: "Yes - cutter blade due for change",
      },
    ],
  },
  {
    id: "10",
    jobNo: "J-1013",
    orderDate: "2026-08-03",
    promisedDate: "2026-08-10",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "10-1",
        lineNo: 1,
        itemDescription: "Presentation folders - Nova Legal, 300gsm",
        quantity: 250,
        materialShortage: "Yes",
        equipmentIssue: "",
      },
    ],
  },
];

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
