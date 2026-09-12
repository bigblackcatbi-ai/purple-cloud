import type { Company, Customer, Design, DesignColor, MixComponent } from "./types"
import { hexForCode } from "./pantone"
import { mixHex } from "./color-utils"

let colorSeq = 0
const cid = () => `col-${++colorSeq}`

function p(slot: number, code: string, name?: string, note?: string): DesignColor {
  return {
    id: cid(),
    slot,
    kind: "pantone",
    pantoneCode: code,
    name: name ?? code,
    hex: hexForCode(code),
    note,
  }
}

function custom(slot: number, name: string, hex: string, note?: string): DesignColor {
  return { id: cid(), slot, kind: "custom", name, hex, note }
}

function mix(slot: number, name: string, components: MixComponent[], note?: string): DesignColor {
  const hex = mixHex(components.map((c) => ({ hex: hexForCode(c.pantoneCode), parts: c.parts })))
  return { id: cid(), slot, kind: "mixed", name, hex, components, note }
}

export const SAMPLE_COMPANIES: Company[] = [
  { id: "co-rangbhag", name: "Rangbhag Prints", code: "RNG", location: "Pune, IN", createdAt: "2023-02-11", note: "Long-standing decal partner. Prefers Pantone-matched formulas." },
  { id: "co-apex", name: "Apex Auto Parts", code: "APX", location: "Chennai, IN", createdAt: "2023-05-02" },
  { id: "co-metro", name: "Metro Industries", code: "MTR", location: "Ahmedabad, IN", createdAt: "2022-11-19", note: "High-volume safety labeling." },
  { id: "co-sunrise", name: "Sunrise Components", code: "SNR", location: "Bengaluru, IN", createdAt: "2024-01-08" },
  { id: "co-royal", name: "Royal Engineering", code: "ROY", location: "Delhi, IN", createdAt: "2023-09-27" },
  { id: "co-vertex", name: "Vertex Beverages", code: "VTX", location: "Mumbai, IN", createdAt: "2024-03-15" },
]

export const SAMPLE_CUSTOMERS: Customer[] = [
  { id: "cu-1", name: "Rajesh Kumar", companyId: "co-rangbhag", email: "rajesh@rangbhag.example", phone: "+91 98200 11223", createdAt: "2023-02-12" },
  { id: "cu-2", name: "Amit Sharma", companyId: "co-rangbhag", email: "amit@rangbhag.example", createdAt: "2023-04-01" },
  { id: "cu-3", name: "Neha Verma", companyId: "co-rangbhag", email: "neha@rangbhag.example", phone: "+91 99870 55621", createdAt: "2024-02-20" },
  { id: "cu-4", name: "Vikram Singh", companyId: "co-apex", email: "vikram@apexauto.example", phone: "+91 90000 33445", createdAt: "2023-05-04" },
  { id: "cu-5", name: "Arjun Reddy", companyId: "co-apex", email: "arjun@apexauto.example", createdAt: "2023-07-18" },
  { id: "cu-6", name: "Mohit Enterprises", companyId: "co-metro", email: "orders@mohit.example", createdAt: "2022-11-20" },
  { id: "cu-7", name: "Priya Nair", companyId: "co-sunrise", email: "priya@sunrise.example", phone: "+91 98111 78654", createdAt: "2024-01-10" },
  { id: "cu-8", name: "Sanjay Patel", companyId: "co-royal", email: "sanjay@royaleng.example", createdAt: "2023-10-02" },
  { id: "cu-9", name: "Deepa Iyer", companyId: "co-vertex", email: "deepa@vertexbev.example", phone: "+91 90909 12121", createdAt: "2024-03-16" },
]

const img = (url: string, caption?: string) => ({ id: `img-${url}`, url, caption })

