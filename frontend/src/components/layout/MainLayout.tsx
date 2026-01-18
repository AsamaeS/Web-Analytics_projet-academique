import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Toaster } from '@/components/ui/toaster'

export function MainLayout() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 container py-6">
                <Outlet />
            </div>
            <Toaster />
        </div>
    )
}
