"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Check, X, Sparkles, Table } from "lucide-react";
import { useJobs } from "@/context/job-context";
import { exportJobsToCSV } from "@/lib/radar-engine";

interface SheetsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SheetsExportModal({ isOpen, onClose }: SheetsExportModalProps) {
  const { filteredJobs } = useJobs();
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvContent = exportJobsToCSV(filteredJobs);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `JobRadar_Intelligence_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-xl bg-[#faf9f5] border border-[#e6dfd8] p-7 shadow-claude-lg text-[#141413]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-md hover:bg-[#efe9de] text-[#6c6a64]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#cc785c] text-white">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-medium text-[#141413] flex items-center gap-2">
              Google Sheets / CSV Intelligence Sync
              <span className="rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2 py-0.5 text-[10px] font-sans font-medium">
                1-Click Export
              </span>
            </h3>
            <p className="text-xs text-[#6c6a64] font-sans">
              Export {filteredJobs.length} scored jobs with full Radar Fit & Opportunity breakdowns.
            </p>
          </div>
        </div>

        {/* Schema Table Preview */}
        <div className="rounded-md bg-[#efe9de] p-4 mb-5 text-xs font-sans text-[#3d3d3a] border border-[#e6dfd8]">
          <div className="text-[11px] text-[#141413] font-semibold mb-3 flex items-center gap-1.5 font-sans">
            <Table className="h-4 w-4 text-[#cc785c]" />
            Exported Columns Schema (14 attributes):
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-[#6c6a64]">
            <div>• <span className="text-[#141413] font-medium">Radar Score</span> (0-100)</div>
            <div>• <span className="text-[#141413] font-medium">Fit Score</span> (5 Signals)</div>
            <div>• <span className="text-[#141413] font-medium">Opportunity Score</span></div>
            <div>• <span className="text-[#141413] font-medium">Company & Role Title</span></div>
            <div>• <span className="text-[#3d3d3a]">Location & Work Model</span></div>
            <div>• <span className="text-[#141413] font-medium">Salary Range (INR LPA)</span></div>
            <div>• <span className="text-[#3d3d3a]">Experience (0-2 YoE)</span></div>
            <div>• <span className="text-[#3d3d3a]">Required Skills List</span></div>
            <div>• <span className="text-[#3d3d3a]">Direct ATS URL</span></div>
            <div>• <span className="text-[#141413] font-medium">AI Recommendation</span></div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#e6dfd8]">
          <div className="text-[11px] text-[#8e8b82] font-sans flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c]" />
            Compatible with Google Sheets & Excel
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="btn-primary text-xs py-2 px-4"
            >
              {downloaded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  CSV Exported!
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download CSV ({filteredJobs.length} Jobs)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
