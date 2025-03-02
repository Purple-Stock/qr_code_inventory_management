"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "pt"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Sidebar items
    item_list: "Item List",
    stock_in: "Stock In",
    stock_out: "Stock Out",
    adjust_stock: "Adjust Stock",
    transactions: "Transactions",
    purchase_sales: "Purchase & Sales",
    print_barcode: "Print Barcode",
    settings: "Settings",
    upgrade: "Upgrade",
    user_guide: "User Guide",
    reports: "Reports",
    summary: "Summary",
    dashboard: "Dashboard",
    analytics: "Analytics",

    // Common elements
    search_items: "Search items...",
    all_categories: "All Categories",
    add_item: "Add Item",
    export_csv: "Export CSV",
    import_csv: "Import CSV",
    scan: "Scan",
    previous: "Previous",
    next: "Next",
    showing_items: "Showing {0} items",

    // Item List page
    items_list: "Items List",
    name: "Name",
    sku: "SKU",
    category: "Category",
    in_stock: "In Stock",
    unit_price: "Unit Price",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",

    // New Item page
    new_item: "New Item",
    item_information: "Item Information",
    generate: "Generate",
    barcode: "Barcode",
    cost: "Cost",
    price: "Price",
    item_attribute: "Item Attribute",
    edit_attribute: "Edit attribute",
    type: "Type",
    brand: "Brand",
    initial_quantity: "Initial Quantity",
    location: "Location",
    submit: "Submit",
    cancel: "Cancel",
    sku_help: "SKU Help",
    click_generate_barcode: "Click the 'Generate' button to create a barcode",
    input_text: "Input text",
    input_initial_quantity: "Input initial quantity.",

    // Stock In page
    stock_in_title: "Stock In",
    supplier: "Supplier",
    date: "Date",
    memo: "Memo",
    items: "Items",
    current_stock: "Current Stock",
    quantity: "Quantity",
    save_draft: "Save Draft",
    import_excel: "Import Excel",
    scan_barcode: "Scan Barcode",
    search_for_item: "Search for an item to add...",
    search_inserted_items: "Search inserted items...",
    no_items_added: "No items added yet",
    remove: "Remove",
    stock_in_button: "Stock In",
    enter_supplier_name: "Enter supplier name",
    default_location: "Default Location",
    warehouse: "Warehouse",
    store: "Store",

    // Item Details page
    item_details: "Item Details",
    current_status: "Current Status",
    available_stock: "Available Stock",
    all: "All",
    in: "In",
    out: "Out",
    adj: "Adj",
    move: "Move",
    qr_code: "QR Code",
    download_qr: "Download QR",
    print_qr: "Print QR",

    // User menu
    english: "English",
    portuguese: "Português",
    logout: "Logout",

    // Stock In Success Modal
    close: "Close",
    stock_in_success: "Successfully recorded 'Stock In'",
    stock_in_success_message:
      "Total {totalQuantity} quantity(ies) of {itemCount} item(s) has been recorded for 'Stock In'",
    print_label: "Print Label",
    details: "Details",
    confirm: "Confirm",

    // Stock In Details
    stock_in_details: "Stock In Details",
    total_items: "Total Items",
    item: "Item",
    previous_stock: "Previous Stock",
    quantity_in: "Quantity In",
    enter_memo: "Enter memo or notes...",

    // CSV Import Modal
    import_items_from_csv: "Import Items from CSV",
    upload_csv_description: "Upload a CSV file with your items data or drag and drop it here.",
    select_csv_file: "Select CSV File",
    or_drag_and_drop: "or drag and drop",
    example_csv_format: "Example CSV format:",

    // Form states
    submitting: "Submitting...",

    // Error messages
    failed_to_generate_sku: "Failed to generate SKU",
    failed_to_generate_barcode: "Failed to generate barcode",
    failed_to_create_item: "Failed to create item",

    // Stock Out page
    stock_out_title: "Stock Out",
    stock_out_button: "Stock Out",
    failed_to_create_stock_out: "Failed to create stock out",
    insert_dummy_data: "Insert Demo Data",
    dummy_data_success: "Demo data inserted successfully",
    dummy_data_error: "Failed to insert demo data",
    loading: "Loading",
    no_items_found: "No items found. Add your first item to get started.",
    failed_to_fetch_items: "Failed to fetch items",
    delete_confirmation: "Delete Item",
    delete_item_confirmation: "Are you sure you want to delete {itemName}? This action cannot be undone.",
    item_deleted_successfully: "Item deleted successfully",
    failed_to_delete_item: "Failed to delete item",
    duplicating: "Duplicating...",
    item_duplicated_successfully: "Item duplicated successfully",
    failed_to_duplicate_item: "Failed to duplicate item",
    adjust_title: "Adjust Stock",
    adjust_button: "Adjust",
    bulk_add: "Bulk Add",
    reset: "Reset",
    enter_memo_with_hash: 'Enter a memo. Tip: Use "#" for easy search (e.g. #BoxHero).',
    failed_to_create_adjustment: "Failed to create stock adjustment",
    edit_item: "Edit Item",
    item_not_found: "Item not found",
    failed_to_fetch_item: "Failed to fetch item",
    item_updated_successfully: "Item updated successfully",
    failed_to_update_item: "Failed to update item",
    updating: "Updating...",
    update: "Update",
    move_stock_title: "Move Stock",
    from_location: "From Location",
    to_location: "To Location",
    moving: "Moving...",
    move: "Move",
    failed_to_move_stock: "Failed to move stock",
    move_stock: "Move Stock",

    // Summary Report
    export_report: "Export Report",
    total_items: "Total Items",
    from_last_month: "from last month",
    inventory_value: "Inventory Value",
    current_total_value: "Current total value",
    low_stock_items: "Low Stock Items",
    items_below_minimum: "Items below minimum stock",
    out_of_stock: "Out of Stock",
    items_out_of_stock: "Items with zero stock",
    recent_activity: "Recent Activity",
    last_24_hours: "Last 24 hours of movement",
    stock_warnings: "Stock Warnings",
    items_requiring_attention: "Items requiring attention",
    low_stock: "Low Stock",
    top_moving_items: "Top Moving Items",
    most_active_items: "Most active items in your inventory",
    movements: "Movements",
    trend: "Trend",
    adjustment: "Adjustment",

    // Dashboard
    select_time_range: "Select time range",
    last_7_days: "Last 7 days",
    last_30_days: "Last 30 days",
    last_90_days: "Last 90 days",
    last_12_months: "Last 12 months",
    inventory_trends: "Inventory Trends",
    stock_levels_over_time: "Stock levels over time",
    category_distribution: "Category Distribution",
    items_by_category: "Items by category",
    inventory_by_location: "Inventory by Location",
    stock_distribution: "Stock distribution across locations",
    recent_transactions: "Recent Transactions",
    latest_inventory_movements: "Latest inventory movements",
    type: "Type",
    location: "Location",
    stock_in: "Stock In",
    stock_out: "Stock Out",

    // Analytics
    export_analytics: "Export Analytics",
    inventory_accuracy: "Inventory Accuracy",
    order_fulfillment: "Order Fulfillment",
    stock_turnover_rate: "Stock Turnover Rate",
    dead_stock: "Dead Stock",
    from_previous: "from previous period",
    performance_analysis: "Performance Analysis",
    turnover_analysis: "Turnover Analysis",
    stockout_analysis: "Stockout Analysis",
    sales_forecast_analysis: "Sales Forecast Analysis",
    sales_forecast_description: "Actual vs forecasted sales performance",
    actual_sales: "Actual Sales",
    forecasted_sales: "Forecasted Sales",
    top_performing_items: "Top Performing Items",
    by_turnover_and_profit: "By turnover and profit margin",
    turnover: "Turnover",
    profit_margin: "Profit Margin",
    low_performing_items: "Low Performing Items",
    needs_attention: "Items that need attention",
    stock_turnover_by_category: "Stock Turnover by Category",
    compared_to_industry: "Compared to industry average",
    your_turnover: "Your Turnover",
    industry_average: "Industry Average",
    stockout_frequency: "Stockout Frequency",
    stockout_description: "Number of stockout events over time",
    stockout_events: "Stockout Events",
    date_range: "Date Range",
    filter_by: "Filter by",
    transaction_details: "Transaction Details",
    select_transaction: "Please select a transaction from the list on the left.",
    transaction_history_notice: "You can view past transactions for up to 30 days.",
    export_excel: "Export Excel",
  },
  pt: {
    // Sidebar items
    item_list: "Lista de Itens",
    stock_in: "Entrada",
    stock_out: "Saída",
    adjust_stock: "Ajustar Estoque",
    transactions: "Transações",
    purchase_sales: "Compras & Vendas",
    print_barcode: "Imprimir Código",
    settings: "Configurações",
    upgrade: "Atualizar",
    user_guide: "Guia do Usuário",
    reports: "Relatórios",
    summary: "Resumo",
    dashboard: "Dashboard",
    analytics: "Análise",

    // Common elements
    search_items: "Buscar itens...",
    all_categories: "Todas as Categorias",
    add_item: "Adicionar Item",
    export_csv: "Exportar CSV",
    import_csv: "Importar CSV",
    scan: "Escanear",
    previous: "Anterior",
    next: "Próximo",
    showing_items: "Mostrando {0} itens",

    // Item List page
    items_list: "Lista de Itens",
    name: "Nome",
    sku: "SKU",
    category: "Categoria",
    in_stock: "Em Estoque",
    unit_price: "Preço Unitário",
    edit: "Editar",
    duplicate: "Duplicar",
    delete: "Excluir",

    // New Item page
    new_item: "Novo Item",
    item_information: "Informações do Item",
    generate: "Gerar",
    barcode: "Código de Barras",
    cost: "Custo",
    price: "Preço",
    item_attribute: "Atributo do Item",
    edit_attribute: "Editar atributo",
    type: "Tipo",
    brand: "Marca",
    initial_quantity: "Quantidade Inicial",
    location: "Localização",
    submit: "Enviar",
    cancel: "Cancelar",
    sku_help: "Ajuda SKU",
    click_generate_barcode: "Clique no botão 'Gerar' para criar um código de barras",
    input_text: "Digite o texto",
    input_initial_quantity: "Digite a quantidade inicial.",

    // Stock In page
    stock_in_title: "Entrada de Estoque",
    supplier: "Fornecedor",
    date: "Data",
    memo: "Observação",
    items: "Itens",
    current_stock: "Estoque Atual",
    quantity: "Quantidade",
    save_draft: "Salvar Rascunho",
    import_excel: "Importar Excel",
    scan_barcode: "Escanear Código de Barras",
    search_for_item: "Buscar um item para adicionar...",
    search_inserted_items: "Buscar itens inseridos...",
    no_items_added: "Nenhum item adicionado ainda",
    remove: "Remover",
    stock_in_button: "Entrada de Estoque",
    enter_supplier_name: "Digite o nome do fornecedor",
    default_location: "Localização Padrão",
    warehouse: "Armazém",
    store: "Loja",

    // Item Details page
    item_details: "Detalhes do Item",
    current_status: "Status Atual",
    available_stock: "Estoque Disponível",
    all: "Todos",
    in: "Entrada",
    out: "Saída",
    adj: "Ajuste",
    move: "Mover",
    qr_code: "Código QR",
    download_qr: "Baixar QR",
    print_qr: "Imprimir QR",

    // User menu
    english: "English",
    portuguese: "Português",
    logout: "Sair",

    // Stock In Success Modal
    close: "Fechar",
    stock_in_success: "Entrada de estoque registrada com sucesso",
    stock_in_success_message:
      "Total de {totalQuantity} quantidade(s) de {itemCount} item(ns) foi registrado para 'Entrada de Estoque'",
    print_label: "Imprimir Etiqueta",
    details: "Detalhes",
    confirm: "Confirmar",

    // Stock In Details
    stock_in_details: "Detalhes da Entrada de Estoque",
    total_items: "Total de Itens",
    item: "Item",
    previous_stock: "Estoque Anterior",
    quantity_in: "Quantidade Entrada",
    enter_memo: "Digite observações ou notas...",

    // CSV Import Modal
    import_items_from_csv: "Importar Itens do CSV",
    upload_csv_description: "Faça upload de um arquivo CSV com seus dados ou arraste e solte aqui.",
    select_csv_file: "Selecionar Arquivo CSV",
    or_drag_and_drop: "ou arraste e solte",
    example_csv_format: "Exemplo de formato CSV:",

    // Form states
    submitting: "Enviando...",

    // Error messages
    failed_to_generate_sku: "Falha ao gerar SKU",
    failed_to_generate_barcode: "Falha ao gerar código de barras",
    failed_to_create_item: "Falha ao criar item",

    // Stock Out page
    stock_out_title: "Saída de Estoque",
    stock_out_button: "Saída",
    failed_to_create_stock_out: "Falha ao criar saída de estoque",
    insert_dummy_data: "Inserir Dados de Demonstração",
    dummy_data_success: "Dados de demonstração inseridos com sucesso",
    dummy_data_error: "Falha ao inserir dados de demonstração",
    loading: "Carregando",
    no_items_found: "Nenhum item encontrado. Adicione seu primeiro item para começar.",
    failed_to_fetch_items: "Falha ao buscar itens",
    delete_confirmation: "Excluir Item",
    delete_item_confirmation: "Tem certeza que deseja excluir {itemName}? Esta ação não pode ser desfeita.",
    item_deleted_successfully: "Item excluído com sucesso",
    failed_to_delete_item: "Falha ao excluir item",
    duplicating: "Duplicando...",
    item_duplicated_successfully: "Item duplicado com sucesso",
    failed_to_duplicate_item: "Falha ao duplicar item",
    adjust_title: "Ajustar Estoque",
    adjust_button: "Ajustar",
    bulk_add: "Adicionar em Massa",
    reset: "Resetar",
    enter_memo_with_hash: 'Digite uma observação. Dica: Use "#" para busca fácil (ex: #BoxHero).',
    failed_to_create_adjustment: "Falha ao criar ajuste de estoque",
    edit_item: "Editar Item",
    item_not_found: "Item não encontrado",
    failed_to_fetch_item: "Falha ao buscar item",
    item_updated_successfully: "Item atualizado com sucesso",
    failed_to_update_item: "Falha ao atualizar item",
    updating: "Atualizando...",
    update: "Atualizar",
    move_stock_title: "Mover Estoque",
    from_location: "Localização de Origem",
    to_location: "Localização de Destino",
    moving: "Movendo...",
    move: "Mover",
    failed_to_move_stock: "Falha ao mover estoque",
    move_stock: "Mover Estoque",

    // Summary Report
    export_report: "Exportar Relatório",
    total_items: "Total de Itens",
    from_last_month: "em relação ao mês anterior",
    inventory_value: "Valor do Estoque",
    current_total_value: "Valor total atual",
    low_stock_items: "Itens com Baixo Estoque",
    items_below_minimum: "Itens abaixo do estoque mínimo",
    out_of_stock: "Sem Estoque",
    items_out_of_stock: "Itens com estoque zero",
    recent_activity: "Atividade Recente",
    last_24_hours: "Últimas 24 horas de movimentação",
    stock_warnings: "Alertas de Estoque",
    items_requiring_attention: "Itens que precisam de atenção",
    low_stock: "Baixo Estoque",
    top_moving_items: "Itens Mais Movimentados",
    most_active_items: "Itens mais ativos no seu estoque",
    movements: "Movimentações",
    trend: "Tendência",
    adjustment: "Ajuste",

    // Dashboard
    select_time_range: "Selecionar período",
    last_7_days: "Últimos 7 dias",
    last_30_days: "Últimos 30 dias",
    last_90_days: "Últimos 90 dias",
    last_12_months: "Últimos 12 meses",
    inventory_trends: "Tendências de Estoque",
    stock_levels_over_time: "Níveis de estoque ao longo do tempo",
    category_distribution: "Distribuição por Categoria",
    items_by_category: "Itens por categoria",
    inventory_by_location: "Estoque por Localização",
    stock_distribution: "Distribuição de estoque por locais",
    recent_transactions: "Transações Recentes",
    latest_inventory_movements: "Últimas movimentações de estoque",
    type: "Tipo",
    location: "Localização",
    stock_in: "Entrada",
    stock_out: "Saída",

    // Analytics
    export_analytics: "Exportar Análise",
    inventory_accuracy: "Precisão do Inventário",
    order_fulfillment: "Atendimento de Pedidos",
    stock_turnover_rate: "Taxa de Giro de Estoque",
    dead_stock: "Estoque Parado",
    from_previous: "do período anterior",
    performance_analysis: "Análise de Desempenho",
    turnover_analysis: "Análise de Giro",
    stockout_analysis: "Análise de Ruptura",
    sales_forecast_analysis: "Análise de Previsão de Vendas",
    sales_forecast_description: "Desempenho real vs previsto de vendas",
    actual_sales: "Vendas Reais",
    forecasted_sales: "Vendas Previstas",
    top_performing_items: "Itens com Melhor Desempenho",
    by_turnover_and_profit: "Por giro e margem de lucro",
    turnover: "Giro",
    profit_margin: "Margem de Lucro",
    low_performing_items: "Itens com Baixo Desempenho",
    needs_attention: "Itens que precisam de atenção",
    stock_turnover_by_category: "Giro de Estoque por Categoria",
    compared_to_industry: "Comparado à média do setor",
    your_turnover: "Seu Giro",
    industry_average: "Média do Setor",
    stockout_frequency: "Frequência de Ruptura",
    stockout_description: "Número de eventos de ruptura ao longo do tempo",
    stockout_events: "Eventos de Ruptura",
    date_range: "Período",
    filter_by: "Filtrar por",
    transaction_details: "Detalhes da Transação",
    select_transaction: "Por favor, selecione uma transação da lista à esquerda.",
    transaction_history_notice: "Você pode visualizar transações anteriores por até 30 dias.",
    export_excel: "Exportar Excel",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt")

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as Language
    if (storedLanguage) {
      setLanguageState(storedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string) => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

