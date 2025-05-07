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
    totalSpent: string;
    imageUrl: string | null;
    dailyRewardAvailable: boolean;
    dailyRewardDay: number;
    lastDailyRewardClaimAt: string;
    participatesInRaffle: boolean;
    Referrals: Referral[];
    referralsCount: number;
    // Если нужно, можно добавить другие поля
  }

  export interface Referral {
    id: number;
    referrerId: number;
    referralId: number;
    registeredAt: string;
    createdAt: string;
    updatedAt: string;
    ReferralUser: {
        id: number;
        totalSpent: string;
    };
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
    ticketThreshold: number;
    raffleDuration: number;
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
    media_file: MediaFile | null;
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
    winDate: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
    rafflePrizeId: number | null;
    raffle: {
      id: number;
      status: string;
      startTime: string;
      endTime: string;
      prize: string;
      winnerUserId: number;
      totalTickets: number;
      winningTicketNumber: number;
      thresholdReachedAt: string;
      timerActive: boolean;
      winnerChance: number;
      createdAt: string;
      updatedAt: string;
      prizeId: number;
      rafflePrizeId: number | null;
      raffle_prize: {
        id: number;
        name: string;
        imageUrl: string;
        value: number;
        description: string;
        media_file: MediaFile | null;
      }
      },
      user: {
        id: number;
        username: string;
        telegramId: string;
        email: string | null;
      }
  }
  
  export interface UserBonus {
    id: number;
    userId: number;
    bonusType: string;
    isUsed: boolean;
    createdAt: Date;
    usedAt: Date | null;
  }


export interface LeaderboardPlacePrize {
  id: number;
  place: number;
  moneyAmount: number | null;
  rafflePrizeId: number | null;
  leaderboardSettingsId: number;
  createdAt?: string;
  updatedAt?: string;
  rafflePrize?: RafflePrize;
}

export interface LeaderboardSettings {
  id: number;
  isActive: boolean;
  endDate: string | null;
  prizeType: 'money' | 'physical';
  totalMoneyPool: number | null;
  createdAt: string;
  updatedAt: string;
  placePrizes: LeaderboardPlacePrize[];
}

export interface LeaderboardData {
  users: UserInfo[];
  settings: LeaderboardSettings | { isActive: false };
}

  export interface MediaFile {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string;
    entityType: string;
    entityId: number | null;
    createdAt: Date;
  }
  
  
export interface Case {
  id: number;
  name: string;
  type: string;
  description?: string;
  price?: number;
  starsPrice?: number;
  pointsPrice?: number;
  imageUrl: string;
  isActive: boolean;
  case_items: CaseItem[];
  media_file: MediaFile | null;
}

export type CreateCaseDTO = Omit<Case, "id" | "case_items" | "isActive">;

export interface CaseItem {
  id: number;
  type: string;
  value: number | null;
  probability: number;
  imageUrl: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  caseId: number;
  rafflePrizeId: number;
  prize: RafflePrize;
  media_file: MediaFile | null;
}

