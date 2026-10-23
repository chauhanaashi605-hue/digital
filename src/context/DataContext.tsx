import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Beneficiary,
  HousingProject,
  InspectionRecord,
  PanchayatProject,
  VerificationCase,
  InstalmentRecord,
  AuditLog,
  NotificationItem,
  Village,
  ConstructionStage,
  InspectionStatus,
  VerificationStatus,
} from '../types';
import {
  INITIAL_BENEFICIARIES,
  INITIAL_HOUSING_PROJECTS,
  INITIAL_INSPECTIONS,
  INITIAL_PANCHAYAT_PROJECTS,
  INITIAL_VERIFICATION_CASES,
  INITIAL_INSTALMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_VILLAGES,
} from '../services/mockData';
import { runBeneficiaryVerification } from '../services/duplicateEngine';
import { useAuth } from './AuthContext';

interface DataContextType {
  villages: Village[];
  beneficiaries: Beneficiary[];
  housingProjects: HousingProject[];
  inspections: InspectionRecord[];
  panchayatProjects: PanchayatProject[];
  verificationCases: VerificationCase[];
  instalments: InstalmentRecord[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;

  // Actions
  addBeneficiary: (data: Omit<Beneficiary, 'id' | 'beneficiaryId' | 'registrationDate' | 'currentStage' | 'verificationStatus' | 'currentInstalmentStage' | 'disbursedAmount'>) => { beneficiary: Beneficiary; flags: VerificationCase[] };
  submitInspection: (inspection: Omit<InspectionRecord, 'id' | 'status' | 'syncStatus'>, isOnline: boolean) => InspectionRecord;
  handleInspectionApproval: (inspectionId: string, decision: 'APPROVED' | 'REJECTED' | 'REINSPECTION_REQUESTED', remarks: string) => void;
  updateVerificationCase: (caseId: string, status: VerificationStatus, remarks: string) => void;
  triggerInstalmentProcessing: (instalmentId: string) => void;
  addPanchayatProject: (project: Omit<PanchayatProject, 'id' | 'projectId' | 'inspectionHistory' | 'spentBudget'>) => void;
  updatePanchayatProgress: (projectId: string, progress: number, remarks: string, photoUrl?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  syncExternalInspection: (inspection: InspectionRecord) => void;
  exportDataAsCsv: (type: 'beneficiaries' | 'inspections' | 'panchayat' | 'instalments') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [villages] = useState<Village[]>(() => {
    const saved = localStorage.getItem('gt_villages');
    return saved ? JSON.parse(saved) : INITIAL_VILLAGES;
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('gt_beneficiaries');
    return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
  });

  const [housingProjects, setHousingProjects] = useState<HousingProject[]>(() => {
    const saved = localStorage.getItem('gt_housing_projects');
    return saved ? JSON.parse(saved) : INITIAL_HOUSING_PROJECTS;
  });

  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('gt_inspections');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [panchayatProjects, setPanchayatProjects] = useState<PanchayatProject[]>(() => {
    const saved = localStorage.getItem('gt_panchayat_projects');
    return saved ? JSON.parse(saved) : INITIAL_PANCHAYAT_PROJECTS;
  });

  const [verificationCases, setVerificationCases] = useState<VerificationCase[]>(() => {
    const saved = localStorage.getItem('gt_verification_cases');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_CASES;
  });

  const [instalments, setInstalments] = useState<InstalmentRecord[]>(() => {
    const saved = localStorage.getItem('gt_instalments');
    return saved ? JSON.parse(saved) : INITIAL_INSTALMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('gt_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('gt_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Save changes to localStorage for continuous tab persistence
  useEffect(() => {
    localStorage.setItem('gt_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('gt_housing_projects', JSON.stringify(housingProjects));
  }, [housingProjects]);

  useEffect(() => {
    localStorage.setItem('gt_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('gt_panchayat_projects', JSON.stringify(panchayatProjects));
  }, [panchayatProjects]);

  useEffect(() => {
    localStorage.setItem('gt_verification_cases', JSON.stringify(verificationCases));
  }, [verificationCases]);

  useEffect(() => {
    localStorage.setItem('gt_instalments', JSON.stringify(instalments));
  }, [instalments]);

  useEffect(() => {
    localStorage.setItem('gt_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gt_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Log an audit trail entry
  const logAudit = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys-auto',
      userName: currentUser?.name || 'System Daemon',
      userRole: currentUser?.role || 'ADMIN',
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Add Beneficiary with real-time duplicate check
  const addBeneficiary = (data: Omit<Beneficiary, 'id' | 'beneficiaryId' | 'registrationDate' | 'currentStage' | 'verificationStatus' | 'currentInstalmentStage' | 'disbursedAmount'>) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const vPrefix = data.villageName.substring(0, 3).toUpperCase();
    const newId = `ben-${Date.now()}`;
    const benIdCode = `GT-2026-${vPrefix}-${randomSuffix}`;

    const newBen: Beneficiary = {
      ...data,
      id: newId,
      beneficiaryId: benIdCode,
      registrationDate: new Date().toISOString().split('T')[0],
      currentStage: 'FOUNDATION',
      verificationStatus: 'VERIFIED',
      currentInstalmentStage: 1,
      disbursedAmount: 0,
      sanctionAmount: data.sanctionAmount || 130000,
    };

    // Run duplicate engine
    const detectedFlags = runBeneficiaryVerification(newBen, beneficiaries);
    if (detectedFlags.length > 0) {
      newBen.verificationStatus = detectedFlags[0].reviewStatus;
      setVerificationCases((prev) => [...detectedFlags, ...prev]);
      addNotification({
        title: 'New Beneficiary Flagged for Review',
        message: `${newBen.name} in ${newBen.villageName} flagged for ${detectedFlags[0].flagReason}.`,
        type: 'VERIFICATION',
        actionUrl: 'verification',
      });
    }

    setBeneficiaries((prev) => [newBen, ...prev]);

    // Create companion Housing Project
    const newHousingProject: HousingProject = {
      id: `hp-${Date.now()}`,
      beneficiaryId: newId,
      beneficiaryName: newBen.name,
      villageName: newBen.villageName,
      district: newBen.district,
      sanctionDate: newBen.registrationDate,
      targetCompletionDate: '2026-10-31',
      currentStage: 'FOUNDATION',
      overallStatus: 'NEEDS_INSPECTION',
      progressPercentage: 5,
      lastUpdated: new Date().toISOString().split('T')[0],
      stages: {
        FOUNDATION: { stage: 'FOUNDATION', status: 'PENDING' },
        PLINTH: { stage: 'PLINTH', status: 'PENDING' },
        LINTEL: { stage: 'LINTEL', status: 'PENDING' },
        COMPLETION: { stage: 'COMPLETION', status: 'PENDING' },
      },
    };
    setHousingProjects((prev) => [newHousingProject, ...prev]);

    // Create 4 initial instalment placeholders
    const amounts = [40000, 40000, 30000, 20000];
    const stages: ConstructionStage[] = ['FOUNDATION', 'PLINTH', 'LINTEL', 'COMPLETION'];
    const newInstalments: InstalmentRecord[] = stages.map((stg, idx) => ({
      id: `inst-${newId}-${idx + 1}`,
      beneficiaryId: newId,
      beneficiaryName: newBen.name,
      villageName: newBen.villageName,
      instalmentNumber: (idx + 1) as 1 | 2 | 3 | 4,
      amount: amounts[idx],
      stageTrigger: stg,
      status: idx === 0 ? 'AWAITING_INSPECTION' : 'NOT_ELIGIBLE',
      requiredApprovalStatus: 'PENDING',
      verificationStatus: newBen.verificationStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      remarks: idx === 0 ? 'Pending initial foundation geo-inspection.' : 'Awaiting preceding milestone clearance.',
    }));
    setInstalments((prev) => [...newInstalments, ...prev]);

    logAudit(
      'BENEFICIARY_REGISTERED',
      'BENEFICIARY',
      newId,
      `Registered beneficiary ${newBen.name} (${benIdCode}) in ${newBen.villageName} with sanction ₹${newBen.sanctionAmount}.`
    );

    return { beneficiary: newBen, flags: detectedFlags };
  };

  // Submit field inspection
  const submitInspection = (
    inspection: Omit<InspectionRecord, 'id' | 'status' | 'syncStatus'>,
    isOnline: boolean
  ): InspectionRecord => {
    const newId = `insp-${Date.now()}`;
    const record: InspectionRecord = {
      ...inspection,
      id: newId,
      status: 'SUBMITTED',
      syncStatus: isOnline ? 'SYNCED' : 'SAVED_LOCALLY',
    };

    if (isOnline) {
      syncExternalInspection(record);
    }

    return record;
  };

  // Helper to commit an inspection into projects, ledger, and notifications
  const syncExternalInspection = (record: InspectionRecord) => {
    setInspections((prev) => {
      const exists = prev.find((i) => i.id === record.id);
      if (exists) {
        return prev.map((i) => (i.id === record.id ? record : i));
      }
      return [record, ...prev];
    });

    if (record.isPanchayatProject && record.projectId) {
      // Update Panchayat project history
      setPanchayatProjects((prev) =>
        prev.map((p) => {
          if (p.id === record.projectId) {
            return {
              ...p,
              photoUrl: record.photoUrl || p.photoUrl,
              inspectionHistory: [
                {
                  id: `pi-${Date.now()}`,
                  date: record.timestamp.split('T')[0],
                  inspectorName: record.inspectorName,
                  remarks: record.remarks,
                  photoUrl: record.photoUrl,
                  progressPercentage: p.progressPercentage,
                },
                ...p.inspectionHistory,
              ],
            };
          }
          return p;
        })
      );
    } else {
      // Update Housing Project
      setHousingProjects((prev) =>
        prev.map((hp) => {
          if (hp.beneficiaryId === record.beneficiaryId) {
            const currentStageObj = hp.stages[record.stage] || { stage: record.stage, status: 'PENDING' };
            const updatedStage = {
              ...currentStageObj,
              status: 'SUBMITTED' as InspectionStatus,
              inspectionDate: record.timestamp.split('T')[0],
              inspectorId: record.inspectorId,
              inspectorName: record.inspectorName,
              photoUrl: record.photoUrl,
              latitude: record.latitude || undefined,
              longitude: record.longitude || undefined,
              gpsAccuracy: record.gpsAccuracy || undefined,
              timestamp: record.timestamp,
              remarks: record.remarks,
            };

            return {
              ...hp,
              currentStage: record.stage,
              stages: {
                ...hp.stages,
                [record.stage]: updatedStage,
              },
              overallStatus: 'NEEDS_INSPECTION',
              lastUpdated: record.timestamp.split('T')[0],
            };
          }
          return hp;
        })
      );
    }

    addNotification({
      title: `New ${record.stage} Inspection Submitted`,
      message: `${record.inspectorName} submitted evidence for ${record.beneficiaryName} (${record.villageName}).`,
      type: 'INSPECTION',
      actionUrl: 'approvals',
    });

    logAudit(
      'INSPECTION_SUBMITTED',
      'INSPECTION',
      record.id,
      `Submitted ${record.stage} stage inspection for ${record.beneficiaryName} with GPS [${record.latitude}, ${record.longitude}].`
    );
  };

  // Stage approval/rejection decision by District Officer or Admin
  const handleInspectionApproval = (
    inspectionId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REINSPECTION_REQUESTED',
    remarks: string
  ) => {
    const inspection = inspections.find((i) => i.id === inspectionId);
    if (!inspection) return;

    const reviewerName = currentUser?.name || 'Reviewing Officer';
    const reviewedAt = new Date().toISOString();

    // 1. Update inspection
    setInspections((prev) =>
      prev.map((i) =>
        i.id === inspectionId
          ? {
              ...i,
              status: decision,
              reviewRemarks: remarks,
              reviewedBy: reviewerName,
              reviewedAt,
            }
          : i
      )
    );

    // 2. Update Housing Project
    const nextStages: Record<ConstructionStage, ConstructionStage | null> = {
      FOUNDATION: 'PLINTH',
      PLINTH: 'LINTEL',
      LINTEL: 'COMPLETION',
      COMPLETION: null,
    };

    const stageProgress: Record<ConstructionStage, number> = {
      FOUNDATION: 25,
      PLINTH: 50,
      LINTEL: 75,
      COMPLETION: 100,
    };

    setHousingProjects((prev) =>
      prev.map((hp) => {
        if (hp.beneficiaryId === inspection.beneficiaryId) {
          const updatedStageEvidence = {
            ...hp.stages[inspection.stage],
            status: decision,
            reviewRemarks: remarks,
            reviewedBy: reviewerName,
            reviewedAt,
          };

          const isApproved = decision === 'APPROVED';
          const nextStage = isApproved ? nextStages[inspection.stage] : hp.currentStage;
          const newProgress = isApproved ? stageProgress[inspection.stage] : hp.progressPercentage;

          return {
            ...hp,
            currentStage: nextStage || inspection.stage,
            stages: {
              ...hp.stages,
              [inspection.stage]: updatedStageEvidence,
            },
            progressPercentage: newProgress,
            overallStatus: decision === 'APPROVED' ? (newProgress === 100 ? 'COMPLETED' : 'ON_TRACK') : 'NEEDS_INSPECTION',
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return hp;
      })
    );

    // 3. Update Beneficiary current stage
    if (decision === 'APPROVED') {
      const nextStage = nextStages[inspection.stage];
      if (nextStage) {
        setBeneficiaries((prev) =>
          prev.map((b) => (b.id === inspection.beneficiaryId ? { ...b, currentStage: nextStage } : b))
        );
      }
    }

    // 4. Update Instalment record
    setInstalments((prev) =>
      prev.map((inst) => {
        if (inst.beneficiaryId === inspection.beneficiaryId && inst.stageTrigger === inspection.stage) {
          if (decision === 'APPROVED') {
            return {
              ...inst,
              status: 'READY_FOR_PROCESSING',
              requiredApprovalStatus: 'APPROVED',
              lastUpdated: new Date().toISOString().split('T')[0],
              remarks: `Stage verified & approved by ${reviewerName}. Cleared for DBT release.`,
            };
          } else {
            return {
              ...inst,
              status: 'ON_HOLD',
              requiredApprovalStatus: decision,
              lastUpdated: new Date().toISOString().split('T')[0],
              remarks: `Hold: ${remarks}`,
            };
          }
        }
        return inst;
      })
    );

    addNotification({
      title: `Stage ${inspection.stage}: ${decision.replace('_', ' ')}`,
      message: `${inspection.beneficiaryName}'s ${inspection.stage} stage inspection marked ${decision} by ${reviewerName}.`,
      type: decision === 'APPROVED' ? 'APPROVAL' : 'ALERT',
      actionUrl: 'approvals',
    });

    logAudit(
      `INSPECTION_${decision}`,
      'APPROVAL',
      inspectionId,
      `${decision} ${inspection.stage} stage for ${inspection.beneficiaryName}. Reason/Notes: ${remarks}`
    );
  };

  // Update verification case resolution
  const updateVerificationCase = (caseId: string, status: VerificationStatus, remarks: string) => {
    const reviewerName = currentUser?.name || 'Authorized Officer';
    setVerificationCases((prev) =>
      prev.map((vc) => {
        if (vc.id === caseId) {
          return {
            ...vc,
            reviewStatus: status,
            reviewRemarks: remarks,
            reviewedBy: reviewerName,
            resolvedDate: new Date().toISOString(),
          };
        }
        return vc;
      })
    );

    // Update the corresponding beneficiary status
    const targetCase = verificationCases.find((c) => c.id === caseId);
    if (targetCase) {
      setBeneficiaries((prev) =>
        prev.map((b) => (b.id === targetCase.beneficiaryId ? { ...b, verificationStatus: status } : b))
      );

      // Also unlock instalment hold if verified
      if (status === 'VERIFIED' || status === 'FLAG_RESOLVED') {
        setInstalments((prev) =>
          prev.map((inst) =>
            inst.beneficiaryId === targetCase.beneficiaryId
              ? {
                  ...inst,
                  verificationStatus: status,
                  status:
                    inst.status === 'AWAITING_VERIFICATION' || inst.status === 'ON_HOLD'
                      ? 'READY_FOR_PROCESSING'
                      : inst.status,
                }
              : inst
          )
        );
      }
    }

    logAudit(
      'VERIFICATION_UPDATED',
      'VERIFICATION',
      caseId,
      `Updated case ${caseId} to ${status}. Notes: ${remarks}`
    );
  };

  // Trigger instalment payment processing
  const triggerInstalmentProcessing = (instalmentId: string) => {
    const inst = instalments.find((i) => i.id === instalmentId);
    if (!inst) return;

    const ref = `PFMS-UP-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    setInstalments((prev) =>
      prev.map((item) =>
        item.id === instalmentId
          ? {
              ...item,
              status: 'PROCESSING_COMPLETED',
              transactionReference: ref,
              lastUpdated: new Date().toISOString().split('T')[0],
              remarks: `Simulated DBT disbursement credited via PFMS gateway to account. Ref: ${ref}`,
            }
          : item
      )
    );

    // Update disbursed amount on beneficiary
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id === inst.beneficiaryId) {
          const nextDisbursed = (b.disbursedAmount || 0) + inst.amount;
          return {
            ...b,
            disbursedAmount: nextDisbursed,
            currentInstalmentStage: Math.min(4, b.currentInstalmentStage + 1),
          };
        }
        return b;
      })
    );

    addNotification({
      title: `Instalment Disbursed: ₹${inst.amount.toLocaleString('en-IN')}`,
      message: `Direct Benefit Transfer of ₹${inst.amount.toLocaleString('en-IN')} released to ${inst.beneficiaryName} (${ref}).`,
      type: 'APPROVAL',
      actionUrl: 'instalments',
    });

    logAudit(
      'INSTALMENT_DISBURSED',
      'INSTALMENT',
      instalmentId,
      `Simulated PFMS release of ₹${inst.amount} for ${inst.beneficiaryName}. Reference: ${ref}`
    );
  };

  // Add Panchayat project
  const addPanchayatProject = (
    project: Omit<PanchayatProject, 'id' | 'projectId' | 'inspectionHistory' | 'spentBudget'>
  ) => {
    const id = `p-${Date.now()}`;
    const pCode = `GPW-${new Date().getFullYear()}-${project.category.substring(0, 2)}-${Math.floor(10 + Math.random() * 90)}`;
    const newProj: PanchayatProject = {
      ...project,
      id,
      projectId: pCode,
      spentBudget: 0,
      inspectionHistory: [],
    };
    setPanchayatProjects((prev) => [newProj, ...prev]);

    logAudit(
      'PANCHAYAT_PROJECT_CREATED',
      'PANCHAYAT_PROJECT',
      id,
      `Created Panchayat infrastructure project ${newProj.title} in ${newProj.villageName} with budget ₹${newProj.allocatedBudget}.`
    );
  };

  // Update Panchayat progress
  const updatePanchayatProgress = (
    projectId: string,
    progress: number,
    remarks: string,
    photoUrl?: string
  ) => {
    setPanchayatProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const newSpent = Math.round((p.allocatedBudget * progress) / 100);
          return {
            ...p,
            progressPercentage: progress,
            spentBudget: newSpent,
            status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
            remarks: remarks || p.remarks,
            photoUrl: photoUrl || p.photoUrl,
            inspectionHistory: [
              {
                id: `pi-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                inspectorName: currentUser?.name || 'Inspection Official',
                remarks,
                photoUrl: photoUrl || p.photoUrl,
                progressPercentage: progress,
              },
              ...p.inspectionHistory,
            ],
          };
        }
        return p;
      })
    );

    logAudit(
      'PANCHAYAT_PROJECT_PROGRESS',
      'PANCHAYAT_PROJECT',
      projectId,
      `Updated progress to ${progress}%. Remarks: ${remarks}`
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // CSV Exporter
  const exportDataAsCsv = (type: 'beneficiaries' | 'inspections' | 'panchayat' | 'instalments') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `gramtrack_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'beneficiaries') {
      headers = ['ID', 'Beneficiary Code', 'Name', 'Guardian', 'Village', 'Stage', 'Verification', 'Sanctioned (INR)', 'Disbursed (INR)', 'Phone', 'Reg Date'];
      rows = beneficiaries.map((b) => [
        b.id,
        b.beneficiaryId,
        b.name,
        b.guardianName,
        b.villageName,
        b.currentStage,
        b.verificationStatus,
        b.sanctionAmount.toString(),
        b.disbursedAmount.toString(),
        b.phone,
        b.registrationDate,
      ]);
    } else if (type === 'inspections') {
      headers = ['Inspection ID', 'Beneficiary', 'Village', 'Stage', 'Status', 'Inspector', 'Latitude', 'Longitude', 'Accuracy (m)', 'Timestamp', 'Remarks'];
      rows = inspections.map((i) => [
        i.id,
        i.beneficiaryName,
        i.villageName,
        i.stage,
        i.status,
        i.inspectorName,
        (i.latitude || '').toString(),
        (i.longitude || '').toString(),
        (i.gpsAccuracy || '').toString(),
        i.timestamp,
        `"${(i.remarks || '').replace(/"/g, '""')}"`,
      ]);
    } else if (type === 'panchayat') {
      headers = ['Project ID', 'Code', 'Title', 'Category', 'Village', 'Department', 'Status', 'Progress (%)', 'Budget (INR)', 'Spent (INR)'];
      rows = panchayatProjects.map((p) => [
        p.id,
        p.projectId,
        `"${p.title.replace(/"/g, '""')}"`,
        p.category,
        p.villageName,
        p.department,
        p.status,
        p.progressPercentage.toString(),
        p.allocatedBudget.toString(),
        p.spentBudget.toString(),
      ]);
    } else if (type === 'instalments') {
      headers = ['Record ID', 'Beneficiary', 'Village', 'Instalment #', 'Amount (INR)', 'Stage Milestone', 'Status', 'PFMS Ref', 'Last Updated'];
      rows = instalments.map((inst) => [
        inst.id,
        inst.beneficiaryName,
        inst.villageName,
        inst.instalmentNumber.toString(),
        inst.amount.toString(),
        inst.stageTrigger,
        inst.status,
        inst.transactionReference || 'N/A',
        inst.lastUpdated,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        villages,
        beneficiaries,
        housingProjects,
        inspections,
        panchayatProjects,
        verificationCases,
        instalments,
        auditLogs,
        notifications,
        unreadNotifsCount,
        addBeneficiary,
        submitInspection,
        handleInspectionApproval,
        updateVerificationCase,
        triggerInstalmentProcessing,
        addPanchayatProject,
        updatePanchayatProgress,
        markNotificationAsRead,
        markAllNotificationsRead,
        syncExternalInspection,
        exportDataAsCsv,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
