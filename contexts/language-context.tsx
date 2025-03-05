"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "pt"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, options?: { [key: string]: string }) => string
}

const translations = {
  // General
  inventory_management_system: {
    en: "Inventory Management System",
    pt: "Sistema de Gestão de Estoque",
  },
  item_list: {
    en: "Item List",
    pt: "Lista de Itens",
  },
  stock_in: {
    en: "Stock In",
    pt: "Entrada",
  },
  stock_out: {
    en: "Stock Out",
    pt: "Saída",
  },
  adjust_stock: {
    en: "Adjust Stock",
    pt: "Ajustar Estoque",
  },
  transactions: {
    en: "Transactions",
    pt: "Transações",
  },
  purchase_sales: {
    en: "Purchase & Sales",
    pt: "Compras & Vendas",
  },
  print_barcode: {
    en: "Print Labels",
    pt: "Imprimir Etiquetas",
  },
  label_design: {
    en: "Label Design",
    pt: "Design da Etiqueta",
  },
  design: {
    en: "Design",
    pt: "Design",
  },
  settings: {
    en: "Settings",
    pt: "Configurações",
  },
  upgrade: {
    en: "Upgrade",
    pt: "Atualizar",
  },
  user_guide: {
    en: "User Guide",
    pt: "Guia do Usuário",
  },
  reports: {
    en: "Reports",
    pt: "Relatórios",
  },
  summary: {
    en: "Summary",
    pt: "Resumo",
  },
  dashboard: {
    en: "Dashboard",
    pt: "Dashboard",
  },
  analytics: {
    en: "Analytics",
    pt: "Análise",
  },
  locations: {
    en: "Locations",
    pt: "Localizações",
  },
  categories: {
    en: "Categories",
    pt: "Categorias",
  },
  search_items: {
    en: "Search items...",
    pt: "Buscar itens...",
  },
  all_categories: {
    en: "All Categories",
    pt: "Todas as Categorias",
  },
  add_item: {
    en: "Add Item",
    pt: "Adicionar Item",
  },
  export_csv: {
    en: "Export CSV",
    pt: "Exportar CSV",
  },
  import_csv: {
    en: "Import CSV",
    pt: "Importar CSV",
  },
  scan: {
    en: "Scan",
    pt: "Escanear",
  },
  previous: {
    en: "Previous",
    pt: "Anterior",
  },
  next: {
    en: "Next",
    pt: "Próximo",
  },
  showing_items: {
    en: "Showing {0} items",
    pt: "Mostrando {0} itens",
  },
  items_list: {
    en: "Items List",
    pt: "Lista de Itens",
  },
  name: {
    en: "Name",
    pt: "Nome",
  },
  sku: {
    en: "SKU",
    pt: "SKU",
  },
  category: {
    en: "Category",
    pt: "Categoria",
  },
  in_stock: {
    en: "In Stock",
    pt: "Em Estoque",
  },
  unit_price: {
    en: "Unit Price",
    pt: "Preço Unitário",
  },
  edit: {
    en: "Edit",
    pt: "Editar",
  },
  duplicate: {
    en: "Duplicate",
    pt: "Duplicar",
  },
  delete: {
    en: "Delete",
    pt: "Excluir",
  },
  new_item: {
    en: "New Item",
    pt: "Novo Item",
  },
  item_information: {
    en: "Item Information",
    pt: "Informações do Item",
  },
  generate: {
    en: "Generate",
    pt: "Gerar",
  },
  barcode: {
    en: "Barcode",
    pt: "Código de Barras",
  },
  cost: {
    en: "Cost",
    pt: "Custo",
  },
  price: {
    en: "Price",
    pt: "Preço",
  },
  item_attribute: {
    en: "Item Attribute",
    pt: "Atributo do Item",
  },
  edit_attribute: {
    en: "Edit attribute",
    pt: "Editar atributo",
  },
  type: {
    en: "Type",
    pt: "Tipo",
  },
  brand: {
    en: "Brand",
    pt: "Marca",
  },
  initial_quantity: {
    en: "Initial Quantity",
    pt: "Quantidade Inicial",
  },
  location: {
    en: "Location",
    pt: "Localização",
  },
  submit: {
    en: "Submit",
    pt: "Enviar",
  },
  cancel: {
    en: "Cancel",
    pt: "Cancelar",
  },
  sku_help: {
    en: "SKU Help",
    pt: "Ajuda SKU",
  },
  click_generate_barcode: {
    en: "Click the 'Generate' button to create a barcode",
    pt: "Clique no botão 'Gerar' para criar um código de barras",
  },
  input_text: {
    en: "Input text",
    pt: "Digite o texto",
  },
  input_initial_quantity: {
    en: "Input initial quantity.",
    pt: "Digite a quantidade inicial.",
  },
  stock_in_title: {
    en: "Stock In",
    pt: "Entrada de Estoque",
  },
  supplier: {
    en: "Supplier",
    pt: "Fornecedor",
  },
  date: {
    en: "Date",
    pt: "Data",
  },
  memo: {
    en: "Memo",
    pt: "Observação",
  },
  items: {
    en: "Items",
    pt: "Itens",
  },
  current_stock: {
    en: "Current Stock",
    pt: "Estoque Atual",
  },
  quantity: {
    en: "Quantity",
    pt: "Quantidade",
  },
  save_draft: {
    en: "Save Draft",
    pt: "Salvar Rascunho",
  },
  import_excel: {
    en: "Import Excel",
    pt: "Importar Excel",
  },
  scan_barcode: {
    en: "Scan Barcode",
    pt: "Escanear Código de Barras",
  },
  search_for_item: {
    en: "Search for an item to add...",
    pt: "Buscar um item para adicionar...",
  },
  search_inserted_items: {
    en: "Search inserted items...",
    pt: "Buscar itens inseridos...",
  },
  no_items_added: {
    en: "No items added yet",
    pt: "Nenhum item adicionado ainda",
  },
  remove: {
    en: "Remove",
    pt: "Remover",
  },
  stock_in_button: {
    en: "Stock In",
    pt: "Entrada de Estoque",
  },
  enter_supplier_name: {
    en: "Enter supplier name",
    pt: "Digite o nome do fornecedor",
  },
  default_location: {
    en: "Default Location",
    pt: "Localização Padrão",
  },
  warehouse: {
    en: "Warehouse",
    pt: "Armazém",
  },
  store: {
    en: "Store",
    pt: "Loja",
  },
  item_details: {
    en: "Item Details",
    pt: "Detalhes do Item",
  },
  current_status: {
    en: "Current Status",
    pt: "Status Atual",
  },
  available_stock: {
    en: "Available Stock",
    pt: "Estoque Disponível",
  },
  all: {
    en: "All",
    pt: "Todos",
  },
  in: {
    en: "In",
    pt: "Entrada",
  },
  out: {
    en: "Out",
    pt: "Saída",
  },
  adj: {
    en: "Adj",
    pt: "Ajuste",
  },
  move: {
    en: "Move",
    pt: "Mover",
  },
  qr_code: {
    en: "QR Code",
    pt: "Código QR",
  },
  download_qr: {
    en: "Download QR",
    pt: "Baixar QR",
  },
  print_qr: {
    en: "Print QR",
    pt: "Imprimir QR",
  },
  english: {
    en: "English",
    pt: "English",
  },
  portuguese: {
    en: "Portuguese",
    pt: "Português",
  },
  logout: {
    en: "Logout",
    pt: "Sair",
  },
  close: {
    en: "Close",
    pt: "Fechar",
  },
  stock_in_success: {
    en: "Successfully recorded 'Stock In'",
    pt: "Entrada de estoque registrada com sucesso",
  },
  stock_in_success_message: {
    en: "Total {totalQuantity} quantity(ies) of {itemCount} item(s) has been recorded for 'Stock In'",
    pt: "Total de {totalQuantity} quantidade(s) de {itemCount} item(ns) foi registrado para 'Entrada de Estoque'",
  },
  print_label: {
    en: "Print Label",
    pt: "Imprimir Etiqueta",
  },
  details: {
    en: "Details",
    pt: "Detalhes",
  },
  confirm: {
    en: "Confirm",
    pt: "Confirmar",
  },
  stock_in_details: {
    en: "Stock In Details",
    pt: "Detalhes da Entrada de Estoque",
  },
  total_items: {
    en: "Total Items",
    pt: "Total de Itens",
  },
  item: {
    en: "Item",
    pt: "Item",
  },
  previous_stock: {
    en: "Previous Stock",
    pt: "Estoque Anterior",
  },
  quantity_in: {
    en: "Quantity In",
    pt: "Quantidade Entrada",
  },
  enter_memo: {
    en: "Enter memo or notes...",
    pt: "Digite observações ou notas...",
  },
  import_items_from_csv: {
    en: "Import Items from CSV",
    pt: "Importar Itens do CSV",
  },
  upload_csv_description: {
    en: "Upload a CSV file with your items data or drag and drop it here.",
    pt: "Faça upload de um arquivo CSV com seus dados ou arraste e solte aqui.",
  },
  select_csv_file: {
    en: "Select CSV File",
    pt: "Selecionar Arquivo CSV",
  },
  or_drag_and_drop: {
    en: "or drag and drop",
    pt: "ou arraste e solte",
  },
  example_csv_format: {
    en: "Example CSV format:",
    pt: "Exemplo de formato CSV:",
  },
  submitting: {
    en: "Submitting...",
    pt: "Enviando...",
  },
  failed_to_generate_sku: {
    en: "Failed to generate SKU",
    pt: "Falha ao gerar SKU",
  },
  failed_to_generate_barcode: {
    en: "Failed to generate barcode",
    pt: "Falha ao gerar código de barras",
  },
  failed_to_create_item: {
    en: "Failed to create item",
    pt: "Falha ao criar item",
  },
  stock_out_title: {
    en: "Stock Out",
    pt: "Saída de Estoque",
  },
  stock_out_button: {
    en: "Stock Out",
    pt: "Saída",
  },
  failed_to_create_stock_out: {
    en: "Failed to create stock out",
    pt: "Falha ao criar saída de estoque",
  },
  insert_dummy_data: {
    en: "Insert Demo Data",
    pt: "Inserir Dados de Demonstração",
  },
  dummy_data_success: {
    en: "Demo data inserted successfully",
    pt: "Dados de demonstração inseridos com sucesso",
  },
  dummy_data_error: {
    en: "Failed to insert demo data",
    pt: "Falha ao inserir dados de demonstração",
  },
  loading: {
    en: "Loading",
    pt: "Carregando",
  },
  no_items_found: {
    en: "No items found. Add your first item to get started.",
    pt: "Nenhum item encontrado. Adicione seu primeiro item para começar.",
  },
  failed_to_fetch_items: {
    en: "Failed to fetch items",
    pt: "Falha ao buscar itens",
  },
  delete_confirmation: {
    en: "Delete Item",
    pt: "Excluir Item",
  },
  delete_item_confirmation: {
    en: "Are you sure you want to delete {itemName}? This action cannot be undone.",
    pt: "Tem certeza que deseja excluir {itemName}? Esta ação não pode ser desfeita.",
  },
  item_deleted_successfully: {
    en: "Item deleted successfully",
    pt: "Item excluído com sucesso",
  },
  failed_to_delete_item: {
    en: "Failed to delete item",
    pt: "Falha ao excluir item",
  },
  duplicating: {
    en: "Duplicating...",
    pt: "Duplicando...",
  },
  item_duplicated_successfully: {
    en: "Item duplicated successfully",
    pt: "Item duplicado com sucesso",
  },
  failed_to_duplicate_item: {
    en: "Failed to duplicate item",
    pt: "Falha ao duplicar item",
  },
  adjust_title: {
    en: "Adjust Stock",
    pt: "Ajustar Estoque",
  },
  adjust_button: {
    en: "Adjust",
    pt: "Ajustar",
  },
  bulk_add: {
    en: "Bulk Add",
    pt: "Adicionar em Massa",
  },
  reset: {
    en: "Reset",
    pt: "Resetar",
  },
  enter_memo_with_hash: {
    en: 'Enter a memo. Tip: Use "#" for easy search (e.g. #BoxHero).',
    pt: 'Digite uma observação. Dica: Use "#" para busca fácil (ex: #BoxHero).',
  },
  failed_to_create_adjustment: {
    en: "Failed to create stock adjustment",
    pt: "Falha ao criar ajuste de estoque",
  },
  edit_item: {
    en: "Edit Item",
    pt: "Editar Item",
  },
  item_not_found: {
    en: "Item not found",
    pt: "Item não encontrado",
  },
  failed_to_fetch_item: {
    en: "Failed to fetch item",
    pt: "Falha ao buscar item",
  },
  item_updated_successfully: {
    en: "Item updated successfully",
    pt: "Item atualizado com sucesso",
  },
  failed_to_update_item: {
    en: "Failed to update item",
    pt: "Falha ao atualizar item",
  },
  updating: {
    en: "Updating...",
    pt: "Atualizando...",
  },
  update: {
    en: "Update",
    pt: "Atualizar",
  },
  move_stock_title: {
    en: "Move Stock",
    pt: "Mover Estoque",
  },
  from_location: {
    en: "From Location",
    pt: "Localização de Origem",
  },
  to_location: {
    en: "To Location",
    pt: "Localização de Destino",
  },
  moving: {
    en: "Moving...",
    pt: "Movendo...",
  },
  move: {
    en: "Move",
    pt: "Mover",
  },
  failed_to_move_stock: {
    en: "Failed to move stock",
    pt: "Falha ao mover estoque",
  },
  move_stock: {
    en: "Move Stock",
    pt: "Mover Estoque",
  },
  export_report: {
    en: "Export Report",
    pt: "Exportar Relatório",
  },
  total_items: {
    en: "Total Items",
    pt: "Total de Itens",
  },
  from_last_month: {
    en: "from last month",
    pt: "em relação ao mês anterior",
  },
  inventory_value: {
    en: "Inventory Value",
    pt: "Valor do Estoque",
  },
  current_total_value: {
    en: "Current total value",
    pt: "Valor total atual",
  },
  low_stock_items: {
    en: "Low Stock Items",
    pt: "Itens com Baixo Estoque",
  },
  items_below_minimum: {
    en: "Items below minimum stock",
    pt: "Itens abaixo do estoque mínimo",
  },
  out_of_stock: {
    en: "Out of Stock",
    pt: "Sem Estoque",
  },
  items_out_of_stock: {
    en: "Items with zero stock",
    pt: "Itens com estoque zero",
  },
  recent_activity: {
    en: "Recent Activity",
    pt: "Atividade Recente",
  },
  last_24_hours: {
    en: "Last 24 hours of movement",
    pt: "Últimas 24 horas de movimentação",
  },
  stock_warnings: {
    en: "Stock Warnings",
    pt: "Alertas de Estoque",
  },
  items_requiring_attention: {
    en: "Items requiring attention",
    pt: "Itens que precisam de atenção",
  },
  low_stock: {
    en: "Low Stock",
    pt: "Baixo Estoque",
  },
  top_moving_items: {
    en: "Top Moving Items",
    pt: "Itens Mais Movimentados",
  },
  most_active_items: {
    en: "Most active items in your inventory",
    pt: "Itens mais ativos no seu estoque",
  },
  movements: {
    en: "Movements",
    pt: "Movimentações",
  },
  trend: {
    en: "Trend",
    pt: "Tendência",
  },
  adjustment: {
    en: "Adjustment",
    pt: "Ajuste",
  },
  select_time_range: {
    en: "Select time range",
    pt: "Selecionar período",
  },
  last_7_days: {
    en: "Last 7 days",
    pt: "Últimos 7 dias",
  },
  last_30_days: {
    en: "Last 30 days",
    pt: "Últimos 30 dias",
  },
  last_90_days: {
    en: "Last 90 days",
    pt: "Últimos 90 dias",
  },
  last_12_months: {
    en: "Last 12 months",
    pt: "Últimos 12 meses",
  },
  inventory_trends: {
    en: "Inventory Trends",
    pt: "Tendências de Estoque",
  },
  stock_levels_over_time: {
    en: "Stock levels over time",
    pt: "Níveis de estoque ao longo do tempo",
  },
  category_distribution: {
    en: "Category Distribution",
    pt: "Distribuição por Categoria",
  },
  items_by_category: {
    en: "Items by category",
    pt: "Itens por categoria",
  },
  inventory_by_location: {
    en: "Inventory by Location",
    pt: "Estoque por Localização",
  },
  stock_distribution: {
    en: "Stock distribution across locations",
    pt: "Distribuição de estoque por locais",
  },
  recent_transactions: {
    en: "Recent Transactions",
    pt: "Transações Recentes",
  },
  latest_inventory_movements: {
    en: "Latest inventory movements",
    pt: "Últimas movimentações de estoque",
  },
  type: {
    en: "Type",
    pt: "Tipo",
  },
  location: {
    en: "Location",
    pt: "Localização",
  },
  stock_in: {
    en: "Stock In",
    pt: "Entrada",
  },
  stock_out: {
    en: "Stock Out",
    pt: "Saída",
  },
  export_analytics: {
    en: "Export Analytics",
    pt: "Exportar Análise",
  },
  inventory_accuracy: {
    en: "Inventory Accuracy",
    pt: "Precisão do Inventário",
  },
  order_fulfillment: {
    en: "Order Fulfillment",
    pt: "Atendimento de Pedidos",
  },
  stock_turnover_rate: {
    en: "Stock Turnover Rate",
    pt: "Taxa de Giro de Estoque",
  },
  dead_stock: {
    en: "Dead Stock",
    pt: "Estoque Parado",
  },
  from_previous: {
    en: "from previous period",
    pt: "do período anterior",
  },
  performance_analysis: {
    en: "Performance Analysis",
    pt: "Análise de Desempenho",
  },
  turnover_analysis: {
    en: "Turnover Analysis",
    pt: "Análise de Giro",
  },
  stockout_analysis: {
    en: "Stockout Analysis",
    pt: "Análise de Ruptura",
  },
  sales_forecast_analysis: {
    en: "Sales Forecast Analysis",
    pt: "Análise de Previsão de Vendas",
  },
  sales_forecast_description: {
    en: "Actual vs forecasted sales performance",
    pt: "Desempenho real vs previsto de vendas",
  },
  actual_sales: {
    en: "Actual Sales",
    pt: "Vendas Reais",
  },
  forecasted_sales: {
    en: "Forecasted Sales",
    pt: "Vendas Previstas",
  },
  top_performing_items: {
    en: "Top Performing Items",
    pt: "Itens com Melhor Desempenho",
  },
  by_turnover_and_profit: {
    en: "By turnover and profit margin",
    pt: "Por giro e margem de lucro",
  },
  turnover: {
    en: "Turnover",
    pt: "Giro",
  },
  profit_margin: {
    en: "Profit Margin",
    pt: "Margem de Lucro",
  },
  low_performing_items: {
    en: "Low Performing Items",
    pt: "Itens com Baixo Desempenho",
  },
  needs_attention: {
    en: "Items that need attention",
    pt: "Itens que precisam de atenção",
  },
  stock_turnover_by_category: {
    en: "Stock Turnover by Category",
    pt: "Giro de Estoque por Categoria",
  },
  compared_to_industry: {
    en: "Compared to industry average",
    pt: "Comparado à média do setor",
  },
  your_turnover: {
    en: "Your Turnover",
    pt: "Seu Giro",
  },
  industry_average: {
    en: "Industry Average",
    pt: "Média do Setor",
  },
  stockout_frequency: {
    en: "Stockout Frequency",
    pt: "Frequência de Ruptura",
  },
  stockout_description: {
    en: "Number of stockout events over time",
    pt: "Número de eventos de ruptura ao longo do tempo",
  },
  stockout_events: {
    en: "Stockout Events",
    pt: "Eventos de Ruptura",
  },
  date_range: {
    en: "Date Range",
    pt: "Período",
  },
  filter_by: {
    en: "Filter by",
    pt: "Filtrar por",
  },
  transaction_details: {
    en: "Transaction Details",
    pt: "Detalhes da Transação",
  },
  select_transaction: {
    en: "Please select a transaction from the list on the left.",
    pt: "Por favor, selecione uma transação da lista à esquerda.",
  },
  transaction_history_notice: {
    en: "You can view past transactions for up to 30 days.",
    pt: "Você pode visualizar transações anteriores por até 30 dias.",
  },
  export_excel: {
    en: "Export Excel",
    pt: "Exportar Excel",
  },
  billing: {
    en: "Billing",
    pt: "Faturamento",
  },
  account: {
    en: "Account",
    pt: "Conta",
  },
  current_plan: {
    en: "Current Plan",
    pt: "Plano Atual",
  },
  free_plan_description: {
    en: "You are currently on the Free plan with limited features.",
    pt: "Você está atualmente no plano Gratuito com recursos limitados.",
  },
  upgrade_to_pro: {
    en: "Upgrade to Pro",
    pt: "Atualizar para Pro",
  },
  cancel_anytime: {
    en: "Cancel anytime. No questions asked.",
    pt: "Cancele a qualquer momento. Sem perguntas.",
  },
  free_plan: {
    en: "Free",
    pt: "Gratuito",
  },
  pro_plan: {
    en: "Pro",
    pt: "Pro",
  },
  enterprise_plan: {
    en: "Enterprise",
    pt: "Empresarial",
  },
  up_to_100_items: {
    en: "Up to 100 items",
    pt: "Até 100 itens",
  },
  basic_analytics: {
    en: "Basic analytics",
    pt: "Análises básicas",
  },
  email_support: {
    en: "Email support",
    pt: "Suporte por email",
  },
  unlimited_items: {
    en: "Unlimited items",
    pt: "Itens ilimitados",
  },
  advanced_analytics: {
    en: "Advanced analytics",
    pt: "Análises avançadas",
  },
  priority_support: {
    en: "Priority support",
    pt: "Suporte prioritário",
  },
  custom_reports: {
    en: "Custom reports",
    pt: "Relatórios personalizados",
  },
  api_access: {
    en: "API access",
    pt: "Acesso à API",
  },
  everything_in_pro: {
    en: "Everything in Pro",
    pt: "Tudo do plano Pro",
  },
  dedicated_support: {
    en: "Dedicated support",
    pt: "Suporte dedicado",
  },
  custom_integration: {
    en: "Custom integration",
    pt: "Integração personalizada",
  },
  sla_guarantee: {
    en: "SLA guarantee",
    pt: "Garantia de SLA",
  },
  upgrade_now: {
    en: "Upgrade Now",
    pt: "Atualizar Agora",
  },
  custom_pricing: {
    en: "Custom Pricing",
    pt: "Preço Personalizado",
  },
  contact_sales: {
    en: "Contact Sales",
    pt: "Contatar Vendas",
  },
  payment_history: {
    en: "Payment History",
    pt: "Histórico de Pagamentos",
  },
  no_payment_history: {
    en: "No payment history available",
    pt: "Nenhum histórico de pagamento disponível",
  },
  account_settings: {
    en: "Account Settings",
    pt: "Configurações da Conta",
  },
  coming_soon: {
    en: "Coming soon",
    pt: "Em breve",
  },
  data_center: {
    en: "Data Center",
    pt: "Central de Dados",
  },
  items: {
    en: "Items",
    pt: "Itens",
  },
  attributes: {
    en: "Attributes",
    pt: "Atributos",
  },
  partners: {
    en: "Partners",
    pt: "Parceiros",
  },
  locations_warning: {
    en: "Manage your inventory locations and organize your stock effectively.",
    pt: "Gerencie suas localizações de inventário e organize seu estoque de forma eficaz.",
  },
  add_location: {
    en: "Add Location",
    pt: "Adicionar Localização",
  },
  add_single_location: {
    en: "Add Single Location",
    pt: "Adicionar Única Localização",
  },
  import_locations: {
    en: "Import Locations",
    pt: "Importar Localizações",
  },
  recently_deleted_locations: {
    en: "Recently Deleted Locations",
    pt: "Localizações Excluídas Recentemente",
  },
  loading_locations: {
    en: "Loading locations",
    pt: "Carregando localizações",
  },
  no_locations_found: {
    en: "No locations found. Add your first location to get started.",
    pt: "Nenhuma localização encontrada. Adicione sua primeira localização para começar.",
  },
  parent_location: {
    en: "Parent Location",
    pt: "Localização Principal",
  },
  select_parent_location: {
    en: "Select parent location",
    pt: "Selecione a localização principal",
  },
  none: {
    en: "None",
    pt: "Nenhum",
  },
  location_created: {
    en: "Location created successfully",
    pt: "Localização criada com sucesso",
  },
  location_updated: {
    en: "Location updated successfully",
    pt: "Localização atualizada com sucesso",
  },
  location_deleted: {
    en: "Location deleted successfully",
    pt: "Localização excluída com sucesso",
  },
  failed_to_save_location: {
    en: "Failed to save location",
    pt: "Falha ao salvar localização",
  },
  failed_to_delete_location: {
    en: "Failed to delete location",
    pt: "Falha ao excluir localização",
  },
  delete_location: {
    en: "Delete Location",
    pt: "Excluir Localização",
  },
  delete_location_confirmation: {
    en: "Are you sure you want to delete {locationName}? This action cannot be undone.",
    pt: "Tem certeza que deseja excluir {locationName}? Esta ação não pode ser desfeita.",
  },
  saving: {
    en: "Saving...",
    pt: "Salvando...",
  },
  select_both_locations: {
    en: "Please select both locations",
    pt: "Por favor, selecione ambas as localizações",
  },
  locations_must_be_different: {
    en: "Source and destination locations must be different",
    pt: "As localizações de origem e destino devem ser diferentes",
  },
  download_as_svg: {
    en: "Download as SVG",
    pt: "Baixar como SVG",
  },
  download_as_png: {
    en: "Download as PNG",
    pt: "Baixar como PNG",
  },
  no_transactions: {
    en: "No transactions to show",
    pt: "Nenhuma transação para mostrar",
  },
  total_in_stock: {
    en: "Total in stock",
    pt: "Total em estoque",
  },
  location_history: {
    en: "Location History",
    pt: "Histórico de Localização",
  },
  location_distribution: {
    en: "Location Distribution",
    pt: "Distribuição por Localização",
  },
  current_location_value: {
    en: "Current Location & Value",
    pt: "Localização e Valor Atual",
  },
  no_location_history: {
    en: "No location history available",
    pt: "Nenhum histórico de localização disponível",
  },
  no_location_data: {
    en: "No location data available",
    pt: "Nenhum dado de localização disponível",
  },
  last_updated: {
    en: "Last updated",
    pt: "Última atualização",
  },
  added_to: {
    en: "Added to",
    pt: "Adicionado a",
  },
  removed_from: {
    en: "Removed from",
    pt: "Removido de",
  },
  adjusted_at: {
    en: "Adjusted at",
    pt: "Ajustado em",
  },
  unknown_location: {
    en: "Unknown location",
    pt: "Localização desconhecida",
  },
  value: {
    en: "Value",
    pt: "Valor",
  },
  overview: {
    en: "Overview",
    pt: "Visão Geral",
  },
  move_item: {
    en: "Move Item",
    pt: "Mover Item",
  },
  item_moved_successfully: {
    en: "Item moved successfully",
    pt: "Item movido com sucesso",
  },
  failed_to_move_item: {
    en: "Failed to move item",
    pt: "Falha ao mover item",
  },
  invalid_quantity: {
    en: "Invalid quantity",
    pt: "Quantidade inválida",
  },
  max_available: {
    en: "Maximum available",
    pt: "Máximo disponível",
  },
  optional_notes: {
    en: "Optional notes",
    pt: "Notas opcionais",
  },
  notes: {
    en: "Notes",
    pt: "Notas",
  },
  total_stock: {
    en: "Total stock",
    pt: "Estoque total",
  },
  select_location: {
    en: "Select Location",
    pt: "Selecionar Localização",
  },
  install_app: {
    en: "Install App",
    pt: "Instalar App",
  },
  error_loading_metrics: {
    en: "Error loading metrics",
    pt: "Erro ao carregar métricas",
  },
  scan_qr_code: {
    en: "Scan QR Code",
    pt: "Escanear Código QR",
  },
  scan_qr_code_description: {
    en: "Position the QR code within the frame to scan",
    pt: "Posicione o código QR dentro da moldura para escanear",
  },
  start_scanning: {
    en: "Start Scanning",
    pt: "Iniciar Escaneamento",
  },
  invalid_qr_code: {
    en: "Invalid QR code",
    pt: "Código QR inválido",
  },
  scan_to_add: {
    en: "Scan to add item",
    pt: "Escanear para adicionar item",
  },
  scanning_in_progress: {
    en: "Scanning in progress...",
    pt: "Escaneamento em progresso...",
  },
  update_item_details: {
    en: "Update item details",
    pt: "Atualizar detalhes do item",
  },
  new_quantity: {
    en: "New quantity",
    pt: "Nova quantidade",
  },
  adjusting: {
    en: "Adjusting...",
    pt: "Ajustando...",
  },
  view_details: {
    en: "View Details",
    pt: "Ver Detalhes",
  },
  preview: {
    en: "Preview",
    pt: "Visualização",
  },
  print: {
    en: "Print",
    pt: "Imprimir",
  },
  download: {
    en: "Download",
    pt: "Baixar",
  },
  download_svg: {
    en: "Download SVG",
    pt: "Baixar SVG",
  },
  download_pdf: {
    en: "Download PDF",
    pt: "Baixar PDF",
  },
  select_items: {
    en: "Select Items",
    pt: "Selecionar Itens",
  },
  copies: {
    en: "Copies",
    pt: "Cópias",
  },
  no_items: {
    en: "No items found",
    pt: "Nenhum item encontrado",
  },
  preparing_pdf: {
    en: "Preparing PDF",
    pt: "Preparando PDF",
  },
  pdf_generating: {
    en: "Please wait while we generate your PDF...",
    pt: "Aguarde enquanto geramos seu PDF...",
  },
  pdf_generated: {
    en: "PDF Generated",
    pt: "PDF Gerado",
  },
  pdf_success: {
    en: "Your PDF has been downloaded successfully.",
    pt: "Seu PDF foi baixado com sucesso.",
  },
  error_fetching: {
    en: "Error fetching items",
    pt: "Erro ao buscar itens",
  },
  try_again: {
    en: "Please try again later",
    pt: "Por favor, tente novamente mais tarde",
  },
  pdf_error: {
    en: "Failed to generate PDF. Please try again.",
    pt: "Falha ao gerar PDF. Por favor, tente novamente.",
  },
  hybrid: {
    en: "Hybrid",
    pt: "Híbrido",
  },
  label_size: {
    en: "Label Size",
    pt: "Tamanho da Etiqueta",
  },
  width: {
    en: "Width",
    pt: "Largura",
  },
  height: {
    en: "Height",
    pt: "Altura",
  },
  code_size: {
    en: "Code Size",
    pt: "Tamanho do Código",
  },
  show_text: {
    en: "Show Text",
    pt: "Mostrar Texto",
  },
  high_quality: {
    en: "High Quality Print",
    pt: "Impressão em Alta Qualidade",
  },
  // Authentication
  sign_in: {
    en: "Sign in",
    pt: "Entrar",
  },
  sign_up: {
    en: "Sign up",
    pt: "Cadastrar",
  },
  email: {
    en: "Email",
    pt: "E-mail",
  },
  password: {
    en: "Password",
    pt: "Senha",
  },
  confirm_password: {
    en: "Confirm Password",
    pt: "Confirmar Senha",
  },
  forgot_password: {
    en: "Forgot password?",
    pt: "Esqueceu a senha?",
  },
  reset_password: {
    en: "Reset Password",
    pt: "Redefinir Senha",
  },
  create_account: {
    en: "Create account",
    pt: "Criar conta",
  },
  creating_account: {
    en: "Creating account...",
    pt: "Criando conta...",
  },
  signing_in: {
    en: "Signing in...",
    pt: "Entrando...",
  },
  continue_with: {
    en: "Or continue with",
    pt: "Ou continue com",
  },
  dont_have_account: {
    en: "Don't have an account?",
    pt: "Não tem uma conta?",
  },
  already_have_account: {
    en: "Already have an account?",
    pt: "Já tem uma conta?",
  },
  enter_credentials: {
    en: "Enter your credentials to access your account",
    pt: "Digite suas credenciais para acessar sua conta",
  },
  enter_details: {
    en: "Enter your details to create your account",
    pt: "Digite seus dados para criar sua conta",
  },
  passwords_dont_match: {
    en: "Passwords do not match",
    pt: "As senhas não coincidem",
  },
  check_email: {
    en: "Check your email",
    pt: "Verifique seu e-mail",
  },
  email_confirmation_sent: {
    en: "We've sent you a confirmation link. Please check your email to complete your registration.",
    pt: "Enviamos um link de confirmação. Por favor, verifique seu e-mail para completar seu cadastro.",
  },
  back_to_sign_in: {
    en: "Back to sign in",
    pt: "Voltar para login",
  },
  reset_password_instructions: {
    en: "Enter your email address and we'll send you a link to reset your password",
    pt: "Digite seu e-mail e enviaremos um link para redefinir sua senha",
  },
  email_sent: {
    en: "Email Sent",
    pt: "E-mail Enviado",
  },
  check_inbox: {
    en: "Check your inbox for the password reset link",
    pt: "Verifique sua caixa de entrada para o link de redefinição de senha",
  },
  return_to_sign_in: {
    en: "Return to Sign In",
    pt: "Voltar para Login",
  },
  send_reset_link: {
    en: "Send Reset Link",
    pt: "Enviar Link de Redefinição",
  },
  sending: {
    en: "Sending...",
    pt: "Enviando...",
  },
  // Login success/error messages
  login_successful: {
    en: "Login successful",
    pt: "Login realizado com sucesso",
  },
  redirecting_to_dashboard: {
    en: "Redirecting to dashboard...",
    pt: "Redirecionando para o painel...",
  },
  login_failed: {
    en: "Login failed",
    pt: "Falha no login",
  },
  failed_to_sign_in: {
    en: "Failed to sign in",
    pt: "Falha ao entrar",
  },
  redirecting: {
    en: "Redirecting...",
    pt: "Redirecionando...",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "pt")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = (key: string, options?: { [key: string]: string }): string => {
    const translationObj = translations[key as keyof typeof translations]
    if (!translationObj) return key
    let translatedText = translationObj[language] || key
    if (options) {
      for (const [optionKey, optionValue] of Object.entries(options)) {
        translatedText = translatedText.replace(`{${optionKey}}`, optionValue)
      }
    }
    return translatedText
  }

  const value = {
    language,
    setLanguage: (newLanguage: Language) => {
      localStorage.setItem("language", newLanguage)
      setLanguage(newLanguage)
    },
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

