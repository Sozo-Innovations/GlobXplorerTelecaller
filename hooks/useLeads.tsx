// Powered by OnSpace.AI
import { useContext } from 'react';
import { LeadsContext } from '@/contexts/LeadsContext';

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}
