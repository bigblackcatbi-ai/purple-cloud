export type ColorKind = "direct" | "mixed"

export type DesignStatus = "draft" | "approved" | "in-production" | "archived"

export interface MixComponent {
  colorCode: string
  parts: number
}

export interface ColorComponent {
  colorCode: string
  percentage: number
}

export interface MixedColorComponent {
  id: string
  colorCode: string
  colorName: string
  grams: number
  additionalProperties?: Record<string, string>
}

export interface DesignColor {
  id: string
  designId?: string
  slot?: number
  colorNumber?: number
  colorCode?: string
  colorName?: string
  name?: string
  type: "direct" | "mixed"
  kind?: ColorKind
  components?: MixComponent[]
  formula?: ColorComponent[]
  mixedComponents?: MixedColorComponent[]
  additionalProperties?: Record<string, string>
  note?: string
  createdAt?: string
  updatedAt?: string
}

export interface DesignImage {
  id: string
  url: string
  caption?: string
}

export interface Design {
  id: string
  code: string
  name: string
  companyId: string
  customerId: string
  category: string
  status: DesignStatus
  images: DesignImage[]
  colors: DesignColor[]
  notes?: string
  favorite: boolean
  dateCreated?: string
  createdAt: string
  updatedAt: string
  designId?: string
  designName?: string
}

export interface Customer {
  id: string
  name: string
  companyId: string
  email?: string
  phone?: string
  note?: string
  createdAt: string
  customerName?: string
  contact?: string
  notes?: string
}

export interface Company {
  id: string
  name: string
  code: string
  location?: string
  note?: string
  createdAt: string
  companyName?: string
  notes?: string
  updatedAt?: string
}
