import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, Loader2, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ProjectCreate() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const createProject = useCreateProject()
    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState({
        name: '',
        type: 'investment',
        domain: '',
        description: '',
        keywords: [] as string[],
        settings: {
            crawl_frequency: 'daily',
            max_depth: 3,
            language: 'fr',
            enable_llm_analysis: true
        }
    })

    const [keywordInput, setKeywordInput] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name.includes('.')) {
            const [parent, child] = name.split('.')
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const addKeyword = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            e.preventDefault()
            if (!formData.keywords.includes(keywordInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    keywords: [...prev.keywords, keywordInput.trim()]
                }))
            }
            setKeywordInput('')
        }
    }

    const removeKeyword = (kw: string) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== kw)
        }))
    }

    const handleSubmit = async () => {
        try {
            if (!formData.name) {
                toast({ title: "Error", description: "Project name is required", variant: "destructive" })
                return
            }
            if (formData.keywords.length === 0) {
                toast({ title: "Error", description: "Add at least one keyword", variant: "destructive" })
                return
            }

            await createProject.mutateAsync({
                ...formData,
                settings: {
                    ...formData.settings,
                    crawl_frequency: formData.settings.crawl_frequency as 'daily' | 'weekly' | 'manual'
                }
            })
            toast({ title: "Success", description: "Project created successfully" })
            navigate('/')
        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error",
                description: error.message || "Failed to create project",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex justify-center items-start min-h-[calc(100vh-100px)] pt-10">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>Step {step} of 3</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Hospital Investment Watch"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Project Type</Label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="investment">Investment Analysis</option>
                                        <option value="market_research">Market Research</option>
                                        <option value="strategic_watch">Strategic Watch</option>
                                        <option value="competitive_intelligence">Competitive Intelligence</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="domain">Domain</Label>
                                    <Input
                                        id="domain"
                                        name="domain"
                                        placeholder="e.g. Healthcare"
                                        value={formData.domain}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe your project goals..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <Label>Keywords</Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Add keywords to monitor. Press Enter to add.
                                </p>
                                <Input
                                    placeholder="Type keyword and press Enter..."
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={addKeyword}
                                    autoFocus
                                />
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {formData.keywords.map(kw => (
                                        <div key={kw} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            {kw}
                                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeKeyword(kw)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Crawl Frequency</Label>
                                    <select
                                        name="settings.crawl_frequency"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.settings.crawl_frequency}
                                        onChange={handleInputChange}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <select
                                        name="settings.language"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.settings.language}
                                        onChange={handleInputChange}
                                    >
                                        <option value="fr">French</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-muted p-4 rounded-md">
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <ul className="text-sm space-y-1">
                                    <li><strong>Name:</strong> {formData.name}</li>
                                    <li><strong>Type:</strong> {formData.type}</li>
                                    <li><strong>Keywords:</strong> {formData.keywords.length} monitored</li>
                                    <li><strong>Frequency:</strong> {formData.settings.crawl_frequency}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => {
                        if (step > 1) setStep(step - 1)
                        else navigate('/')
                    }}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !formData.name}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={createProject.isPending}>
                            {createProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Project
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
