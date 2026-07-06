import { useTickets } from '../hooks/useTickets';
import TicketFilters from '../components/TicketFilters';
import TicketTable from '../components/TicketTable';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function TicketList({ title, showCustomer = false, showAgent = false }) {
  const { tickets, pagination, filters, loading, error, updateFilters } = useTickets();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <TicketFilters filters={filters} onChange={updateFilters} />
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <p className="text-red-500 text-center py-8">{error}</p>
        ) : (
          <>
            <TicketTable tickets={tickets} showCustomer={showCustomer} showAgent={showAgent} />
            <Pagination pagination={pagination} onPageChange={(page) => updateFilters({ page })} />
          </>
        )}
      </div>
    </div>
  );
}
