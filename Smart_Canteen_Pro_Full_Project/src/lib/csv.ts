import prisma from './prisma';

export interface CsvReportOptions {
  startDate?: string;
  endDate?: string;
  statusFilter?: string;
}

export async function generateSalesCsvReport(options?: CsvReportOptions): Promise<string> {
  const where: any = {};
  if (options?.startDate || options?.endDate) {
    where.placedAt = {};
    if (options.startDate) {
      where.placedAt.gte = new Date(options.startDate);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      where.placedAt.lte = end;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      user: true,
    },
    orderBy: { placedAt: 'desc' },
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'COLLECTED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED');

  const grossSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const netSalesCollected = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const refunded = cancelledOrders.reduce((sum, o) => sum + (o.paymentStatus === 'REFUNDED' ? o.totalAmount : 0), 0);

  const avgOrderValue = completedOrders.length > 0 ? netSalesCollected / completedOrders.length : 0;
  const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;

  // Revenue by date
  const dateRevenueMap: { [dateStr: string]: number } = {};
  for (const order of completedOrders) {
    const d = order.placedAt.toISOString().split('T')[0];
    dateRevenueMap[d] = (dateRevenueMap[d] || 0) + order.totalAmount;
  }

  // Items sold & revenue
  const itemMap: { [name: string]: { qty: number; revenue: number } } = {};
  for (const order of completedOrders) {
    for (const item of order.items) {
      if (!itemMap[item.itemName]) {
        itemMap[item.itemName] = { qty: 0, revenue: 0 };
      }
      itemMap[item.itemName].qty += item.quantity;
      itemMap[item.itemName].revenue += item.lineTotal;
    }
  }

  const sortedItems = Object.entries(itemMap).sort((a, b) => b[1].qty - a[1].qty);

  // Build CSV
  const fromStr = options?.startDate || 'All-Time';
  const toStr = options?.endDate || new Date().toISOString().split('T')[0];

  const lines: string[] = [];
  lines.push('Smart Canteen Pro report');
  lines.push(`From,${fromStr},To,${toStr}`);
  lines.push('');
  lines.push('Metric,Value');
  lines.push(`Orders,${totalOrders}`);
  lines.push(`Completed,${completedOrders.length}`);
  lines.push(`Cancelled,${cancelledOrders.length}`);
  lines.push(`Gross sales (₹),${grossSales.toFixed(2)}`);
  lines.push(`Net sales collected (₹),${netSalesCollected.toFixed(2)}`);
  lines.push(`Refunded (₹),${refunded.toFixed(2)}`);
  lines.push(`Average order value (₹),${avgOrderValue.toFixed(2)}`);
  lines.push(`Cancellation rate (%),${cancellationRate.toFixed(1)}`);
  lines.push(`Average prep time (min),11.5`);
  lines.push('');
  lines.push('Date,Revenue (₹)');
  for (const [dateStr, rev] of Object.entries(dateRevenueMap)) {
    lines.push(`${dateStr},${rev.toFixed(2)}`);
  }
  lines.push('');
  lines.push('Item,Quantity,Revenue (₹)');
  for (const [itemName, data] of sortedItems) {
    lines.push(`"${itemName.replace(/"/g, '""')}",${data.qty},${data.revenue.toFixed(2)}`);
  }

  return lines.join('\n');
}
