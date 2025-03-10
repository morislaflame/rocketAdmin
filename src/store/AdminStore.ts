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
    createPrize,
    updatePrize,
    createPackage,
    getAllPackages,
    updatePackage,
    getUserById,
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
        }
    }

    async getRaffleById(id: number) {
        try {
            const data = await getRaffleById(id);
            return data;
        } catch (error) {
            console.error("Error getting raffle by id:", error);
        }
    }

    async getRaffleHistory() {
        this.setLoading(true);
        try {
            const data = await getRaffleHistory();
            runInAction(() => {
                this.setRaffleHistory(data);
            });
            return data;
        } catch (error) {
            console.error("Error getting raffle history:", error);
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    // ====== RafflePrize ======
    async createPrize(prize: RafflePrize) {
        try {
            const data = await createPrize(prize);
            runInAction(() => {
                this._prizes = [...this._prizes, data];
            });
            return data;
        } catch (error) {
            console.error("Error creating prize:", error);
        }
    }

    async updatePrize(id: number, prize: RafflePrize) {
        try {
            const data = await updatePrize(id, prize);
            runInAction(() => {
                this._prizes = this._prizes.map(p => 
                    p.id === id ? data : p
                );
            });
            return data;
        } catch (error) {
            console.error("Error updating prize:", error);
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
        }
    }

    // ====== User ======
    async getUserById(id: number) {
        try {
            const data = await getUserById(id);
            return data;
        } catch (error) {
            console.error("Error getting user by id:", error);
        }
    }
}