export interface UserInfo {
    id: number;
    email: string | null;
    telegramId: number;
    username: string | null;
    role: string;
    balance: number;
    isTonConnected: boolean;
    tonAddress: string | null;
    premium: boolean;
    attempts: number;
    tickets: number;
    referralCode: string | null;
    referrerId: number | null;
    // Если нужно, можно добавить другие поля
  }

  // types.ts
export interface IRoute {
    path: string;
    Component: React.FC;
  }
  

  export interface ServerError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }
  

  export interface DailyReward {
    id: number;
    day: number;
    reward: number;
    rewardType: string;
    description: string;
  }
  
  export interface Task {
    id: number;
    type: string;
    reward: number;
    rewardType: string;
    description: string;
    targetCount: number;
  }

  export interface Product {
    id: number;
    name: string;
    attempts: number;
    starsPrice: number;
  }

  // Создадим тип без id, чтобы передавать его в create
export type CreateProductDTO = Omit<Product, "id">;

  
  export interface Raffle {
    id: number;
    status: string;
    startTime: string;
    endTime: string | null;
    prize: string;
    winnerUserId: number | null;
    totalTickets: number;
    createdAt: string;
    updatedAt: string;
    thresholdReachedAt: string | null;
    winnerChance: number | null;
    timerActive: boolean;
    winningTicketNumber: number | null;
    winner: {
      id: number;
      username: string | null;
      telegramId: number | null;
    } | null;
    raffle_prize: RafflePrize | null;
  }

  export interface RafflePrize {
    id: number;
    name: string;
    imageUrl: string | null;
    value: number;
    description: string | null;
  }

  export interface RecentParticipant {
    userId: number;
    username: string | null;
    lastParticipation: string;
  }
  
  export interface CurrentRaffle {
    raffle: Raffle;
    totalTickets: number;
    totalParticipants: number;
    recentParticipants: RecentParticipant[];
  }

  export interface RaffleTicket {
    id: number;
    ticketNumber: number;
    purchasedAt: Date;
  }

  export interface RaffleTicketPackage {
    id: number;
    name: string;
    ticketCount: number;
    price: number;
  }

  export type CreateRaffleTicketPackageDTO = Omit<RaffleTicketPackage, "id">;

  export interface UserPrize {
    id: number;
    raffleId: number;
    status: string;
    winDate: Date;
  }
  
  export interface UserBonus {
    id: number;
    userId: number;
    bonusType: string;
    isUsed: boolean;
    createdAt: Date;
    usedAt: Date | null;
  }

  export interface MediaFile {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string | null;
    entityType: string;
    entityId: number | null;
    createdAt: Date;
  }
  
