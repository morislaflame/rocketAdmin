import {makeAutoObservable, runInAction } from "mobx";
import { telegramAuth, check } from "../http/userAPI";
import { UserInfo } from "../types/types";

export default class UserStore {
    _user: UserInfo | null = null;
    _isAuth = false;
    _loading = false;
    isTooManyRequests = false;

    constructor() {
        makeAutoObservable(this);
    }

    setIsAuth(bool: boolean) {
        this._isAuth = bool;
    }

    setUser(user: UserInfo | null) {
        this._user = user;
    }


    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setTooManyRequests(flag: boolean) {
        this.isTooManyRequests = flag;
      }



    async logout() {
        try {
            this.setIsAuth(false);
            this.setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    async telegramLogin(initData: string) {
        try {
            const data = await telegramAuth(initData);
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
            });
        } catch (error) {
            console.error("Error during Telegram authentication:", error);
        }
    }
    
    async checkAuth() {
        try {
            const data = await check();
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
            });
        } catch (error) {
            console.error("Error during auth check:", error);
            runInAction(() => {
                this.setIsAuth(false);
                this.setUser(null);
            });
        }
    }
    

    get isAuth() {
        return this._isAuth
    }

    get user() {
        return this._user
    }

    get loading() {
        return this._loading;
    }

}
