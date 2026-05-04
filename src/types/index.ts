// ─── Domain Types ──────────────────────────────────────────────────────────────

export type PurchaseOrderStatus = 'Draft' | 'Open' | 'In Review' | 'Received';
export type InvoiceStatus = 'Posted' | 'Draft' | 'Cancelled';

export interface Vendor {
  id: string;
  number: string;
  displayName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  currencyCode: string;
  paymentTermsCode: string;
  blocked: boolean;
  balance: number;
  balanceDue: number;
}

export interface Item {
  id: string;
  number: string;
  displayName: string;
  type: 'Inventory' | 'Service' | 'Non-Inventory';
  unitCost: number;
  unitPrice: number;
  baseUnitOfMeasureCode: string;
  inventory: number;
  blocked: boolean;
  taxGroupCode: string;
}

export interface PurchaseOrderLine {
  id: string;
  documentId: string;
  sequence: number;
  lineType: 'Item' | 'Resource' | 'FixedAsset' | 'ChargeItem' | 'Comment';
  lineObjectNumber: string;
  description: string;
  description2?: string;
  unitOfMeasureCode: string;
  quantity: number;
  directUnitCost: number;
  discountPercent: number;
  discountAmount: number;
  amountExcludingTax: number;
  taxCode: string;
  taxPercent: number;
  amountIncludingTax: number;
  invoiceDiscountAllocation: number;
  netAmount: number;
  netTaxAmount: number;
  netAmountIncludingTax: number;
  expectedReceiptDate: string;
  receivedQuantity: number;
  invoicedQuantity: number;
  invoiceQuantity: number;
  receiveQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  orderDate: string;
  postingDate?: string;
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  buyFromAddressLine1: string;
  buyFromAddressLine2?: string;
  buyFromCity: string;
  buyFromState: string;
  buyFromCountry: string;
  buyFromPostalCode: string;
  shipToName?: string;
  shipToAddressLine1?: string;
  currencyCode: string;
  paymentTermsCode: string;
  requestedReceiptDate?: string;
  status: PurchaseOrderStatus;
  fullyReceived: boolean;
  notes?: string;
  totalAmountExcludingTax: number;
  totalTaxAmount: number;
  totalAmountIncludingTax: number;
}

export interface PurchaseInvoice {
  id: string;
  number: string;
  invoiceDate: string;
  postingDate: string;
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  orderNumber: string;
  status: InvoiceStatus;
  totalAmountExcludingTax: number;
  totalTaxAmount: number;
  totalAmountIncludingTax: number;
  dueDate?: string;
  paymentTermsCode: string;
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  displayName: string;
  internationalStandardCode: string;
}

export interface Location {
  id: string;
  code: string;
  displayName: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CreatePurchaseOrderInput {
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  orderDate: string;
  requestedReceiptDate: string;
  buyFromAddressLine1?: string;
  buyFromCity?: string;
  buyFromState?: string;
  buyFromCountry?: string;
  buyFromPostalCode?: string;
  notes?: string;
}

export interface CreatePurchaseOrderLineInput {
  itemId?: string;
  lineObjectNumber?: string;
  description: string;
  unitOfMeasureCode?: string;
  quantity: number;
  directUnitCost: number;
  discountPercent?: number;
  expectedReceiptDate?: string;
}

export interface DraftOrderLine {
  tempId: string;
  item?: Item;
  description: string;
  unitOfMeasureCode: string;
  quantity: number;
  directUnitCost: number;
  discountPercent: number;
}

export interface DraftOrder {
  vendorId?: string;
  vendorName?: string;
  orderDate?: string;
  requestedReceiptDate?: string;
  notes?: string;
  lines?: DraftOrderLine[];
}

export interface FilterState {
  status?: PurchaseOrderStatus | 'All';
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  environment: string;
}

// ─── Navigation types ──────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  OrdersTab: undefined;
  CreateTab: undefined;
  InvoicesTab: undefined;
  SettingsTab: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  OrderDetail: { orderId: string };
  EditOrder: { orderId: string };
  CreateOrder: { prefillVendorId?: string } | undefined;
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
  EditOrder: { orderId: string };
  CreateOrder: { prefillVendorId?: string } | undefined;
};

export type CreateStackParamList = {
  CreateOrder: { prefillData?: Partial<DraftOrder> } | undefined;
  ScanDocument: undefined;
};

export type InvoicesStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { invoiceId: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};
