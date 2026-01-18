import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, Database, Activity, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link to="/" className="mr-6 flex items-center space-x-2">
                        <Activity className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">
                            Anas & Asmae
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            to="/"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                "text-foreground/60"
                            )}
                        >
                            Projects
                        </Link>
                        <Link
                            to="/settings"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                "text-foreground/60"
                            )}
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search inputs could go here */}
                    </div>
                    <nav className="flex items-center">
                        {/* User profile could go here */}
                    </nav>
                </div>
            </div>
        </header>
    )
}
