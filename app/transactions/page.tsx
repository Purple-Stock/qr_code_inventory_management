"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter, ArrowDownToLine, ArrowUpFromLine, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import type { DateRange } from "react-day-picker"

// Mock data - replace with actual API calls
const transactions = [
  {
    id: 1,
    type: "stock_in",
    items: 1,
    quantity: 44,
    date: "2025-01-29T13:10:00",
    user: "Matheus Puppe",
    memo: "teste",
  },
  {
    id: 2,
    type: "adjust",
    items: 1,
    quantity: 33,
    date: "2025-01-29T12:27:00",
    user: "Matheus Puppe",
    memo: "teste",
    details: "Initial quantity",
  },
]

export default function TransactionsPage() {
  const { t } = useLanguage()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(),
  })
  const [selectedTransaction, setSelectedTransaction] = React.useState<(typeof transactions)[0] | null>(null)

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
      default:
        return type
    }
  }

  const handleExportExcel = () => {
    // Implement export functionality
    console.log("Exporting to Excel...")
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
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-muted">{getTransactionIcon(transaction.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{getTransactionLabel(transaction.type)}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(transaction.date), "h:mm a")}
                            </div>
                          </div>
                          <div className="text-sm">
                            {transaction.items} {t("items")} / {transaction.type === "stock_in" ? "+" : ""}
                            {transaction.quantity}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>{transaction.user}</div>
                            <div>{format(new Date(transaction.date), "MMM d, yyyy")}</div>
                          </div>
                          {transaction.memo && <div className="text-sm text-muted-foreground">{transaction.memo}</div>}
                          {transaction.details && (
                            <div className="text-sm text-muted-foreground">▸ {transaction.details}</div>
                          )}
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
                      <h2 className="text-lg font-semibold">{t("transaction_details")}</h2>
                      {/* Add transaction details here */}
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

