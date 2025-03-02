"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock data - replace with actual API calls in production
const mockData = {
  inventoryTrends: [
    { month: "Jan", inStock: 1200, lowStock: 150, outOfStock: 50 },
    { month: "Feb", inStock: 1400, lowStock: 120, outOfStock: 45 },
    { month: "Mar", inStock: 1300, lowStock: 180, outOfStock: 60 },
    { month: "Apr", inStock: 1700, lowStock: 160, outOfStock: 40 },
    { month: "May", inStock: 1600, lowStock: 140, outOfStock: 35 },
    { month: "Jun", inStock: 1800, lowStock: 130, outOfStock: 30 },
  ],
  categoryDistribution: [
    { name: "Electronics", value: 400 },
    { name: "Clothing", value: 300 },
    { name: "Food", value: 200 },
    { name: "Books", value: 150 },
    { name: "Others", value: 100 },
  ],
  locationData: [
    { location: "Warehouse A", total: 800 },
    { location: "Store 1", total: 400 },
    { location: "Store 2", total: 300 },
    { location: "Store 3", total: 200 },
  ],
  recentTransactions: [
    {
      id: 1,
      type: "stock_in",
      item: "iPhone 14 Pro",
      quantity: 50,
      location: "Warehouse A",
      date: "2025-03-02",
    },
    {
      id: 2,
      type: "stock_out",
      item: "MacBook Pro",
      quantity: -20,
      location: "Store 1",
      date: "2025-03-02",
    },
    {
      id: 3,
      type: "adjustment",
      item: "AirPods Pro",
      quantity: -5,
      location: "Store 2",
      date: "2025-03-01",
    },
    {
      id: 4,
      type: "stock_in",
      item: "iPad Pro",
      quantity: 30,
      location: "Warehouse A",
      date: "2025-03-01",
    },
  ],
}

const COLORS = ["#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981"]

export default function DashboardPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [timeRange, setTimeRange] = React.useState("7d")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
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
                    {t("export_report")}
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              <div className="container mx-auto p-6 space-y-6">
                {/* Inventory Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("inventory_trends")}</CardTitle>
                    <CardDescription>{t("stock_levels_over_time")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockData.inventoryTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="inStock"
                            name={t("in_stock")}
                            stroke="#8b5cf6"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="lowStock"
                            name={t("low_stock")}
                            stroke="#f59e0b"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="outOfStock"
                            name={t("out_of_stock")}
                            stroke="#ef4444"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Category Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("category_distribution")}</CardTitle>
                      <CardDescription>{t("items_by_category")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mockData.categoryDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {mockData.categoryDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location-based Inventory */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("inventory_by_location")}</CardTitle>
                      <CardDescription>{t("stock_distribution")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mockData.locationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="location" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("recent_transactions")}</CardTitle>
                    <CardDescription>{t("latest_inventory_movements")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("type")}</TableHead>
                          <TableHead>{t("item")}</TableHead>
                          <TableHead>{t("location")}</TableHead>
                          <TableHead className="text-right">{t("quantity")}</TableHead>
                          <TableHead className="text-right">{t("date")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockData.recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  transaction.type === "stock_in"
                                    ? "bg-green-100 text-green-800"
                                    : transaction.type === "stock_out"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {t(transaction.type)}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{transaction.item}</TableCell>
                            <TableCell>{transaction.location}</TableCell>
                            <TableCell className="text-right">
                              <span className={transaction.quantity > 0 ? "text-green-600" : "text-red-600"}>
                                {transaction.quantity > 0 ? "+" : ""}
                                {transaction.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{transaction.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

