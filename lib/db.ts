interface Item {
  id: number
  sku: string
  name: string
  barcode: string
  cost: number
  price: number
  type: string
  brand: string
  location: string
  initial_quantity: number
  current_quantity: number
}

interface StockInItem {
  itemId: number
  quantity: number
}

interface StockIn {
  id: number
  date: string
  location: string
  supplier: string
  memo: string
  items: StockInItem[]
}

class InMemoryDB {
  private items: Item[] = []
  private stockIns: StockIn[] = []
  private nextId = 1
  private nextStockInId = 1

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("purple-stock-data")
      if (savedData) {
        const data = JSON.parse(savedData)
        this.items = data.items
        this.stockIns = data.stockIns || []
        this.nextId = data.nextId
        this.nextStockInId = data.nextStockInId || 1
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "purple-stock-data",
        JSON.stringify({
          items: this.items,
          stockIns: this.stockIns,
          nextId: this.nextId,
          nextStockInId: this.nextStockInId,
        }),
      )
    }
  }

  async createItem(item: Omit<Item, "id" | "current_quantity">): Promise<Item> {
    const newItem = {
      ...item,
      id: this.nextId++,
      current_quantity: item.initial_quantity,
    }
    this.items.push(newItem)
    this.saveToStorage()
    return newItem
  }

  async getItems(): Promise<Item[]> {
    return this.items
  }

  async getItemById(id: number): Promise<Item | null> {
    return this.items.find((item) => item.id === id) || null
  }

  async getItemBySku(sku: string): Promise<Item | undefined> {
    return this.items.find((item) => item.sku === sku)
  }

  async searchItems(query: string): Promise<Item[]> {
    const lowercaseQuery = query.toLowerCase()
    return this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.sku.toLowerCase().includes(lowercaseQuery) ||
        item.barcode.toLowerCase().includes(lowercaseQuery),
    )
  }

  async createStockIn(stockIn: Omit<StockIn, "id">): Promise<StockIn> {
    const newStockIn = { ...stockIn, id: this.nextStockInId++ }

    // Update item quantities
    for (const stockInItem of stockIn.items) {
      const item = this.items.find((i) => i.id === stockInItem.itemId)
      if (item) {
        item.current_quantity += stockInItem.quantity
      }
    }

    this.stockIns.push(newStockIn)
    this.saveToStorage()
    return newStockIn
  }

  async duplicateItem(id: number): Promise<Item | null> {
    const originalItem = this.items.find((item) => item.id === id)
    if (!originalItem) return null

    const duplicatedItem: Omit<Item, "id" | "current_quantity"> = {
      ...originalItem,
      sku: `${originalItem.sku}-COPY`,
      name: `${originalItem.name} (Copy)`,
      barcode: `${originalItem.barcode}-COPY`,
      initial_quantity: 0,
    }

    const newItem = await this.createItem(duplicatedItem)
    this.saveToStorage()
    return newItem
  }
}

let dbInstance: InMemoryDB | null = null

export function getDb() {
  if (!dbInstance) {
    dbInstance = new InMemoryDB()
  }
  return dbInstance
}

