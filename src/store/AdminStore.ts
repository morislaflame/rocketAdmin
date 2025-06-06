import { makeAutoObservable, runInAction } from "mobx";
import {
    DailyReward,
    Product,
    Raffle,
    RafflePrize,
    RaffleTicketPackage,
    Task,
    CurrentRaffle,
    CreateProductDTO,
    CreateRaffleTicketPackageDTO,
    UserPrize,
    Case,
} from "@/types/types";
import {
    getDailyRewards,
    createDailyReward,
    updateDailyRewardByDay,
    createTask,
    getTasks,
    updateTask,
    createProduct,
    getAllProducts,
    updateProduct,
    createRaffle,
    getCurrentRaffle,
    completeRaffle,
    setRafflePrize,
    getRaffleById,
    getRaffleHistory,
    getAllPrizes,
    createPackage,
    getAllPackages,
    updatePackage,
    getUserById,
    createRafflePrize,
    updateRafflePrize,
    searchUser,
    getRequestedPrizes,
    confirmPrizeDelivery,
    updateRaffleSettings,
    getLeaderboard,
    getLeaderboardSettings,
    updateLeaderboardSettings,
    getCases,
    getCaseById,
    createCase,
    updateCase,
    deleteCase,
    getCasesStats,
    addCaseItem,
    updateCaseItem,
    deleteCaseItem,
    giveCaseToUser,
    getAdminReferralPayoutRequests,
    processReferralPayoutRequest,
    AdminReferralPayoutRequest,
    AdminPayoutRequestsResponse,
} from "../http/adminAPI";

export default class AdminStore {
    _loading = false;
    _dailyRewards: DailyReward[] = [];
    _tasks: Task[] = [];
    _products: Product[] = [];
    _currentRaffle: CurrentRaffle | null = null;
    _raffleHistory: Raffle[] = [];
    _prizes: RafflePrize[] = [];
    _packages: RaffleTicketPackage[] = [];
    _requestedPrizes: UserPrize[] = [];
    _cases: Case[] = [];
    _casesStats: any = null;

    // New state for referral payout requests
    _referralPayoutRequests: AdminReferralPayoutRequest[] = [];
    _referralPayoutRequestsCount = 0;
    _referralPayoutRequestsCurrentPage = 1;
    _referralPayoutRequestsTotalPages = 1;
    _referralPayoutRequestsLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    // Setters
    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setDailyRewards(rewards: DailyReward[]) {
        this._dailyRewards = rewards;
    }

    setTasks(tasks: Task[]) {
        this._tasks = tasks;
    }

    setProducts(products: Product[]) {
        this._products = products;
    }

    setCurrentRaffle(raffle: CurrentRaffle | null) {
        this._currentRaffle = raffle;
    }

    setRaffleHistory(raffles: Raffle[]) {
        this._raffleHistory = raffles;
    }

    setPrizes(prizes: RafflePrize[]) {
        this._prizes = prizes;
    }

    setPackages(packages: RaffleTicketPackage[]) {
        this._packages = packages;
    }

    setRequestedPrizes(prizes: UserPrize[]) {
        this._requestedPrizes = prizes;
    }

    setCases(cases: Case[]) {
        this._cases = cases;
    }

    setCasesStats(stats: any) {
        this._casesStats = stats;
    }

    // New setters for referral payouts
    setReferralPayoutRequests(requests: AdminReferralPayoutRequest[]) {
        this._referralPayoutRequests = requests;
    }
    setReferralPayoutRequestsCount(count: number) {
        this._referralPayoutRequestsCount = count;
    }
    setReferralPayoutRequestsCurrentPage(page: number) {
        this._referralPayoutRequestsCurrentPage = page;
    }
    setReferralPayoutRequestsTotalPages(pages: number) {
        this._referralPayoutRequestsTotalPages = pages;
    }
    setReferralPayoutRequestsLoading(loading: boolean) {
        this._referralPayoutRequestsLoading = loading;
    }

    // Getters
    get loading() {
        return this._loading;
    }

    get dailyRewards() {
        return this._dailyRewards;
    }

    get tasks() {
        return this._tasks;
    }

    get products() {
        return this._products;
    }

    get currentRaffle() {
        return this._currentRaffle;
    }

    get raffleHistory() {
        return this._raffleHistory;
    }

    get prizes() {
        return this._prizes;
    }

    get packages() {
        return this._packages;
    }

    get requestedPrizes() {
        return this._requestedPrizes;
    }

    get cases() {
        return this._cases;
    }

    get casesStats() {
        return this._casesStats;
    }

