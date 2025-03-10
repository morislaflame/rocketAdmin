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
import { ATTEMPTS_PACKAGE_ROUTE, DAILY_REWARD_ROUTE, RAFFLE_ROUTE, TASKS_ROUTE, TICKETS_PACKAGE_ROUTE } from "@/utils/consts"

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
        title: "Розыгрыши",
        href: RAFFLE_ROUTE,
        description: "Управление текущими и прошедшими розыгрышами призов."
    },
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