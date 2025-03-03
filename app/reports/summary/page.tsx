import { Suspense } from "react"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Box,
  DollarSign,
  Download,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getSummaryMetrics, getRecentActivity, getStockWarnings, getTopItems } from "../actions"

function LoadingMessage() {
  const { t } = useLanguage()
  return <div className="p-6">{t("loading")}</div>
}

function ErrorMessage() {
  const { t } = useLanguage()
  return <div className="p-6">{t("error_loading_metrics")}</div>
}

async function SummaryMetrics() {
  const { t } = useLanguage()
  const metrics = await getSummaryMetrics()

  if (!metrics) {
    return <ErrorMessage />
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("total_items")}</CardTitle>
          <Box className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalItems}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.monthlyChange > 0 ? "+" : ""}
            {metrics.monthlyChange} {t("from_last_month")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("inventory_value")}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{t("current_total_value")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("low_stock_items")}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.lowStock}</div>
          <p className="text-xs text-muted-foreground">{t("items_below_minimum")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("out_of_stock")}</CardTitle>
          <Package className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.outOfStock}</div>
          <p className="text-xs text-muted-foreground">{t("items_out_of_stock")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function RecentActivitySection() {
  const { t } = useLanguage()
  const recentActivity = await getRecentActivity()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recent_activity")}</CardTitle>
        <CardDescription>{t("last_24_hours")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "stock_in"
                      ? "bg-green-100 text-green-600"
                      : activity.type === "stock_out"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {activity.type === "stock_in" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : activity.type === "stock_out" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.item}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.type === "stock_in"
                      ? t("stock_in")
                      : activity.type === "stock_out"
                        ? t("stock_out")
                        : t("adjustment")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {activity.type !== "stock_out" ? "+" : "-"}
                  {Math.abs(activity.quantity)}
                </p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function StockWarningsSection() {
  const { t } = useLanguage()
  const stockWarnings = await getStockWarnings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stock_warnings")}</CardTitle>
        <CardDescription>{t("items_requiring_attention")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockWarnings.map((warning) => (
            <Alert key={warning.id} variant={warning.currentStock === 0 ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{warning.item}</p>
                    <p className="text-sm text-muted-foreground">{warning.sku}</p>
                  </div>
                  <Badge variant={warning.currentStock === 0 ? "destructive" : "default"}>
                    {warning.currentStock === 0 ? t("out_of_stock") : t("low_stock")}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function TopItemsSection() {
  const { t } = useLanguage()
  const topItems = await getTopItems()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("top_moving_items")}</CardTitle>
        <CardDescription>{t("most_active_items")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("item")}</TableHead>
              <TableHead>{t("sku")}</TableHead>
              <TableHead className="text-right">{t("movements")}</TableHead>
              <TableHead className="text-right">{t("trend")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell className="text-right">{item.movements}</TableCell>
                <TableCell className="text-right">
                  {item.trend === "up" ? (
                    <TrendingUp className="ml-auto h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="ml-auto h-4 w-4 text-red-500" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

async function SummaryContent() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Suspense fallback={<LoadingMessage />}>
        <SummaryMetrics />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<LoadingMessage />}>
          <RecentActivitySection />
        </Suspense>

        <Suspense fallback={<LoadingMessage />}>
          <StockWarningsSection />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingMessage />}>
        <TopItemsSection />
      </Suspense>
    </div>
  )
}

export default function SummaryPage() {
  const { t } = useLanguage()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("summary")}</h1>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t("export_report")}
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              <Suspense fallback={<LoadingMessage />}>
                <SummaryContent />
              </Suspense>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

