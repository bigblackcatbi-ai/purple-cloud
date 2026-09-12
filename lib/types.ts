export type ColorKind = "pantone" | "custom" | "mixed"

export type DesignStatus = "draft" | "approved" | "in-production" | "archived"

export interface MixComponent {
  pantoneCode: string
  parts: number
}

export interface DesignColor {
  id: string
  slot: number
  name: string
  kind: ColorKind
  pantoneCode?: string
  hex: string
  components?: MixComponent[]
  note?: string
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
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  companyId: string
  email?: string
  phone?: string
  note?: string
  createdAt: string
}

export interface Company {
  id: string
  name: string
  code: string
  location?: string
  note?: string
  createdAt: string
}

export interface PantoneColor {
  code: string
  name: string
  hex: string
  family: string
  custom?: boolean
}
