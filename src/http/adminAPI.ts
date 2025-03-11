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
  































