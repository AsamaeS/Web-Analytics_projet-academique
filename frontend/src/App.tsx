import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
// Pages will be lazy loaded or imported directly
import Home from '@/pages/Home'
import ProjectCreate from '@/pages/ProjectCreate'
import ProjectDetail from '@/pages/ProjectDetail'

// Placeholder for now
const NotFound = () => <div className="text-center mt-20">404 - Page Not Found</div>

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects/new" element={<ProjectCreate />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
