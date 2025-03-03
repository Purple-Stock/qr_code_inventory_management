"use client"
import { CreditCard, Package2, SettingsIcon, User } from "lucide-react"
import MainNav from "@/components/main-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"

const formatCurrency = (amount: number, language: string) => {
  if (language === "pt") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount * 5) // Converting USD to BRL (approximate rate)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function SettingsPage() {
  const { t, language } = useLanguage()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <MainNav />
        <SidebarInset className="flex-1">
          <div className="h-full flex flex-col">
            <header className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <SettingsIcon className="h-6 w-6" />
                  {t("settings")}
                </h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">
                <Tabs defaultValue="billing" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="billing" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t("billing")}
                    </TabsTrigger>
                    <TabsTrigger value="account" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("account")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="billing" className="space-y-6">
                    {/* Current Plan */}
                    <Card className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold">{t("current_plan")}</h2>
                          <div className="flex items-center gap-2">
                            <Package2 className="h-5 w-5 text-purple-600" />
                            <span className="text-lg font-medium">Free Plan</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{t("free_plan_description")}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2">
                          <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                            {t("upgrade_to_pro")}
                          </Button>
                          <p className="text-xs text-muted-foreground">{t("cancel_anytime")}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Plan Features */}
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="p-6">
                        <h3 className="font-semibold mb-2">{t("free_plan")}</h3>
                        <div className="text-2xl font-bold mb-4">{formatCurrency(0, language)}/mo</div>
                        <ul className="space-y-2 text-sm mb-6">
                          <li className="flex items-center gap-2">✓ {t("up_to_100_items")}</li>
                          <li className="flex items-center gap-2">✓ {t("basic_analytics")}</li>
                          <li className="flex items-center gap-2">✓ {t("email_support")}</li>
                        </ul>
                        <Button variant="outline" className="w-full" disabled>
                          {t("current_plan")}
                        </Button>
                      </Card>

                      <Card className="p-6 border-purple-600 bg-purple-50/50 dark:bg-purple-950/20">
                        <h3 className="font-semibold mb-2">{t("pro_plan")}</h3>
                        <div className="text-2xl font-bold mb-4">{formatCurrency(29, language)}/mo</div>
                        <ul className="space-y-2 text-sm mb-6">
                          <li className="flex items-center gap-2">✓ {t("unlimited_items")}</li>
                          <li className="flex items-center gap-2">✓ {t("advanced_analytics")}</li>
                          <li className="flex items-center gap-2">✓ {t("priority_support")}</li>
                          <li className="flex items-center gap-2">✓ {t("custom_reports")}</li>
                          <li className="flex items-center gap-2">✓ {t("api_access")}</li>
                        </ul>
                        <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700">
                          {t("upgrade_now")}
                        </Button>
                      </Card>

                      <Card className="p-6">
                        <h3 className="font-semibold mb-2">{t("enterprise_plan")}</h3>
                        <div className="text-2xl font-bold mb-4">{t("custom_pricing")}</div>
                        <ul className="space-y-2 text-sm mb-6">
                          <li className="flex items-center gap-2">✓ {t("everything_in_pro")}</li>
                          <li className="flex items-center gap-2">✓ {t("dedicated_support")}</li>
                          <li className="flex items-center gap-2">✓ {t("custom_integration")}</li>
                          <li className="flex items-center gap-2">✓ {t("sla_guarantee")}</li>
                        </ul>
                        <Button variant="outline" className="w-full">
                          {t("contact_sales")}
                        </Button>
                      </Card>
                    </div>

                    {/* Payment History */}
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">{t("payment_history")}</h3>
                      <div className="text-sm text-muted-foreground text-center py-8">{t("no_payment_history")}</div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="account">
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">{t("account_settings")}</h2>
                      <p className="text-sm text-muted-foreground">{t("coming_soon")}</p>
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