export const SAMPLE_DESIGNS: Design[] = [
  {
    id: "ds-1042",
    code: "DSG-1042",
    name: "Thunder Tank Graphic",
    companyId: "co-rangbhag",
    customerId: "cu-1",
    category: "Motorcycle",
    status: "in-production",
    favorite: true,
    createdAt: "2024-06-04",
    updatedAt: "2024-08-21",
    notes: "Approved gloss finish. Red must match brand sample exactly.",
    images: [img("/images/decals/bike-tank.png", "Left tank")],
    colors: [
      p(1, "293 C", "Body Blue"),
      p(2, "186 C", "Accent Red"),
      p(3, "123 C", "Highlight Yellow"),
      p(4, "Black C", "Outline"),
    ],
  },
  {
    id: "ds-1043",
    code: "DSG-1043",
    name: "Apex Helmet Stripes",
    companyId: "co-apex",
    customerId: "cu-4",
    category: "Helmet",
    status: "approved",
    favorite: false,
    createdAt: "2024-07-10",
    updatedAt: "2024-07-30",
    images: [img("/images/decals/helmet-stripe.png", "Crown stripe")],
    colors: [
      p(1, "354 C", "Speed Green"),
      p(2, "Black C", "Base Black"),
      custom(3, "Pinstripe White", "#FFFFFF"),
      mix(4, "Forest Shade", [
        { pantoneCode: "354 C", parts: 3 },
        { pantoneCode: "Black C", parts: 1 },
      ], "3:1 green to black"),
    ],
  },
  {
    id: "ds-1044",
    code: "DSG-1044",
    name: "Metro Hazard Label",
    companyId: "co-metro",
    customerId: "cu-6",
    category: "Safety Label",
    status: "in-production",
    favorite: true,
    createdAt: "2024-03-02",
    updatedAt: "2024-09-01",
    notes: "High-visibility. Orange is fluorescent — flag for special stock.",
    images: [img("/images/decals/safety-label.png", "Warning panel")],
    colors: [
      p(1, "021 C", "Hazard Orange"),
      p(2, "Black C", "Text Black"),
      custom(3, "Base White", "#FFFFFF"),
    ],
  },
  {
    id: "ds-1045",
    code: "DSG-1045",
    name: "Apex Crest Emblem",
    companyId: "co-apex",
    customerId: "cu-5",
    category: "Emblem",
    status: "approved",
    favorite: false,
    createdAt: "2024-05-19",
    updatedAt: "2024-06-11",
    images: [img("/images/decals/auto-emblem.png", "Chrome crest")],
    colors: [
      p(1, "Reflex Blue C", "Crest Blue"),
      p(2, "877 C", "Metallic Silver"),
      mix(3, "Steel Blue", [
        { pantoneCode: "Reflex Blue C", parts: 2 },
        { pantoneCode: "877 C", parts: 1 },
      ]),
    ],
  },
  {
    id: "ds-1046",
    code: "DSG-1046",
    name: "Heritage Round Badge",
    companyId: "co-rangbhag",
    customerId: "cu-2",
    category: "Badge",
    status: "draft",
    favorite: false,
    createdAt: "2024-08-14",
    updatedAt: "2024-08-18",
    notes: "Awaiting customer sign-off on gold tone.",
    images: [img("/images/decals/vintage-badge.png", "Front badge")],
    colors: [
      p(1, "186 C", "Burgundy Base"),
      custom(2, "Cream", "#EFE7D3"),
      mix(3, "Antique Gold", [
        { pantoneCode: "123 C", parts: 4 },
        { pantoneCode: "1495 C", parts: 1 },
        { pantoneCode: "Black C", parts: 1 },
      ], "Warm gold linework"),
      p(4, "Black C", "Detail"),
    ],
  },
  {
    id: "ds-1047",
    code: "DSG-1047",
    name: "Volt Energy Can Wrap",
    companyId: "co-vertex",
    customerId: "cu-9",
    category: "Label",
    status: "in-production",
    favorite: true,
    createdAt: "2024-04-22",
    updatedAt: "2024-09-05",
    notes: "12-color run. Green must pop under retail lighting.",
    images: [img("/images/decals/energy-can.png", "Full wrap")],
    colors: [
      p(1, "376 C", "Volt Green"),
      p(2, "Black C", "Jet Black"),
      p(3, "108 C", "Spark Yellow"),
      custom(4, "Bright White", "#FFFFFF"),
      mix(5, "Deep Volt", [
        { pantoneCode: "376 C", parts: 2 },
        { pantoneCode: "347 C", parts: 1 },
      ]),
    ],
  },
  {
    id: "ds-1048",
    code: "DSG-1048",
    name: "Royal Tractor Panel",
    companyId: "co-royal",
    customerId: "cu-8",
    category: "Equipment",
    status: "approved",
    favorite: false,
    createdAt: "2024-02-28",
    updatedAt: "2024-05-16",
    images: [img("/images/decals/tractor-panel.png", "Side panel")],
    colors: [
      p(1, "185 C", "Field Red"),
      p(2, "108 C", "Harvest Yellow"),
      p(3, "Black C", "Outline"),
    ],
  },
  {
    id: "ds-1049",
    code: "DSG-1049",
    name: "Sunrise Device Label",
    companyId: "co-sunrise",
    customerId: "cu-7",
    category: "Label",
    status: "draft",
    favorite: false,
    createdAt: "2024-07-25",
    updatedAt: "2024-08-02",
    images: [img("/images/decals/electronics-label.png", "Rear label")],
    colors: [
      p(1, "300 C", "Tech Blue"),
      custom(2, "Panel White", "#FFFFFF"),
      p(3, "Cool Gray 9 C", "Text Gray"),
    ],
  },
  {
    id: "ds-1050",
    code: "DSG-1050",
    name: "Thunder Tank — Night Edition",
    companyId: "co-rangbhag",
    customerId: "cu-1",
    category: "Motorcycle",
    status: "draft",
    favorite: false,
    createdAt: "2024-09-01",
    updatedAt: "2024-09-08",
    notes: "Dark variant of DSG-1042 for limited run.",
    images: [img("/images/decals/bike-tank.png", "Night tank")],
    colors: [
      p(1, "2685 C", "Midnight Purple"),
      p(2, "877 C", "Silver Line"),
      mix(3, "Shadow Blue", [
        { pantoneCode: "293 C", parts: 1 },
        { pantoneCode: "Black C", parts: 2 },
      ]),
      p(4, "Black C", "Base"),
    ],
  },
  {
    id: "ds-1051",
    code: "DSG-1051",
    name: "Metro Voltage Warning",
    companyId: "co-metro",
    customerId: "cu-6",
    category: "Safety Label",
    status: "in-production",
    favorite: false,
    createdAt: "2024-06-18",
    updatedAt: "2024-08-27",
    images: [img("/images/decals/safety-label.png", "Voltage panel")],
    colors: [
      p(1, "108 C", "Caution Yellow"),
      p(2, "Black C", "Symbol Black"),
      p(3, "185 C", "Danger Red"),
    ],
  },
  {
    id: "ds-1052",
    code: "DSG-1052",
    name: "Apex GT Roundel",
    companyId: "co-apex",
    customerId: "cu-4",
    category: "Emblem",
    status: "archived",
    favorite: false,
    createdAt: "2023-12-04",
    updatedAt: "2024-01-20",
    images: [img("/images/decals/auto-emblem.png", "GT roundel")],
    colors: [
      p(1, "199 C", "GT Red"),
      p(2, "Reflex Blue C", "GT Blue"),
      custom(3, "White", "#FFFFFF"),
    ],
  },
  {
    id: "ds-1053",
    code: "DSG-1053",
    name: "Sunrise Teal Series",
    companyId: "co-sunrise",
    customerId: "cu-7",
    category: "Label",
    status: "approved",
    favorite: true,
    createdAt: "2024-08-29",
    updatedAt: "2024-09-06",
    images: [img("/images/decals/electronics-label.png", "Teal label")],
    colors: [
      p(1, "3272 C", "Series Teal"),
      p(2, "Cool Gray 9 C", "Gray Text"),
      mix(3, "Soft Teal", [
        { pantoneCode: "3272 C", parts: 1 },
        { pantoneCode: "White", parts: 2 },
      ]),
    ],
  },
]

export function seedData() {
  return {
    companies: SAMPLE_COMPANIES.map((c) => ({ ...c })),
    customers: SAMPLE_CUSTOMERS.map((c) => ({ ...c })),
    designs: SAMPLE_DESIGNS.map((d) => ({
      ...d,
      images: d.images.map((i) => ({ ...i })),
      colors: d.colors.map((c) => ({ ...c, components: c.components?.map((m) => ({ ...m })) })),
    })),
  }
}
