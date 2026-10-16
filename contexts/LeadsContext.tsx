// Powered by OnSpace.AI
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  Lead,
  addLead as svcAddLead,
  bulkAddLeads as svcBulkAddLeads,
  convertToStudent as svcConvert,
  getAllLeads,
  updateLead as svcUpdateLead,
} from '@/services/leadsService';
import { AuthContext } from './AuthContext';

export type LeadsContextType = {
  leads: Lead[];
  loading: boolean;
  refresh: () => Promise<void>;
  addLead: (data: Omit<Lead, 'id' | 'createdAt' | 'status'>) => Promise<Lead>;
  bulkAdd: (rows: Array<Partial<Lead>>, assignedTo: string | null) => Promise<number>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  convertToStudent: (id: string) => Promise<void>;
};

export const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await getAllLeads();
    setLeads(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, auth?.user?.id]);

  const addLead = useCallback(async (data: Omit<Lead, 'id' | 'createdAt' | 'status'>) => {
    const l = await svcAddLead(data);
    await refresh();
    return l;
  }, [refresh]);

  const bulkAdd = useCallback(async (rows: Array<Partial<Lead>>, assignedTo: string | null) => {
    const n = await svcBulkAddLeads(rows, assignedTo);
    await refresh();
    return n;
  }, [refresh]);

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    await svcUpdateLead(id, patch);
    await refresh();
  }, [refresh]);

  const convertToStudent = useCallback(async (id: string) => {
    if (!auth?.user) return;
    await svcConvert(id, auth.user.id);
    await refresh();
  }, [auth?.user, refresh]);

  return (
    <LeadsContext.Provider value={{ leads, loading, refresh, addLead, bulkAdd, updateLead, convertToStudent }}>
      {children}
    </LeadsContext.Provider>
  );
}