    // New getters for referral payouts
    get referralPayoutRequests() {
        return this._referralPayoutRequests;
    }
    get referralPayoutRequestsCount() {
        return this._referralPayoutRequestsCount;
    }
    get referralPayoutRequestsCurrentPage() {
        return this._referralPayoutRequestsCurrentPage;
    }
    get referralPayoutRequestsTotalPages() {
        return this._referralPayoutRequestsTotalPages;
    }
    get referralPayoutRequestsLoading() {
        return this._referralPayoutRequestsLoading;
    }

    // ====== DailyReward ======
    async getDailyRewards() {
        this.setLoading(true);
        try {
            const data = await getDailyRewards();
            runInAction(() => {
                this.setDailyRewards(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting daily rewards:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async createDailyReward(dailyReward: DailyReward) {
        try {
            const data = await createDailyReward(dailyReward);
            runInAction(() => {
                this._dailyRewards = [...this._dailyRewards, data];
            });
            return data;
        } catch (error) {
            console.error("Error creating daily reward:", error);
            throw error;
        }
    }

    async updateDailyRewardByDay(day: number, dailyReward: DailyReward) {
        try {
            const data = await updateDailyRewardByDay(day, dailyReward);
            runInAction(() => {
                this._dailyRewards = this._dailyRewards.map(reward => 
                    reward.day === day ? data : reward
                );
            });
            return data;
        } catch (error) {
            console.error("Error updating daily reward:", error);
            throw error;
        }
    }

    // ====== Task ======
    async createTask(task: Task) {
        try {
            const data = await createTask(task);
            runInAction(() => {
                this._tasks = [...this._tasks, data];
            });
            return data;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    }

    async getTasks() {
        this.setLoading(true);
        try {
            const data = await getTasks();
            runInAction(() => {
                this.setTasks(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting tasks:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateTask(id: number, task: Task) {
        try {
            const data = await updateTask(id, task);
            runInAction(() => {
                this._tasks = this._tasks.map(t => 
                    t.id === id ? data : t
                );
            });
            return data;
        } catch (error) {
            console.error("Error updating task:", error);
            throw error;
        }
    }

    // ====== Product ======
    async createProduct(product: CreateProductDTO) {
        try {
            const data = await createProduct(product);
            runInAction(() => {
                this._products = [...this._products, data];
            });
            return data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }

    async getAllProducts() {
        this.setLoading(true);
        try {
            const data = await getAllProducts();
            runInAction(() => {
                this.setProducts(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting all products:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateProduct(id: number, product: CreateProductDTO) {
        try {
            const data = await updateProduct(id, product);
            runInAction(() => {
                this._products = this._products.map(p => 
                    p.id === id ? data : p
                );
            });
            return data;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    }

    // ====== Raffle ======
    async createRaffle(raffle: Raffle) {
        try {
            const data = await createRaffle(raffle);
            runInAction(() => {
                this.setCurrentRaffle(data);
            });
            return data;
        } catch (error) {
            console.error("Error creating raffle:", error);
            throw error;
        }
    }

    async getCurrentRaffle() {
        this.setLoading(true);
        try {
            const data = await getCurrentRaffle();
            runInAction(() => {
                this.setCurrentRaffle(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting current raffle:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async completeRaffle() {
        try {
            const data = await completeRaffle();
            runInAction(() => {
                if (this._currentRaffle) {
                    this._raffleHistory = [...this._raffleHistory, this._currentRaffle.raffle];
                }
                this.setCurrentRaffle(null);
            });
            return data;
        } catch (error) {
            console.error("Error completing raffle:", error);
            throw error;
        }
    }

    async setRafflePrize(prizeId: number) {
        try {
            const data = await setRafflePrize(prizeId);
            runInAction(() => {
                if (this._currentRaffle) {
                    this._currentRaffle.raffle.raffle_prize = data.prize;
                }
            });
            return data;
        } catch (error) {
            console.error("Error setting raffle prize:", error);
            throw error;
        }
    }

    async updateRaffleSettings(settings: { ticketThreshold?: number; raffleDuration?: number }) {
        try {
            const data = await updateRaffleSettings(settings);
            runInAction(() => {
                if (this._currentRaffle && data.raffle) {
                    this._currentRaffle.raffle.ticketThreshold = data.raffle.ticketThreshold;
                    this._currentRaffle.raffle.raffleDuration = data.raffle.raffleDuration;
                }
            });
            return data;
        } catch (error) {
            console.error("Error updating raffle settings:", error);
            throw error;
        }
    }

    async getRaffleById(id: number) {
        try {
            const data = await getRaffleById(id);
            return data;
        } catch (error) {
            console.error("Error getting raffle by id:", error);
            throw error;
        }
    }

    async getRaffleHistory(limit: number, offset: number) {
        this.setLoading(true);
        try {
          const data = await getRaffleHistory(limit, offset);
          runInAction(() => {
            this.setRaffleHistory(data);
          });
          return data;
        } catch (error) {
          console.error("Error getting raffle history:", error);
          throw error;
        } finally {
          runInAction(() => {
            this.setLoading(false);
          });
        }
      }
      

    // ====== RafflePrize ======

    async getAllPrizes() {
        try {
            const data = await getAllPrizes();
            runInAction(() => {
                this.setPrizes(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting all prizes:", error);
            throw error;
        }
    }

    async createPrize(prize: FormData) {
        try {
            const data = await createRafflePrize(prize);
            runInAction(() => {
                this._prizes = [...this._prizes, data];
            });
            return data;
        } catch (error) {
            console.error("Error creating prize:", error);
            throw error;
        }
    }

    async updatePrize(id: number, formData: FormData) {
        try {
            const data = await updateRafflePrize(id, formData);
            runInAction(() => {
                this._prizes = this._prizes.map(p => 
                    p.id === id ? data : p
                );
            });
            return data;
        } catch (error) {
            console.error("Error updating prize:", error);
            throw error;
        }
    }

    // ====== RaffleTicketPackage ======
    async createPackage(p: CreateRaffleTicketPackageDTO) {
        try {
            const data = await createPackage(p);
            runInAction(() => {
                this._packages = [...this._packages, data];
            });
            return data;
        } catch (error) {
            console.error("Error creating package:", error);
            throw error;
        }
    }

    async getAllPackages() {
        this.setLoading(true);
        try {
            const data = await getAllPackages();
            runInAction(() => {
                this.setPackages(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting all packages:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updatePackage(id: number, p: CreateRaffleTicketPackageDTO) {
        try {
            const data = await updatePackage(id, p);
            runInAction(() => {
                this._packages = this._packages.map(pkg => 
                    pkg.id === id ? data : pkg
                );
            });
            return data;
        } catch (error) {
            console.error("Error updating package:", error);
            throw error;
        }
    }

    // ====== User ======
    async getUserById(id: number) {
        try {
            const data = await getUserById(id);
            return data;
        } catch (error) {
            console.error("Error getting user by id:", error);
            throw error;
        }
    }

    async searchUser(params: { userId?: string; telegramId?: string; username?: string }) {
        try {
          const data = await searchUser(params);
          return data;
        } catch (error) {
          console.error("Error searching user:", error);
          throw error;
        }
      }
      
    // ====== UserPrize ======
    async getRequestedPrizes(limit = 20, offset = 0) {
        this.setLoading(true);
        try {
            const data = await getRequestedPrizes(limit, offset);
            runInAction(() => {
                this.setRequestedPrizes(data);
            });
            return data;
        } catch (error) {
            console.error("Ошибка при получении запрошенных призов:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async confirmPrizeDelivery(prizeId: number) {
        try {
            const data = await confirmPrizeDelivery(prizeId);
            runInAction(() => {
                // Удаляем подтвержденный приз из списка запрошенных
                this._requestedPrizes = this._requestedPrizes.filter(
                    prize => prize.id !== prizeId
                );
            });
            return data;
        } catch (error) {
            console.error("Ошибка при подтверждении доставки приза:", error);
            throw error;
        }
    }

    // ====== Leaderboard ======
    async getLeaderboard() {
        this.setLoading(true);
        try {
            const data = await getLeaderboard();
            return data;
        } catch (error) {
            console.error("Error getting leaderboard:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async getLeaderboardSettings() {
        this.setLoading(true);
        try {
            const data = await getLeaderboardSettings();
            return data;
        } catch (error) {
            console.error("Error getting leaderboard settings:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateLeaderboardSettings(settings: {
        endDate?: Date | string | null;
        prizeType: 'money' | 'physical';
        totalMoneyPool?: number;
        placePrizes: Record<string, { moneyAmount?: number; rafflePrizeId?: number }>
    }) {
        this.setLoading(true);
        try {
            const data = await updateLeaderboardSettings(settings);
            return data;
        } catch (error) {
            console.error("Error updating leaderboard settings:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    // ====== Cases ======
    async getCases() {
        this.setLoading(true);
        try {
            const data = await getCases();
            runInAction(() => {
                this.setCases(data);
            });
            return data;
        } catch (error) {
            console.error("Ошибка при получении кейсов:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async getCaseById(id: number) {
        try {
            const data = await getCaseById(id);
            return data;
        } catch (error) {
            console.error("Ошибка при получении кейса:", error);
            throw error;
        }
    }

    async createCase(formData: FormData) {
        try {
            const data = await createCase(formData);
            runInAction(() => {
                this._cases = [...this._cases, data];
            });
            return data;
        } catch (error) {
            console.error("Ошибка при создании кейса:", error);
            throw error;
        }
    }

    async updateCase(id: number, formData: FormData) {
        try {
            const data = await updateCase(id, formData);
            runInAction(() => {
                this._cases = this._cases.map(c => 
                    c.id === id ? data : c
                );
            });
            return data;
        } catch (error) {
            console.error("Ошибка при обновлении кейса:", error);
            throw error;
        }
    }

    async deleteCase(id: number) {
        try {
            const data = await deleteCase(id);
            runInAction(() => {
                this._cases = this._cases.filter(c => c.id !== id);
            });
            return data;
        } catch (error) {
            console.error("Ошибка при удалении кейса:", error);
            throw error;
        }
    }

    async getCasesStats() {
        this.setLoading(true);
        try {
            const data = await getCasesStats();
            runInAction(() => {
                this.setCasesStats(data);
            });
            return data;
        } catch (error) {
            console.error("Ошибка при получении статистики кейсов:", error);
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    // ====== Case Items ======
    async addCaseItem(caseId: number, formData: FormData) {
        try {
            const data = await addCaseItem(caseId, formData);
            runInAction(() => {
                // Обновляем список предметов в конкретном кейсе
                this._cases = this._cases.map(c => {
                    if (c.id === caseId) {
                        return {
                            ...c,
                            case_items: [...(c.case_items || []), data]
                        };
                    }
                    return c;
                });
            });
            return data;
        } catch (error) {
            console.error("Ошибка при добавлении предмета в кейс:", error);
            throw error;
        }
    }

    async updateCaseItem(itemId: number, caseId: number, formData: FormData) {
        try {
            const data = await updateCaseItem(itemId, formData);
            runInAction(() => {
                // Обновляем конкретный предмет в конкретном кейсе
                this._cases = this._cases.map(c => {
                    if (c.id === caseId && c.case_items) {
                        return {
                            ...c,
                            case_items: c.case_items.map(item => 
                                item.id === itemId ? data : item
                            )
                        };
                    }
                    return c;
                });
            });
            return data;
        } catch (error) {
            console.error("Ошибка при обновлении предмета кейса:", error);
            throw error;
        }
    }

    async deleteCaseItem(itemId: number, caseId: number) {
        try {
            const data = await deleteCaseItem(itemId);
            runInAction(() => {
                // Удаляем предмет из конкретного кейса
                this._cases = this._cases.map(c => {
                    if (c.id === caseId && c.case_items) {
                        return {
                            ...c,
                            case_items: c.case_items.filter(item => item.id !== itemId)
                        };
                    }
                    return c;
                });
            });
            return data;
        } catch (error) {
            console.error("Ошибка при удалении предмета из кейса:", error);
            throw error;
        }
    }

    async giveCaseToUser(userId: number, caseId: number, quantity: number) {
        try {
            const data = await giveCaseToUser(userId, caseId, quantity);
            return data;
        } catch (error) {
            console.error("Ошибка при выдаче кейса пользователю:", error);
            throw error;
        }
    }

    // ====== Referral Payout Requests (Admin) ======
    async fetchAdminReferralPayoutRequests(params: {
        status?: 'pending' | 'approved' | 'rejected';
        userId?: number;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }) {
        this.setReferralPayoutRequestsLoading(true);
        try {
            const data: AdminPayoutRequestsResponse = await getAdminReferralPayoutRequests(params);
            runInAction(() => {
                this.setReferralPayoutRequests(data.rows);
                this.setReferralPayoutRequestsCount(data.count);
                this.setReferralPayoutRequestsCurrentPage(data.currentPage);
                this.setReferralPayoutRequestsTotalPages(data.totalPages);
            });
            return data;
        } catch (error) {
            console.error("Error fetching admin referral payout requests:", error);
            // Тут можно добавить уведомление для пользователя админ-панели
            throw error;
        } finally {
            runInAction(() => {
                this.setReferralPayoutRequestsLoading(false);
            });
        }
    }

    async processReferralPayoutRequest(
        requestId: number,
        payload: { newStatus: 'approved' | 'rejected'; adminNotes?: string }
    ) {
        // Оптимистичное обновление или обновление после ответа сервера
        try {
            const updatedRequest = await processReferralPayoutRequest(requestId, payload);
            runInAction(() => {
                this._referralPayoutRequests = this._referralPayoutRequests.map(req =>
                    req.id === requestId ? updatedRequest : req
                );
                // Если запрос был одобрен или отклонен, он может исчезнуть из 'pending' фильтра,
                // поэтому может потребоваться перезагрузка списка, если текущий фильтр 'pending'.
                // Либо можно просто обновить существующий элемент.
                // Для простоты пока просто обновляем элемент.
            });
            return updatedRequest;
        } catch (error) {
            console.error("Error processing referral payout request:", error);
            // Уведомление об ошибке
            throw error;
        }
    }
}