"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Calendar, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
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

// Mock data - replace with actual API calls in production
const mockData = {
  salesTrend: [
    { month: "Jan", actual: 4000, forecast: 4100 },
    { month: "Feb", actual: 4500, forecast: 4300 },
    { month: "Mar", actual: 4200, forecast: 4400 },
    { month: "Apr", actual: 4800, forecast: 4600 },
    { month: "May", actual: 5000, forecast: 4800 },
    { month: "Jun", actual: 4900, forecast: 5000 },
  ],
  stockTurnover: [
    { category: "Electronics", turnover: 12.5, industry_avg: 10.2 },
    { category: "Clothing", turnover: 8.3, industry_avg: 9.0 },
    { category: "Food", turnover: 15.7, industry_avg: 14.5 },
    { category: "Books", turnover: 6.2, industry_avg: 7.0 },
    { category: "Others", turnover: 7.8, industry_avg: 8.5 },
  ],
  performanceMetrics: {
    inventory_accuracy: 98.5,
    order_fulfillment: 95.2,
    stock_turnover: 12.3,
    dead_stock_percentage: 3.2,
  },
  stockoutAnalysis: [
    { date: "2025-01", count: 12 },
    { date: "2025-02", count: 8 },
    { date: "2025-03", count: 15 },
    { date: "2025-04", count: 10 },
    { date: "2025-05", count: 6 },
    { date: "2025-06", count: 9 },
  ],
  topPerformers: [
    { name: "iPhone 14 Pro", turnover: 15.2, profit_margin: 32 },
    { name: "MacBook Pro", turnover: 12.8, profit_margin: 28 },
    { name: "AirPods Pro", turnover: 18.5, profit_margin: 45 },
    { name: "iPad Pro", turnover: 10.2, profit_margin: 30 },
  ],
  lowPerformers: [
    { name: "Lightning Cable", turnover: 2.1, profit_margin: 15 },
    { name: "Phone Case", turnover: 1.8, profit_margin: 12 },
    { name: "Screen Protector", turnover: 1.5, profit_margin: 10 },
    { name: "Charging Dock", turnover: 1.2, profit_margin: 8 },
  ],
}

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [timeRange, setTimeRange] = React.useState("7d")
  const [analysisType, setAnalysisType] = React.useState("performance")

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
                  <Select defaultValue={timeRange} onValueChange={setTimeRange}>
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
                {/* Performance Metrics */}
                <div className="grid gap-6 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("inventory_accuracy")}</CardTitle>
                      <div className="text-green-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockData.performanceMetrics.inventory_accuracy}%</div>
                      <p className="text-xs text-muted-foreground">+2.1% {t("from_previous")}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("order_fulfillment")}</CardTitle>
                      <div className="text-green-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockData.performanceMetrics.order_fulfillment}%</div>
                      <p className="text-xs text-muted-foreground">+1.5% {t("from_previous")}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("stock_turnover_rate")}</CardTitle>
                      <div className="text-yellow-500">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockData.performanceMetrics.stock_turnover}</div>
                      <p className="text-xs text-muted-foreground">-0.8 {t("from_previous")}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("dead_stock")}</CardTitle>
                      <div className="text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockData.performanceMetrics.dead_stock_percentage}%</div>
                      <p className="text-xs text-muted-foreground">+0.5% {t("from_previous")}</p>
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
                          <LineChart data={mockData.salesTrend}>
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
                            {mockData.topPerformers.map((item) => (
                              <div key={item.name} className="flex items-center">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {t("turnover")}: {item.turnover}x
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
                            {mockData.lowPerformers.map((item) => (
                              <div key={item.name} className="flex items-center">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {t("turnover")}: {item.turnover}x
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
                          <BarChart data={mockData.stockTurnover}>
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
                          <AreaChart data={mockData.stockoutAnalysis}>
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
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

