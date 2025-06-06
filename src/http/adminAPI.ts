import { CreateProductDTO, CreateRaffleTicketPackageDTO, DailyReward, Raffle, Task } from "@/types/types";
import { $authHost } from "./index";

// ====== DailyReward ======
export const getDailyRewards = async () => {
    const { data } = await $authHost.get('api/daily-reward/get');
    return data;
}

export const createDailyReward = async (dailyReward: DailyReward) => {
    const { data } = await $authHost.post('api/daily-reward/create', dailyReward);
    return data;
}

export const updateDailyRewardByDay = async (day: number, dailyReward: DailyReward) => {
    const { data } = await $authHost.put(`api/daily-reward/update/day/${day}`, dailyReward);
    return data;
}


// ====== Task ======

export const createTask = async (task: Task) => {
    const { data } = await $authHost.post('api/task/create', task);
    return data;
}

export const getTasks = async () => {
    const { data } = await $authHost.get('api/task/get');
    return data;
}

export const updateTask = async (id: number, task: Task) => {
    const { data } = await $authHost.put(`api/task/update/${id}`, task);
    return data;
}


// ====== Product ======

export const createProduct = async (product: CreateProductDTO) => {
    const { data } = await $authHost.post('api/product/create', product);
    return data;
}

export const getAllProducts = async () => {
    const { data } = await $authHost.get('api/product/all');
    return data;
}

export const updateProduct = async (id: number, product: CreateProductDTO) => {
    const { data } = await $authHost.put(`api/product/update/${id}`, product);
    return data;
}


// ====== Raffle ======

export const createRaffle = async (raffle: Raffle) => {
    const { data } = await $authHost.post('api/raffle/create', raffle);
    return data;
}

export const getCurrentRaffle = async () => {
    const { data } = await $authHost.get('api/raffle/current');
    return data;
}

export const completeRaffle = async () => {
    const { data } = await $authHost.post(`api/raffle/complete`);
    return data;
}

export const setRafflePrize = async (prizeId: number) => {
    const { data } = await $authHost.post(`api/raffle/set-prize`, { prizeId });
    return data;
}

export const getRaffleById = async (id: number) => {
    const { data } = await $authHost.get(`api/raffle/${id}`);
    return data;
}

export const getRaffleHistory = async (limit: number, offset: number) => {
    const { data } = await $authHost.get('api/raffle/history', {
      params: { limit, offset },
    });
    return data;
  };
  


// ====== RafflePrize ======

export const getAllPrizes = async () => {
    const { data } = await $authHost.get('api/raffle-prize');
    return data;
}

export const createRafflePrize = async (formData: FormData) => {
    const { data } = await $authHost.post("api/raffle-prize", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  };
  

  export const updateRafflePrize = async (id: number, formData: FormData) => {
    const { data } = await $authHost.put(`api/raffle-prize/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  };


// ====== RaffleTicketPackage ======

export const createPackage = async (p: CreateRaffleTicketPackageDTO) => {
    const { data } = await $authHost.post('api/raffle/package/create', p);
    return data;
}

export const getAllPackages = async () => {
    const { data } = await $authHost.get('api/raffle/package/all');
    return data;
}

export const updatePackage = async (id: number, p: CreateRaffleTicketPackageDTO) => {
    const { data } = await $authHost.put(`api/raffle/package/${id}`, p);
    return data;
}


// ====== User ======

export const getUserById = async (id: number) => {
    const { data } = await $authHost.get(`api/user/${id}`);
    return data;
}

export const searchUser = async (params: { userId?: string; telegramId?: string; username?: string }) => {
    const { data } = await $authHost.get("api/user/search", { params });
    return data;
  };
  

// ====== UserPrize ======
export const getRequestedPrizes = async (limit = 20, offset = 0) => {
    const { data } = await $authHost.get('api/user-prize/requested', {
        params: { limit, offset }
    });
    return data;
};

export const confirmPrizeDelivery = async (prizeId: number) => {
    const { data } = await $authHost.post(`api/user-prize/confirm/${prizeId}`);
    return data;
};

// Новый метод для обновления настроек розыгрыша
export const updateRaffleSettings = async (settings: { ticketThreshold?: number; raffleDuration?: number }) => {
    const { data } = await $authHost.post(`api/raffle/update-settings`, settings);
    return data;
}

// ====== Leaderboard ======

export const getLeaderboard = async () => {
    const { data } = await $authHost.get('api/leaderboard');
    return data;
};

export const getLeaderboardSettings = async () => {
    const { data } = await $authHost.get('api/leaderboard/settings');
    return data;
};

export const updateLeaderboardSettings = async (settings: {
    endDate?: Date | string | null;
    prizeType: 'money' | 'physical';
    totalMoneyPool?: number;
    placePrizes: Record<string, { moneyAmount?: number; rafflePrizeId?: number }>
}) => {
    const { data } = await $authHost.post('api/leaderboard/settings', settings);
    return data;
};


// ====== Cases ======

export const getCases = async () => {
    const { data } = await $authHost.get('api/case');
    return data;
}

export const getCaseById = async (id: number) => {
    const { data } = await $authHost.get(`api/case/admin/${id}`);
    return data;
}

export const createCase = async (formData: FormData) => {
    const { data } = await $authHost.post('api/case', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
}

export const updateCase = async (id: number, formData: FormData) => {
    const { data } = await $authHost.put(`api/case/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
}

export const deleteCase = async (id: number) => {
    const { data } = await $authHost.delete(`api/case/${id}`);
    return data;
}

export const getCasesStats = async () => {
    const { data } = await $authHost.get('api/case/stats');
    return data;
}

// ====== Case Items ======

export const addCaseItem = async (caseId: number, formData: FormData) => {
    const { data } = await $authHost.post(`api/case/${caseId}/item`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
}

export const updateCaseItem = async (itemId: number, formData: FormData) => {
    const { data } = await $authHost.put(`api/case/item/${itemId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
}

export const deleteCaseItem = async (itemId: number) => {
    const { data } = await $authHost.delete(`api/case/item/${itemId}`);
    return data;
}

export const giveCaseToUser = async (userId: number, caseId: number, quantity: number) => {
    const { data } = await $authHost.post('api/case/give', { userId, caseId, quantity });
    return data;
}

// ====== Referral Payout Requests (Admin) ======

// Типы для запросов и ответов (можно вынести в types.ts, если будут использоваться где-то еще)
export interface AdminReferralPayoutRequest {
  id: number;
  amount: string; // DECIMAL приходит как строка
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  userId: number;
  user?: { // Информация о пользователе
    id: number;
    email?: string | null;
    username?: string | null;
    telegramId?: string | null;
  };
  currentUserWithdrawableBalance?: string | number | null; // Добавлено на бэкенде
}

export interface AdminPayoutRequestsResponse {
  rows: AdminReferralPayoutRequest[];
  count: number;
  currentPage: number;
  totalPages: number;
}

interface ProcessPayoutRequestPayload {
  newStatus: 'approved' | 'rejected';
  adminNotes?: string;
}

export const getAdminReferralPayoutRequests = async (params: {
  status?: 'pending' | 'approved' | 'rejected';
  userId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<AdminPayoutRequestsResponse> => {
  const { data } = await $authHost.get('api/referral/admin/referral-payout-requests', { params });
  return data;
};

export const processReferralPayoutRequest = async (
  requestId: number,
  payload: ProcessPayoutRequestPayload
): Promise<AdminReferralPayoutRequest> => {
  // Используем POST в соответствии с referralRouter.js
  const { data } = await $authHost.post(`api/referral/admin/referral-payout-requests/${requestId}`, payload);
  return data;
};































