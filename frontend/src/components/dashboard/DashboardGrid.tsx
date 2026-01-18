import { useAnalytics, useInsights } from '@/hooks/useAnalytics'
import { InsightsPanel } from '@/components/analytics/InsightsPanel'
import OverviewCards from './OverviewCards'
import TimelineChart from './TimelineChart'
import { SourceRelevanceWidget } from './widgets/SourceRelevanceWidget'
import { ScrapedContentWidget } from './widgets/ScrapedContentWidget'
import { SentimentDistributionWidget } from './widgets/SentimentDistributionWidget'
import { TopKeywordsWidget } from './widgets/TopKeywordsWidget'
import { EntitySummaryWidget } from './widgets/EntitySummaryWidget'
import { Loader2 } from 'lucide-react'
import { DecisionAssistant } from './DecisionAssistant'

type ProjectType = "investment" | "market_research" | "strategic_watch" | "competitive_intelligence"

export default function DashboardGrid({ projectId, projectType }: { projectId: string, projectType?: ProjectType }) {
    const { overview, timeline } = useAnalytics(projectId)
    const insights = useInsights(projectId)

    if (overview.isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

    const renderSecondaryWidgets = () => {
        switch (projectType) {
            case 'investment':
                return (
                    <>
                        <div className="lg:col-span-3">
                            <SentimentDistributionWidget projectId={projectId} />
                        </div>
                        <div className="lg:col-span-4">
                            <TimelineChart data={timeline.data} projectId={projectId} />
                        </div>
                        <SourceRelevanceWidget projectId={projectId} />
                    </>
                )
            case 'market_research':
                return (
                    <>
                        <div className="lg:col-span-4">
                            <TopKeywordsWidget projectId={projectId} />
                        </div>
                        <div className="lg:col-span-3">
                            <SentimentDistributionWidget projectId={projectId} />
                        </div>
                        <SourceRelevanceWidget projectId={projectId} />
                        <ScrapedContentWidget projectId={projectId} />
                    </>
                )
            case 'competitive_intelligence':
                return (
                    <>
                        <div className="lg:col-span-4">
                            <SourceRelevanceWidget projectId={projectId} />
                        </div>
                        <div className="lg:col-span-3">
                            <EntitySummaryWidget projectId={projectId} />
                        </div>
                        <ScrapedContentWidget projectId={projectId} />
                    </>
                )
            case 'strategic_watch':
            default:
                return (
                    <>
                        <div className="lg:col-span-4">
                            <TimelineChart data={timeline.data} projectId={projectId} />
                        </div>
                        <div className="lg:col-span-3">
                            <EntitySummaryWidget projectId={projectId} />
                        </div>
                        <SourceRelevanceWidget projectId={projectId} />
                        <ScrapedContentWidget projectId={projectId} />
                    </>
                )
        }
    }

    return (
        <div className="space-y-6">
            <OverviewCards data={overview.data} />

            {insights.data && (
                <InsightsPanel insights={insights.data} />
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {renderSecondaryWidgets()}
            </div>
            {/* Floating AI Decision Assistant */}
            <DecisionAssistant projectId={projectId} />
        </div>
    )
}
