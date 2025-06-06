import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { ALL_RAFFLES_ROUTE, ATTEMPTS_PACKAGE_ROUTE, DAILY_REWARD_ROUTE, LEADERBOARD_ROUTE, RAFFLE_ROUTE, TASKS_ROUTE, TICKETS_PACKAGE_ROUTE, USERS_ROUTE, REQUESTED_PRIZES_ROUTE, CASES_ROUTE, REFERRAL_PAYOUT_ROUTE } from "@/utils/consts"

const taskComponents = [
    {
        title: "Задания",
        href: TASKS_ROUTE,
        description: "Управление заданиями для пользователей и их вознаграждениями."
    },
    {
        title: "Ежедневные награды",
        href: DAILY_REWARD_ROUTE,
        description: "Настройка системы ежедневных наград и бонусов."
    }
]

const raffleComponents = [
    {
        title: "Текущий розыгрыш",
        href: RAFFLE_ROUTE,
        description: "Управление текущим розыгрышем и призами."
    },
    {
        title: "Все розыгрыши",
        href: ALL_RAFFLES_ROUTE,
        description: "Просмотр всех розыгрышей."
    },
    {
        title: "Лидерборд",
        href: LEADERBOARD_ROUTE,
        description: "Настройка лидерборда и призов для топ-пользователей."
    }
]

const productComponents = [
    {
        title: "Попытки",
        href: ATTEMPTS_PACKAGE_ROUTE,
        description: "Пакеты попыток за Stars"
    },
    {
        title: "Билеты",
        href: TICKETS_PACKAGE_ROUTE,
        description: "Пакеты билетов за Ton"
    },
]

const usersComponents = [
    {
        title: "Пользователи",
        href: USERS_ROUTE,
        description: "Просмотр всех пользователей."
    },
    {
        title: "Запрошенные призы",
        href: REQUESTED_PRIZES_ROUTE,
        description: "Управление запрошенными пользователями призами."
    },
    {
        title: "Выплаты",
        href: REFERRAL_PAYOUT_ROUTE,
        description: "Управление выплатами."
    }
]

const casesComponents = [
    {
        title: "Кейсы",
        href: CASES_ROUTE,
        description: "Управление кейсами."
    }
]

const Navigation: React.FC = () => {
    return (
        <div className="w-full flex justify-center">
        <NavigationMenu className="w-full flex justify-center">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Задания</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
                            {taskComponents.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Розыгрыши</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
                            {raffleComponents.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Продукты</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
                            {productComponents.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Пользователи</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
                            {usersComponents.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger>Кейсы</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
                            {casesComponents.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
        </div>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref}
                    to={href || ''}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

export default Navigation