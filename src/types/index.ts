// ─── Core BC API Types ───────────────────────────────────────────────────────────────
export type PurchaseOrderStatus = 'Draft' | 'Open' | 'In Review' | 'Received';
export type LineType = 'Item' | 'Account' | 'Resource';
export type ItemType = 'Inventory' | 'Service' | 'Non-Inventory';
export type InvoiceStatus = 'Open' | 'Posted' | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  number: string;
  orderDate: string;
  postingDate: string;
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  status: PurchaseOrderStatus;
  totalAmountExcludingTax: number;
  totalTaxAmount: number;
  totalAmountIncludingTax: number;
  fullyReceived: boolean;
  // Buy-from address
  buyFromAddressLine1: string;
  buyFromAddressLine2?: string;
  buyFromCity: string;
  buyFromState: string;
  buyFromCountry: string;
  buyFromPostalCode: string;
  // Ship-to address
  shipToAddressLine1: string;
  shipToAddressLine2?: string;
  shipToCity: string;
  shipToState: string;
  shipToCountry: string;
  shipToPostalCode: string;
  // Other
  currencyCode: string;
  paymentTermsId: string;
  shipmentMethodId: string;
  requestedReceiptDate: string;
  discountAmount: number;
  lastModifiedDateTime: string;
  notes?: string;
}

export interface PurchaseOrderLine {
  id: string;
  documentId: string;
  sequence: number;
  itemId: string;
  lineType: LineType;
  lineObjectNumber: string;
  description: string;
  unitOfMeasureCode: string;
  quantity: number;
  directUnitCost: number;
  discountPercent: number;
  discountAmount: number;
  amountExcludingTax: number;
  amountIncludingTax: number;
  taxCode: string;
  expectedReceiptDate: string;
  receivedQuantity: number;
  invoicedQuantity: number;
}

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
  balance: number;
  blocked: boolean;
  currencyCode: string;
  paymentTermsId: string;
}

export interface Item {
  id: string;
  number: string;
  displayName: string;
  type: ItemType;
  unitPrice: number;
  unitCost: number;
  inventory: number;
  baseUnitOfMeasureCode: string;
  blocked: boolean;
  itemCategoryCode?: string;
}

export interface PurchaseInvoice {
  id: string;
  number: string;
  postingDate: string;
  invoiceDate: string;
  vendorName: string;
  vendorNumber: string;
  totalAmountExcludingTax: number;
  totalAmountIncludingTax: number;
  status: InvoiceStatus;
  orderNumber: string;
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
  addressLine1: string;
  city: string;
  state: string;
  country: string;
}

// ─── Input types ──────────────────────────────────────────────────────────────────
export interface CreatePurchaseOrderInput {
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  orderDate?: string;
  requestedReceiptDate?: string;
  paymentTermsId?: string;
  shipmentMethodId?: string;
  buyFromAddressLine1?: string;
  buyFromCity?: string;
  buyFromState?: string;
  buyFromCountry?: string;
  buyFromPostalCode?: string;
  shipToAddressLine1?: string;
  shipToCity?: string;
  shipToState?: string;
  shipToCountry?: string;
  shipToPostalCode?: string;
  notes?: string;
}

export interface CreatePurchaseOrderLineInput {
  itemId?: string;
  lineType?: LineType;
  lineObjectNumber?: string;
  description: string;
  unitOfMeasureCode?: string;
  quantity: number;
  directUnitCost: number;
  discountPercent?: number;
  expectedReceiptDate?: string;
}

// ─── App types ───────────────────────────────────────────────────────────────────
export interface DraftOrderLine {
  tempId: string;
  item: Item | null;
  description: string;
  unitOfMeasureCode: string;
  quantity: number;
  directUnitCost: number;
  discountPercent: number;
}

export interface DraftOrder {
  vendor: Vendor | null;
  lines: DraftOrderLine[];
  orderDate: string;
  requestedReceiptDate: string;
  notes: string;
  paymentTermsId: string;
  shipmentMethodId: string;
}

export interface FilterState {
  status?: PurchaseOrderStatus | 'All';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  environment: string;
  loginTime: string;
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
