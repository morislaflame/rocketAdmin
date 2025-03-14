import React, { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/http/userAPI";
import { Context, IStoreContext } from "@/store/StoreProvider";
import { useNavigate } from "react-router-dom";
import { ADMIN_ROUTE } from "@/utils/consts";
import { ServerError, UserInfo } from "@/types/types";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { user } = useContext(Context) as IStoreContext;
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        try {
            const userData = await login(email, password);
            user.setUser(userData as UserInfo);
            console.log("User data:", userData);
            user.setIsAuth(true);
            navigate(ADMIN_ROUTE);
            window.location.reload();
        } catch (e) {
            setError((e as ServerError).response?.data?.message || "Произошла ошибка при входе");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-center">Вход в систему</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full">
                            Войти
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;