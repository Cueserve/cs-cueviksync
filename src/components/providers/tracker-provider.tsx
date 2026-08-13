"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "manager" | "operator" | "rep";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Owner/Admin",
  manager: "Sales Manager",
  operator: "Office Administrator",
  rep: "Sales Rep",
};

export interface JobItem {
  id: string;
  jobNo: string;
  itemDescription: string;
  quantity: number;
  orderDate: string;
  promisedDate: string;
  completedDate: string;
  deliveredDate: string;
  overdueReason: string;
  inThisWeek: boolean;
  materialShortage: string;
  equipmentIssue: string;
  lineNo: number;
  invoiceValue: number;
  spoilagePercent: number;
  reprintRequired: boolean;
  notes?: string;
}

interface TrackerContextType {
  jobs: JobItem[];
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  updateJobItem: (id: string, updates: Partial<JobItem>) => void;
  addJobItem: (item: Omit<JobItem, "id" | "lineNo">) => void;
  deleteJobItem: (id: string) => void;
  resetToInitial: () => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const INITIAL_JOBS: JobItem[] = [
  {
    id: "1",
    jobNo: "J-1001",
    itemDescription: "Letterheads - Nova Legal, 100gsm",
    quantity: 1000,
    orderDate: "2026-07-28",
    promisedDate: "2026-08-04",
    completedDate: "2026-08-03",
    deliveredDate: "2026-08-04",
    overdueReason: "",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 1250,
    spoilagePercent: 3.5,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "2",
    jobNo: "J-0995",
    itemDescription: "Flyers - Green Grocer, A5 gloss",
    quantity: 2000,
    orderDate: "2026-07-20",
    promisedDate: "2026-07-27",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "Material delay - board stock",
    inThisWeek: false,
    materialShortage: "Waiting on board stock delivery",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "3",
    jobNo: "J-1010",
    itemDescription: "Business cards - Acme Realty, 16pt matte",
    quantity: 500,
    orderDate: "2026-08-03",
    promisedDate: "2026-08-10",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "4",
    jobNo: "J-1010",
    itemDescription: "Trifold brochures - Acme Realty, A4 150gsm",
    quantity: 100,
    orderDate: "2026-08-03",
    promisedDate: "2026-08-10",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 2,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "5",
    jobNo: "J-1010",
    itemDescription: "Booklet - Acme Realty, 12pp saddle stitch",
    quantity: 10,
    orderDate: "2026-08-03",
    promisedDate: "2026-08-10",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 3,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "6",
    jobNo: "J-1002",
    itemDescription: "Posters - Cine Hub, A2 matte",
    quantity: 250,
    orderDate: "2026-07-28",
    promisedDate: "2026-08-03",
    completedDate: "2026-08-02",
    deliveredDate: "2026-08-03",
    overdueReason: "",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 1850,
    spoilagePercent: 5.0,
    reprintRequired: true,
    notes: "",
  },
  {
    id: "7",
    jobNo: "J-1003",
    itemDescription: "Menu cards - Spice Route, 350gsm",
    quantity: 300,
    orderDate: "2026-07-29",
    promisedDate: "2026-08-05",
    completedDate: "2026-08-04",
    deliveredDate: "2026-08-06",
    overdueReason: "Late courier pickup",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 2400,
    spoilagePercent: 1.2,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "8",
    jobNo: "J-1003",
    itemDescription: "Table tents - Spice Route, A5 folded",
    quantity: 60,
    orderDate: "2026-07-29",
    promisedDate: "2026-08-05",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 2,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "9",
    jobNo: "J-1003",
    itemDescription: "Takeaway bags - Spice Route, kraft",
    quantity: 500,
    orderDate: "2026-07-29",
    promisedDate: "2026-08-05",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 3,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "10",
    jobNo: "J-0998",
    itemDescription: "Invoice books - Patel Traders, 2-part NCR",
    quantity: 150,
    orderDate: "2026-07-25",
    promisedDate: "2026-08-01",
    completedDate: "2026-07-30",
    deliveredDate: "2026-07-31",
    overdueReason: "",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 980,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "11",
    jobNo: "J-0999",
    itemDescription: "Wedding invites - Sharma, foil pressed",
    quantity: 200,
    orderDate: "2026-07-23",
    promisedDate: "2026-07-30",
    completedDate: "2026-07-31",
    deliveredDate: "2026-08-02",
    overdueReason: "Foil stock arrived late",
    inThisWeek: false,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 3150,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "12",
    jobNo: "J-1011",
    itemDescription: "Roll-up banner - FitZone, 850mm",
    quantity: 2,
    orderDate: "2026-08-02",
    promisedDate: "2026-08-09",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "13",
    jobNo: "J-1011",
    itemDescription: "Membership cards - FitZone, PVC",
    quantity: 300,
    orderDate: "2026-08-02",
    promisedDate: "2026-08-09",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    materialShortage: "",
    equipmentIssue: "",
    lineNo: 2,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "14",
    jobNo: "J-1012",
    itemDescription: "Stickers - Bloom Cafe, die-cut vinyl",
    quantity: 1000,
    orderDate: "2026-07-26",
    promisedDate: "2026-08-01",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "Awaiting artwork approval",
    inThisWeek: true,
    materialShortage: "",
    equipmentIssue: "Yes - cutter blade due for change",
    lineNo: 1,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
  {
    id: "15",
    jobNo: "J-1013",
    itemDescription: "Presentation folders - Nova Legal, 300gsm",
    quantity: 250,
    orderDate: "2026-08-03",
    promisedDate: "2026-08-10",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: true,
    materialShortage: "Yes",
    equipmentIssue: "",
    lineNo: 1,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
  },
];

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  useEffect(() => {
    // Only load from localStorage after client-side mount to prevent hydration mismatch
    const saved = localStorage.getItem("cuevik_tracker_jobs_v3");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJobs(JSON.parse(saved));
      } catch {
        // Fallback to INITIAL_JOBS if parsing fails
      }
    } else {
      localStorage.setItem(
        "cuevik_tracker_jobs_v3",
        JSON.stringify(INITIAL_JOBS),
      );
    }

    const savedRole = localStorage.getItem("cuevik_tracker_role");
    if (savedRole) {
      setSelectedRole(savedRole as UserRole);
    }
  }, []);

  const updateJobItem = (id: string, updates: Partial<JobItem>) => {
    setJobs((prev) => {
      const next = prev.map((job) =>
        job.id === id ? { ...job, ...updates } : job,
      );
      localStorage.setItem("cuevik_tracker_jobs_v3", JSON.stringify(next));
      return next;
    });
  };

  const addJobItem = (item: Omit<JobItem, "id" | "lineNo">) => {
    setJobs((prev) => {
      const sameJobItems = prev.filter((j) => j.jobNo === item.jobNo);
      const lineNo = sameJobItems.length + 1;
      const newId = String(
        prev.length > 0 ? Math.max(...prev.map((j) => parseInt(j.id))) + 1 : 1,
      );
      const newItem = { ...item, id: newId, lineNo };
      const next = [...prev, newItem];
      localStorage.setItem("cuevik_tracker_jobs_v3", JSON.stringify(next));
      return next;
    });
  };

  const deleteJobItem = (id: string) => {
    setJobs((prev) => {
      const itemToDelete = prev.find((j) => j.id === id);
      if (!itemToDelete) return prev;

      let next: JobItem[] = [];
      if (itemToDelete.lineNo === 1) {
        // If parent, delete parent AND all sub-jobs (matching jobNo)
        next = prev.filter((job) => job.jobNo !== itemToDelete.jobNo);
      } else {
        // If sub-job, delete just this item
        const filtered = prev.filter((job) => job.id !== id);
        // Re-index remaining items under this jobNo
        let lineCounter = 1;
        next = filtered.map((job) => {
          if (job.jobNo === itemToDelete.jobNo) {
            const updated = { ...job, lineNo: lineCounter };
            lineCounter++;
            return updated;
          }
          return job;
        });
      }

      localStorage.setItem("cuevik_tracker_jobs_v3", JSON.stringify(next));
      return next;
    });
  };

  const resetToInitial = () => {
    setJobs(INITIAL_JOBS);
    localStorage.setItem(
      "cuevik_tracker_jobs_v3",
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
        updateJobItem,
        addJobItem,
        deleteJobItem,
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
