"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Calendar, TrendingUp, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  getPerformanceMetrics,
  getSalesTrend,
  getStockTurnover,
  getStockoutAnalysis,
  getTopPerformers,
  getLowPerformers,
  type TimeRange,
} from "./actions"

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7d")
  const [analysisType, setAnalysisType] = React.useState("performance")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [metrics, setMetrics] = React.useState({
    inventoryAccuracy: 0,
    orderFulfillment: 0,
    stockTurnover: 0,
    deadStockPercentage: 0,
  })
  const [salesTrend, setSalesTrend] = React.useState([])
  const [stockTurnover, setStockTurnover] = React.useState([])
  const [stockoutAnalysis, setStockoutAnalysis] = React.useState([])
  const [topPerformers, setTopPerformers] = React.useState([])
  const [lowPerformers, setLowPerformers] = React.useState([])

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [metricsData, salesData, turnoverData, stockoutData, topData, lowData] = await Promise.all([
        getPerformanceMetrics(timeRange),
        getSalesTrend(timeRange),
        getStockTurnover(),
        getStockoutAnalysis(timeRange),
        getTopPerformers(),
        getLowPerformers(),
      ])

      if (metricsData) setMetrics(metricsData)
      if (salesData) setSalesTrend(salesData)
      if (turnoverData) setStockTurnover(turnoverData)
      if (stockoutData) setStockoutAnalysis(stockoutData)
      if (topData) setTopPerformers(topData)
      if (lowData) setLowPerformers(lowData)
    } catch (err) {
      setError(t("error_fetching_data"))
      console.error("Error fetching analytics data:", err)
    } finally {
      setLoading(false)
    }
  }, [timeRange, t])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">{error}</h2>
          <Button onClick={() => fetchData()} className="mt-4">
            {t("try_again")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("analytics")}</h1>
                <div className="flex items-center gap-4">
                  <Select defaultValue={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                    <SelectTrigger className="w-[180px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder={t("select_time_range")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">{t("last_7_days")}</SelectItem>
                      <SelectItem value="30d">{t("last_30_days")}</SelectItem>
                      <SelectItem value="90d">{t("last_90_days")}</SelectItem>
                      <SelectItem value="12m">{t("last_12_months")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {t("export_analytics")}
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              <div className="container mx-auto p-6 space-y-6">
                {loading ? (
                  <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                      <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Performance Metrics */}
                    <div className="grid gap-6 md:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t("inventory_accuracy")}</CardTitle>
                          <div className={metrics.inventoryAccuracy >= 95 ? "text-green-500" : "text-yellow-500"}>
                            <TrendingUp className="h-4 w-4" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.inventoryAccuracy.toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.inventoryAccuracy >= 95 ? t("good_accuracy") : t("needs_improvement")}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t("order_fulfillment")}</CardTitle>
                          <div className={metrics.orderFulfillment >= 90 ? "text-green-500" : "text-yellow-500"}>
                            <TrendingUp className="h-4 w-4" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.orderFulfillment.toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.orderFulfillment >= 90 ? t("good_fulfillment") : t("needs_improvement")}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t("stock_turnover_rate")}</CardTitle>
                          <div className={metrics.stockTurnover >= 8 ? "text-green-500" : "text-yellow-500"}>
                            <TrendingUp className="h-4 w-4" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.stockTurnover.toFixed(1)}</div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.stockTurnover >= 8 ? t("good_turnover") : t("needs_improvement")}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t("dead_stock")}</CardTitle>
                          <div className={metrics.deadStockPercentage <= 5 ? "text-green-500" : "text-red-500"}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.deadStockPercentage.toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.deadStockPercentage <= 5 ? t("good_stock_health") : t("needs_attention")}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="performance" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="performance">{t("performance_analysis")}</TabsTrigger>
                        <TabsTrigger value="turnover">{t("turnover_analysis")}</TabsTrigger>
                        <TabsTrigger value="stockout">{t("stockout_analysis")}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="performance" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>{t("sales_forecast_analysis")}</CardTitle>
                            <CardDescription>{t("sales_forecast_description")}</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="actual"
                                  name={t("actual_sales")}
                                  stroke="#8b5cf6"
                                  strokeWidth={2}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="forecast"
                                  name={t("forecasted_sales")}
                                  stroke="#94a3b8"
                                  strokeDasharray="5 5"
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <CardTitle>{t("top_performing_items")}</CardTitle>
                              <CardDescription>{t("by_turnover_and_profit")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {topPerformers.map((item) => (
                                  <div key={item.name} className="flex items-center">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{item.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {t("turnover")}: {item.turnover.toFixed(1)}x
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">+{item.profit_margin}%</div>
                                      <div className="text-sm text-muted-foreground">{t("profit_margin")}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>{t("low_performing_items")}</CardTitle>
                              <CardDescription>{t("needs_attention")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {lowPerformers.map((item) => (
                                  <div key={item.name} className="flex items-center">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{item.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {t("turnover")}: {item.turnover.toFixed(1)}x
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-red-600">{item.profit_margin}%</div>
                                      <div className="text-sm text-muted-foreground">{t("profit_margin")}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="turnover" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>{t("stock_turnover_by_category")}</CardTitle>
                            <CardDescription>{t("compared_to_industry")}</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stockTurnover}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="turnover" name={t("your_turnover")} fill="#8b5cf6" />
                                <Bar dataKey="industry_avg" name={t("industry_average")} fill="#94a3b8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="stockout" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>{t("stockout_frequency")}</CardTitle>
                            <CardDescription>{t("stockout_description")}</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={stockoutAnalysis}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="count"
                                  name={t("stockout_events")}
                                  stroke="#ef4444"
                                  fill="#fee2e2"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

