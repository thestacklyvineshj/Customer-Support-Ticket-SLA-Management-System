import { useState, useEffect, useCallback } from 'react';
import { ticketAPI } from '../services';

export function useTickets(initialFilters = {}) {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, ...initialFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ticketAPI.getAll(filters);
      setTickets(data.data.tickets);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  return { tickets, pagination, filters, loading, error, updateFilters, refetch: fetchTickets };
}
