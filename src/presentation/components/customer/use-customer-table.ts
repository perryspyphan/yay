'use client'
import { useState, useTransition } from 'react';
import { Customer, Order, CustomerTier } from '@/domain/entities/Customer';
import { CustomerRepositoryImpl as Repo } from '@/infrastructure/supabase/repositories/customer-repository.impl';

export function useCustomerTable(initialCustomers: Customer[]) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Record<string, Order[]>>({});
  const [isPending, startTransition] = useTransition();

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.id.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q) && !(c.phone||'').includes(q)) return false;
    if (tierFilter && c.tier !== tierFilter) return false;
    if (minTotal && c.total < Number(minTotal)) return false;
    if (maxTotal && c.total > Number(maxTotal)) return false;
    if (dateFrom && c.created_at < dateFrom) return false;
    if (dateTo && c.created_at > dateTo) return false;
    return true;
  });

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!orders[id]) {
      const data = await Repo.getOrders(id);
      setOrders(p => ({ ...p, [id]: data }));
    }
  };

  const doDelete = (ids: string[]) => startTransition(async () => {
    await Repo.deleteMany(ids);
    setCustomers(p => p.filter(c => !ids.includes(c.id)));
    setSelected(new Set());
  });

  return {
    customers, setCustomers, search, setSearch, tierFilter, setTierFilter,
    minTotal, setMinTotal, maxTotal, setMaxTotal, dateFrom, setDateFrom,
    dateTo, setDateTo, page, setPage, selected, setSelected,
    expandedId, toggleExpand, orders, filtered, isPending, doDelete
  };
}