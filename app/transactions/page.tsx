"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  CalendarIcon,
  Download,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import type { DateRange } from "react-day-picker"
import { getTransactions, getTransactionDetails } from "@/app/actions"
import { Avatar } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Transaction {
  id: number
  type: "stock_in" | "stock_out" | "adjust" | "move"
  quantity: number
  created_at: string
  memo: string
  items: {
    id: number
    name: string
    sku: string
  }
  from_locations?: {
    id: number
    name: string
  }
  to_locations?: {
    id: number
    name: string
  }
  suppliers?: {
    id: number
    name: string
  }
}

export default function TransactionsPage() {
  const { t } = useLanguage()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(),
  })
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadTransactions = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTransactions(date?.from?.toISOString(), date?.to?.toISOString())
      setTransactions(data)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
    }
  }, [date])

  React.useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "stock_in":
        return <ArrowDownToLine className="h-4 w-4 text-blue-500" />
      case "stock_out":
        return <ArrowUpFromLine className="h-4 w-4 text-red-500" />
      case "adjust":
        return <ArrowUpDown className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "stock_in":
        return t("stock_in")
      case "stock_out":
        return t("stock_out")
      case "adjust":
        return t("adjust")
      case "move":
        return t("move")
      default:
        return type
    }
  }

  const handleExportExcel = () => {
    // Implement export functionality
    console.log("Exporting to Excel...")
  }

  const handleTransactionSelect = async (transaction: Transaction) => {
    try {
      const details = await getTransactionDetails(transaction.id)
      setSelectedTransaction(details)
    } catch (error) {
      console.error("Failed to load transaction details:", error)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">{t("transactions")}</h1>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("export_excel")}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{t("date_range")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  {t("filter_by")}
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-hidden">
              <div className="grid h-full md:grid-cols-[1fr,1fr] divide-x">
                {/* Transactions List */}
                <div className="overflow-auto p-4 space-y-2">
                  {transactions.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedTransaction?.id === transaction.id && "bg-muted",
                      )}
                      onClick={() => handleTransactionSelect(transaction)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-muted">{getTransactionIcon(transaction.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{getTransactionLabel(transaction.type)}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(transaction.created_at), "h:mm a")}
                            </div>
                          </div>
                          <div className="text-sm">
                            {transaction.items?.name} ({transaction.items?.sku})
                          </div>
                          <div className="text-sm">
                            {transaction.quantity > 0 ? "+" : ""}
                            {transaction.quantity} {t("items")}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>
                              {transaction.type === "stock_in" && transaction.suppliers?.name}
                              {transaction.type === "move" && (
                                <>
                                  {transaction.from_locations?.name} → {transaction.to_locations?.name}
                                </>
                              )}
                            </div>
                            <div>{format(new Date(transaction.created_at), "MMM d, yyyy")}</div>
                          </div>
                          {transaction.memo && <div className="text-sm text-muted-foreground">{transaction.memo}</div>}
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="text-sm text-center text-muted-foreground py-4">
                    {t("transaction_history_notice")}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="p-6">
                  {selectedTransaction ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{t("transaction_details")}</h2>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Print</DropdownMenuItem>
                            <DropdownMenuItem>Export</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-1">
                          <div className="text-sm font-medium">{t("type")}</div>
                          <div>{getTransactionLabel(selectedTransaction.type)}</div>
                        </div>

                        <div className="grid gap-1">
                          <div className="text-sm font-medium">{t("date")}</div>
                          <div>{format(new Date(selectedTransaction.created_at), "PPP p")}</div>
                        </div>

                        {selectedTransaction.type === "stock_in" && selectedTransaction.suppliers && (
                          <div className="grid gap-1">
                            <div className="text-sm font-medium">{t("supplier")}</div>
                            <div>{selectedTransaction.suppliers.name}</div>
                          </div>
                        )}

                        {selectedTransaction.type === "move" && (
                          <>
                            <div className="grid gap-1">
                              <div className="text-sm font-medium">{t("from_location")}</div>
                              <div>{selectedTransaction.from_locations?.name}</div>
                            </div>
                            <div className="grid gap-1">
                              <div className="text-sm font-medium">{t("to_location")}</div>
                              <div>{selectedTransaction.to_locations?.name}</div>
                            </div>
                          </>
                        )}

                        <div className="grid gap-1">
                          <div className="text-sm font-medium">{t("items")}</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <div className="bg-muted w-full h-full flex items-center justify-center text-xs font-medium">
                                  {selectedTransaction.items?.name?.[0]}
                                </div>
                              </Avatar>
                              <div>
                                <div>{selectedTransaction.items?.name}</div>
                                <div className="text-sm text-muted-foreground">{selectedTransaction.items?.sku}</div>
                              </div>
                              <div className="ml-auto font-medium">
                                {selectedTransaction.quantity > 0 ? "+" : ""}
                                {selectedTransaction.quantity}
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedTransaction.memo && (
                          <div className="grid gap-1">
                            <div className="text-sm font-medium">{t("memo")}</div>
                            <div>{selectedTransaction.memo}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      {t("select_transaction")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

