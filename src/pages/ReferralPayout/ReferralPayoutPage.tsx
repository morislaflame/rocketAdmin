import React, { useContext, useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, IStoreContext } from "@/store/StoreProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Для adminNotes
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Для закрытия диалога
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AdminReferralPayoutRequest } from '@/http/adminAPI'; // Импортируем тип
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, Search, RefreshCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';// Предполагаем наличие компонента пагинации

// Новый компонент пагинации (можно вынести в отдельный файл)
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange: (limit: number) => void; // Добавим это для полноты, если нужно
  isLoading?: boolean; // Чтобы дизейблить кнопки во время загрузки
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage, // Пока не используем itemsPerPage и onItemsPerPageChange для смены лимита, но можно добавить
  totalItems,   //
  onItemsPerPageChange, //
  isLoading,
}) => {
  if (totalPages <= 1) {
    return null; // Не отображаем пагинацию, если всего одна страница или нет страниц
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };
  
  // Генерация номеров страниц (простая версия: текущая, +-N, первая, последняя)
  const pageNumbers = [];
  const pageRange = 2; // Сколько страниц показывать слева и справа от текущей

  // Всегда добавляем первую страницу
  if (totalPages > 1) pageNumbers.push(1);

  // Многоточие после первой, если нужно
  if (currentPage > pageRange + 2 && totalPages > pageRange * 2 + 2) {
    pageNumbers.push('...');
  }

  // Страницы вокруг текущей
  for (let i = Math.max(2, currentPage - pageRange); i <= Math.min(totalPages - 1, currentPage + pageRange); i++) {
    if (!pageNumbers.includes(i)) {
      pageNumbers.push(i);
    }
  }
  
  // Многоточие перед последней, если нужно
  if (currentPage < totalPages - pageRange - 1 && totalPages > pageRange * 2 + 2) {
     if (!pageNumbers.includes('...')) pageNumbers.push('...'); // Убедимся, что не дублируем
  }

  // Всегда добавляем последнюю страницу, если она не первая
  if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
    pageNumbers.push(totalPages);
  }


  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFirst}
        disabled={currentPage === 1 || isLoading}
        className="hidden sm:flex" // Скрываем на очень маленьких экранах
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4 mr-1 sm:mr-0" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((number, index) =>
          typeof number === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm">
              {number}
            </span>
          ) : (
            <Button
              key={number}
              variant={currentPage === number ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(number)}
              disabled={isLoading}
              className="w-9 h-9 p-0" // Делаем кнопки-цифры квадратными
            >
              {number}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
      >
         <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4 ml-1 sm:ml-0" />
      </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={handleLast}
        disabled={currentPage === totalPages || isLoading}
        className="hidden sm:flex" // Скрываем на очень маленьких экранах
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
      {/* Опционально: выбор количества элементов на странице */}
      {/* <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[70px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top">
          {[10, 20, 30, 50].map(pageSize => (
            <SelectItem key={pageSize} value={pageSize.toString()}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
    </div>
  );
};

const ReferralPayoutPage: React.FC = observer(() => {
  const { admin: adminStore } = useContext(Context) as IStoreContext;

  const [filters, setFilters] = useState<{
    status?: 'pending' | 'approved' | 'rejected';
    userId?: string; // userId будет строкой из инпута
    page: number;
    limit: number;
  }>({ page: 1, limit: 10 });

  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminReferralPayoutRequest | null>(null);
  const [processAction, setProcessAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);


  const loadRequests = useCallback(() => {
    const params: any = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.status) params.status = filters.status;
    if (filters.userId && !isNaN(parseInt(filters.userId))) params.userId = parseInt(filters.userId);
    
    adminStore?.fetchAdminReferralPayoutRequests(params).catch(err => {
        toast.error(err?.response?.data?.message || "Failed to load payout requests.");
    });
  }, [adminStore, filters]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  if (!adminStore) return <p>Admin store not available</p>;

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Сброс на 1 страницу при изменении фильтров
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const openProcessModal = (request: AdminReferralPayoutRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setProcessAction(action);
    setAdminNotes(request.adminNotes || ''); // Предзаполняем заметки, если есть
    setProcessModalOpen(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !processAction) return;
    setProcessing(true);
    try {
      await adminStore.processReferralPayoutRequest(selectedRequest.id, {
        newStatus: processAction === 'approve' ? 'approved' : 'rejected',
        adminNotes: adminNotes,
      });
      toast.success(`Request ${processAction}d successfully!`);
      setProcessModalOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      loadRequests(); // Перезагружаем список
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${processAction} request.`);
    } finally {
      setProcessing(false);
    }
  };
  
  const getStatusBadgeVariant = (status: AdminReferralPayoutRequest['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Referral Payout Requests</h1>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="userid-filter">User ID</Label>
            <Input
              id="userid-filter"
              type="number"
              placeholder="Filter by User ID"
              value={filters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={loadRequests} variant="outline" className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
             <Button onClick={() => {
                setFilters({ page: 1, limit: 10}); // Сброс всех фильтров
             }} variant="ghost" className="w-full md:w-auto">
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>
      
      {adminStore.referralPayoutRequestsLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!adminStore.referralPayoutRequestsLoading && adminStore.referralPayoutRequests.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No payout requests found matching your criteria.</p>
      )}

      {!adminStore.referralPayoutRequestsLoading && adminStore.referralPayoutRequests.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Req. ID</TableHead>
                <TableHead>User (ID / TG ID)</TableHead>
                <TableHead>Amount (TON)</TableHead>
                <TableHead>Withdrawable</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminStore.referralPayoutRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>
                    {request.user?.username || request.user?.email || `ID: ${request.userId}`}
                    {request.user?.telegramId && <span className="block text-xs text-muted-foreground">TG: {request.user.telegramId}</span>}
                  </TableCell>
                  <TableCell>{parseFloat(request.amount).toFixed(4)}</TableCell>
                  <TableCell className={
                      typeof request.currentUserWithdrawableBalance === 'number' && parseFloat(request.amount) > request.currentUserWithdrawableBalance ? 'text-destructive font-semibold' : ''
                    }>
                    {typeof request.currentUserWithdrawableBalance === 'number' 
                      ? parseFloat(request.currentUserWithdrawableBalance.toString()).toFixed(4) 
                      : request.currentUserWithdrawableBalance || 'N/A'}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]" title={request.walletAddress}>
                    {request.walletAddress}
                  </TableCell>
                  <TableCell>{format(new Date(request.requestedAt), "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => openProcessModal(request, 'approve')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openProcessModal(request, 'reject')}>
                          Reject
                        </Button>
                      </div>
                    )}
                     {request.status !== 'pending' && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">View Notes</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Admin Notes for Request #{request.id}</DialogTitle>
                                </DialogHeader>
                                <p className="py-4">{request.adminNotes || "No notes provided."}</p>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="secondary">Close</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Используем новый компонент пагинации */}
          <PaginationControls
            currentPage={filters.page}
            totalPages={adminStore.referralPayoutRequestsTotalPages}
            onPageChange={handlePageChange}
            itemsPerPage={filters.limit} // Передаем текущий лимит
            totalItems={adminStore.referralPayoutRequestsCount} // Передаем общее количество
            onItemsPerPageChange={(newLimit) => handleFilterChange('limit', newLimit)} // Передаем обработчик смены лимита
            isLoading={adminStore.referralPayoutRequestsLoading}
          />
        </>
      )}

      {/* Модальное окно для обработки запроса */}
      <Dialog open={processModalOpen} onOpenChange={setProcessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? 'Approve' : 'Reject'} Payout Request #{selectedRequest?.id}
            </DialogTitle>
            <DialogDescription>
              User: {selectedRequest?.user?.username || selectedRequest?.user?.email || `ID: ${selectedRequest?.userId}`}<br />
              Amount: {selectedRequest?.amount ? parseFloat(selectedRequest.amount).toFixed(4) : 'N/A'} TON<br />
              Wallet: {selectedRequest?.walletAddress} <br />
              Current User Withdrawable: {
                typeof selectedRequest?.currentUserWithdrawableBalance === 'number' 
                ? parseFloat(selectedRequest.currentUserWithdrawableBalance.toString()).toFixed(4) + ' TON'
                : selectedRequest?.currentUserWithdrawableBalance || 'N/A'
              }
              {(typeof selectedRequest?.currentUserWithdrawableBalance === 'number' && selectedRequest?.amount && parseFloat(selectedRequest.amount) > selectedRequest.currentUserWithdrawableBalance) && 
                <span className="text-destructive font-bold block"> Warning: Request amount exceeds withdrawable balance!</span>
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-notes">Admin Notes (optional for approval, recommended for rejection)</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Reason for rejection or any internal notes..."
              disabled={processing}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessModalOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessRequest}
              disabled={processing || (processAction === 'approve' && typeof selectedRequest?.currentUserWithdrawableBalance === 'number' && !!selectedRequest?.amount && parseFloat(selectedRequest.amount) > selectedRequest.currentUserWithdrawableBalance)}
              variant={processAction === 'reject' ? 'destructive' : 'default'}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {processAction === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ReferralPayoutPage;