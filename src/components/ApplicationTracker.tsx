import React, { useState } from 'react';
import { TrackedApplication, ApplicationStatus } from '../types';
import {
  Columns3,
  Mail,
  Send,
  MessageCircle,
  Clock,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { FollowUpModal } from './FollowUpModal';

interface ApplicationTrackerProps {
  applications: TrackedApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteApplication: (id: string) => void;
  onViewApplicationPackage: (app: TrackedApplication) => void;
  studentName?: string;
  cvText?: string;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onViewApplicationPackage,
  studentName,
  cvText,
}) => {
  const [selectedAppForFollowUp, setSelectedAppForFollowUp] = useState<TrackedApplication | null>(null);

  const columns: { status: ApplicationStatus; label: string; count: number; desc: string }[] = [
    {
      status: 'To Email',
      label: 'To Email',
      count: applications.filter((a) => a.status === 'To Email').length,
      desc: 'Application package prepared, ready for outreach dispatch',
    },
    {
      status: 'Sent',
      label: 'Sent (Awaiting Reply)',
      count: applications.filter((a) => a.status === 'Sent').length,
      desc: 'Dispatched to faculty; follow-up window starts',
    },
    {
      status: 'Replied',
      label: 'Replied / In Dialogue',
      count: applications.filter((a) => a.status === 'Replied').length,
      desc: 'Faculty response received; interview or screening stage',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-[#E6DFD5] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Faculty Application Tracker
          </h2>
          <p className="text-xs sm:text-sm text-[#6B665E] mt-0.5">
            A structured workflow to monitor your laboratory outreach from initial drafting to response and interview.
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#1F5F4A]">
          {applications.length} Laboratories in Dossier
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => {
          const colApps = applications.filter((a) => a.status === col.status);
          return (
            <div
              key={col.status}
              className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm p-4 flex flex-col min-h-[480px]"
            >
              {/* Column Header */}
              <div className="border-b border-[#E6DFD5] pb-3 mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-sm text-[#141413]">
                      {col.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white border border-[#E6DFD5] text-[#1F5F4A] px-1.5 py-0.2 rounded-full">
                      {col.count}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B665E] mt-0.5">{col.desc}</p>
                </div>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colApps.length === 0 ? (
                  <div className="h-32 border border-dashed border-[#D4CABF] rounded-sm flex flex-col items-center justify-center text-center p-3 text-[11px] text-[#6B665E]">
                    <span>No applications in &quot;{col.label}&quot;</span>
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      className="editorial-card p-4 rounded-sm transition hover:border-[#1F5F4A] flex flex-col justify-between"
                    >
                      <div>
                        {/* Top bar with fit stamp & delete */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6DFD5]">
                          <span className="passport-stamp text-[9px] py-0.2 px-1.5">
                            SCORE {app.fitScore.toFixed(1)}/10
                          </span>
                          <span className="text-[10px] font-mono text-[#C49B45] font-semibold">
                            {app.applicationType}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-xs text-[#141413] leading-snug">
                          {app.labName}
                        </h4>
                        {app.professorName && (
                          <div className="text-[11px] text-[#6B665E] mt-0.5">
                            {app.professorName}
                          </div>
                        )}

                        <div className="mt-2.5 p-2 bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xs text-[11px]">
                          <span className="text-[9px] font-mono text-[#6B665E] block uppercase">
                            Cold Email Subject:
                          </span>
                          <span className="font-medium text-[#2C2B29] line-clamp-1">
                            {app.coldEmailSubject}
                          </span>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-[#6B665E] flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Logged: {app.dateAdded}</span>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="mt-4 pt-3 border-t border-[#E6DFD5] space-y-2">
                        {/* Status Movement */}
                        <div className="flex items-center justify-between text-xs gap-1">
                          {col.status === 'To Email' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(app.id, 'Sent')}
                              className="w-full inline-flex items-center justify-center space-x-1 py-1.5 px-2 bg-[#1F5F4A] text-white hover:bg-[#174838] text-[11px] font-bold rounded-2xs transition cursor-pointer"
                            >
                              <span>Mark as Sent</span>
                              <Send className="w-3 h-3" />
                            </button>
                          )}

                          {col.status === 'Sent' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedAppForFollowUp(app)}
                                className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 bg-[#FBF5E8] border border-[#E5DFD5] text-[#9E782F] hover:bg-[#FAF7F2] text-[10px] font-bold rounded-2xs cursor-pointer"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Draft Follow-Up</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onUpdateStatus(app.id, 'Replied')}
                                className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 bg-[#1F5F4A] text-white hover:bg-[#174838] text-[10px] font-bold rounded-2xs cursor-pointer"
                              >
                                <span>Got Reply!</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          {col.status === 'Replied' && (
                            <div className="w-full text-center text-[10px] font-mono font-bold text-[#1F5F4A] py-1 bg-[#EBF3EF] border border-[#1F5F4A]/30 rounded-2xs">
                              ✓ INTERVIEW STAGE
                            </div>
                          )}
                        </div>

                        {/* View & Delete */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={() => onViewApplicationPackage(app)}
                            className="text-[#1F5F4A] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteApplication(app.id)}
                            className="text-[#6B665E] hover:text-red-700 cursor-pointer"
                            title="Remove from Tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Follow Up Modal */}
      {selectedAppForFollowUp && (
        <FollowUpModal
          isOpen={true}
          onClose={() => setSelectedAppForFollowUp(null)}
          professorNameOrLab={selectedAppForFollowUp.labName}
          initialSubject={selectedAppForFollowUp.coldEmailSubject}
          studentName={studentName}
          cvText={cvText}
        />
      )}
    </div>
  );
};
