import {
  Vendor,
  Item,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseInvoice,
  UnitOfMeasure,
  Location,
  CreatePurchaseOrderInput,
  CreatePurchaseOrderLineInput,
} from '../types';
import {
  seedVendors,
  seedItems,
  seedPurchaseOrders,
  seedPurchaseOrderLines,
  seedPurchaseInvoices,
  seedUnitsOfMeasure,
  seedLocations,
} from './mockData';

// ─── In-memory state ─────────────────────────────────────────────────────────
let vendors: Vendor[] = [...seedVendors];
let items: Item[] = [...seedItems];
let purchaseOrders: PurchaseOrder[] = [...seedPurchaseOrders];
let purchaseOrderLines: PurchaseOrderLine[] = [...seedPurchaseOrderLines];
let purchaseInvoices: PurchaseInvoice[] = [...seedPurchaseInvoices];
const unitsOfMeasure: UnitOfMeasure[] = [...seedUnitsOfMeasure];
const locations: Location[] = [...seedLocations];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const delay = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateOrderNumber(): string {
  const max = purchaseOrders.reduce((acc, o) => {
    const parts = o.number.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    return isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `PO-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
export async function getVendors(params?: { filter?: string; orderby?: string; top?: number }): Promise<Vendor[]> {
  await delay();
  let result = [...vendors];
  if (params?.filter) {
    const q = params.filter.toLowerCase();
    result = result.filter(
      v =>
        v.displayName.toLowerCase().includes(q) ||
        v.number.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q),
    );
  }
  if (params?.orderby === 'displayName') result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  if (params?.top) result = result.slice(0, params.top);
  return result;
}

// ─── Items ───────────────────────────────────────────────────────────────────
export async function getItems(params?: { filter?: string; orderby?: string; top?: number }): Promise<Item[]> {
  await delay();
  let result = [...items];
  if (params?.filter) {
    const q = params.filter.toLowerCase();
    result = result.filter(
      i =>
        i.displayName.toLowerCase().includes(q) ||
        i.number.toLowerCase().includes(q) ||
        i.itemCategoryCode?.toLowerCase().includes(q),
    );
  }
  if (params?.orderby === 'displayName') result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  if (params?.top) result = result.slice(0, params.top);
  return result;
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────
export async function getPurchaseOrders(params?: { filter?: string; orderby?: string; top?: number }): Promise<PurchaseOrder[]> {
  await delay();
  let result = [...purchaseOrders];
  if (params?.filter) {
    const q = params.filter.toLowerCase();
    result = result.filter(
      o =>
        o.number.toLowerCase().includes(q) ||
        o.vendorName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  }
  // Default sort by orderDate desc
  result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  if (params?.top) result = result.slice(0, params.top);
  return result;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  await delay();
  const order = purchaseOrders.find(o => o.id === id);
  if (!order) throw new ApiError(404, `Purchase order '${id}' not found`);
  return { ...order };
}

export async function createPurchaseOrder(data: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
  await delay();
  const newOrder: PurchaseOrder = {
    id: generateId(),
    number: generateOrderNumber(),
    orderDate: data.orderDate || new Date().toISOString().split('T')[0],
    postingDate: '',
    vendorId: data.vendorId,
    vendorNumber: data.vendorNumber,
    vendorName: data.vendorName,
    status: 'Draft',
    totalAmountExcludingTax: 0,
    totalTaxAmount: 0,
    totalAmountIncludingTax: 0,
    fullyReceived: false,
    buyFromAddressLine1: data.buyFromAddressLine1 || '',
    buyFromCity: data.buyFromCity || '',
    buyFromState: data.buyFromState || '',
    buyFromCountry: data.buyFromCountry || '',
    buyFromPostalCode: data.buyFromPostalCode || '',
    shipToAddressLine1: data.shipToAddressLine1 || '',
    shipToCity: data.shipToCity || '',
    shipToState: data.shipToState || '',
    shipToCountry: data.shipToCountry || '',
    shipToPostalCode: data.shipToPostalCode || '',
    currencyCode: 'USD',
    paymentTermsId: data.paymentTermsId || '',
    shipmentMethodId: data.shipmentMethodId || '',
    requestedReceiptDate: data.requestedReceiptDate || '',
    discountAmount: 0,
    lastModifiedDateTime: new Date().toISOString(),
  };
  purchaseOrders = [newOrder, ...purchaseOrders];
  return { ...newOrder };
}

export async function updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  await delay();
  const idx = purchaseOrders.findIndex(o => o.id === id);
  if (idx === -1) throw new ApiError(404, `Purchase order '${id}' not found`);
  purchaseOrders[idx] = { ...purchaseOrders[idx], ...data, lastModifiedDateTime: new Date().toISOString() };
  return { ...purchaseOrders[idx] };
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  await delay();
  const idx = purchaseOrders.findIndex(o => o.id === id);
  if (idx === -1) throw new ApiError(404, `Purchase order '${id}' not found`);
  purchaseOrders = purchaseOrders.filter(o => o.id !== id);
  purchaseOrderLines = purchaseOrderLines.filter(l => l.documentId !== id);
}

export async function receiveAndInvoice(orderId: string): Promise<PurchaseOrder> {
  await delay();
  const idx = purchaseOrders.findIndex(o => o.id === orderId);
  if (idx === -1) throw new ApiError(404, `Purchase order '${orderId}' not found`);
  if (purchaseOrders[idx].status !== 'Open') {
    throw new ApiError(422, 'Only Open orders can be received');
  }
  purchaseOrders[idx] = {
    ...purchaseOrders[idx],
    status: 'Received',
    fullyReceived: true,
    postingDate: new Date().toISOString().split('T')[0],
    lastModifiedDateTime: new Date().toISOString(),
  };
  // Also update all lines
  purchaseOrderLines = purchaseOrderLines.map(l =>
    l.documentId === orderId ? { ...l, receivedQuantity: l.quantity } : l,
  );
  // Create invoice
  const order = purchaseOrders[idx];
  const newInvoice: PurchaseInvoice = {
    id: generateId(),
    number: `PI-${new Date().getFullYear()}-${String(purchaseInvoices.length + 1).padStart(3, '0')}`,
    postingDate: new Date().toISOString().split('T')[0],
    invoiceDate: new Date().toISOString().split('T')[0],
    vendorName: order.vendorName,
    vendorNumber: order.vendorNumber,
    totalAmountExcludingTax: order.totalAmountExcludingTax,
    totalAmountIncludingTax: order.totalAmountIncludingTax,
    status: 'Posted',
    orderNumber: order.number,
  };
  purchaseInvoices = [newInvoice, ...purchaseInvoices];
  return { ...purchaseOrders[idx] };
}

// ─── Purchase Order Lines ─────────────────────────────────────────────────────
export async function getPurchaseOrderLines(orderId: string): Promise<PurchaseOrderLine[]> {
  await delay();
  return purchaseOrderLines.filter(l => l.documentId === orderId);
}

export async function createPurchaseOrderLine(orderId: string, data: CreatePurchaseOrderLineInput): Promise<PurchaseOrderLine> {
  await delay();
  const orderIdx = purchaseOrders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) throw new ApiError(404, `Purchase order '${orderId}' not found`);
  const existingLines = purchaseOrderLines.filter(l => l.documentId === orderId);
  const maxSeq = existingLines.reduce((acc, l) => Math.max(acc, l.sequence), 0);
  const qty = data.quantity;
  const unitCost = data.directUnitCost;
  const discPct = data.discountPercent || 0;
  const amountExTax = qty * unitCost * (1 - discPct / 100);
  const amountInTax = amountExTax * 1.08;
  const newLine: PurchaseOrderLine = {
    id: generateId(),
    documentId: orderId,
    sequence: maxSeq + 10000,
    itemId: data.itemId || '',
    lineType: data.lineType || 'Item',
    lineObjectNumber: data.lineObjectNumber || '',
    description: data.description,
    unitOfMeasureCode: data.unitOfMeasureCode || 'EA',
    quantity: qty,
    directUnitCost: unitCost,
    discountPercent: discPct,
    discountAmount: qty * unitCost * (discPct / 100),
    amountExcludingTax: amountExTax,
    amountIncludingTax: amountInTax,
    taxCode: 'TAXABLE',
    expectedReceiptDate: data.expectedReceiptDate || '',
    receivedQuantity: 0,
    invoicedQuantity: 0,
  };
  purchaseOrderLines = [...purchaseOrderLines, newLine];
  // Recalculate order totals
  _recalcOrderTotals(orderId);
  return { ...newLine };
}

export async function updatePurchaseOrderLine(orderId: string, lineId: string, data: Partial<PurchaseOrderLine>): Promise<PurchaseOrderLine> {
  await delay();
  const idx = purchaseOrderLines.findIndex(l => l.id === lineId && l.documentId === orderId);
  if (idx === -1) throw new ApiError(404, `Line '${lineId}' not found on order '${orderId}'`);
  purchaseOrderLines[idx] = { ...purchaseOrderLines[idx], ...data };
  _recalcOrderTotals(orderId);
  return { ...purchaseOrderLines[idx] };
}

export async function deletePurchaseOrderLine(orderId: string, lineId: string): Promise<void> {
  await delay();
  const idx = purchaseOrderLines.findIndex(l => l.id === lineId && l.documentId === orderId);
  if (idx === -1) throw new ApiError(404, `Line '${lineId}' not found on order '${orderId}'`);
  purchaseOrderLines = purchaseOrderLines.filter(l => !(l.id === lineId && l.documentId === orderId));
  _recalcOrderTotals(orderId);
}

function _recalcOrderTotals(orderId: string): void {
  const lines = purchaseOrderLines.filter(l => l.documentId === orderId);
  const totalExTax = lines.reduce((acc, l) => acc + l.amountExcludingTax, 0);
  const totalInTax = lines.reduce((acc, l) => acc + l.amountIncludingTax, 0);
  const idx = purchaseOrders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    purchaseOrders[idx].totalAmountExcludingTax = totalExTax;
    purchaseOrders[idx].totalAmountIncludingTax = totalInTax;
    purchaseOrders[idx].totalTaxAmount = totalInTax - totalExTax;
  }
}

// ─── Purchase Invoices ────────────────────────────────────────────────────────
export async function getPurchaseInvoices(params?: { filter?: string; top?: number }): Promise<PurchaseInvoice[]> {
  await delay();
  let result = [...purchaseInvoices];
  if (params?.filter) {
    const q = params.filter.toLowerCase();
    result = result.filter(
      i =>
        i.number.toLowerCase().includes(q) ||
        i.vendorName.toLowerCase().includes(q) ||
        i.orderNumber.toLowerCase().includes(q),
    );
  }
  result.sort((a, b) => new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime());
  if (params?.top) result = result.slice(0, params.top);
  return result;
}

// ─── Units of Measure ────────────────────────────────────────────────────────
export async function getUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
  await delay();
  return [...unitsOfMeasure];
}

// ─── Locations ───────────────────────────────────────────────────────────────
export async function getLocations(): Promise<Location[]> {
  await delay();
  return [...locations];
}

// ─── Reset (for Settings screen) ─────────────────────────────────────────────
export function resetMockData(): void {
  vendors = [...seedVendors];
  items = [...seedItems];
  purchaseOrders = [...seedPurchaseOrders];
  purchaseOrderLines = [...seedPurchaseOrderLines];
  purchaseInvoices = [...seedPurchaseInvoices];
}
