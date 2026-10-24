import prisma from './prisma';

export interface QueuePrediction {
  activeOrdersCount: number;
  estimatedWaitMinutes: number;
  crowdLevel: 'LOW' | 'MODERATE' | 'BUSY' | 'PEAK';
  crowdLabel: string;
  crowdColor: string;
  activeItemsInKitchen: number;
  isKitchenAccepting: boolean;
}

export async function getSmartQueuePrediction(): Promise<QueuePrediction> {
  try {
    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PREPARING'],
        },
      },
      include: {
        items: true,
      },
    });

    const activeOrdersCount = activeOrders.length;
    let totalItems = 0;
    for (const order of activeOrders) {
      for (const item of order.items) {
        totalItems += item.quantity;
      }
    }

    // Dynamic queue estimation formula:
    // Base 8 mins + ~1.5 mins per additional queued order + 0.5 mins per item
    let estimatedWaitMinutes = 8 + Math.round(activeOrdersCount * 1.5 + totalItems * 0.5);
    if (activeOrdersCount === 0) {
      estimatedWaitMinutes = 5;
    }

    let crowdLevel: 'LOW' | 'MODERATE' | 'BUSY' | 'PEAK' = 'LOW';
    let crowdLabel = 'Low Traffic • Fast Service';
    let crowdColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';

    if (activeOrdersCount >= 16) {
      crowdLevel = 'PEAK';
      crowdLabel = 'Peak Rush • Expect Delays';
      crowdColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    } else if (activeOrdersCount >= 10) {
      crowdLevel = 'BUSY';
      crowdLabel = 'Busy Queue • Moderate Wait';
      crowdColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    } else if (activeOrdersCount >= 5) {
      crowdLevel = 'MODERATE';
      crowdLabel = 'Moderate Queue • Normal Wait';
      crowdColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800';
    }

    return {
      activeOrdersCount,
      estimatedWaitMinutes,
      crowdLevel,
      crowdLabel,
      crowdColor,
      activeItemsInKitchen: totalItems,
      isKitchenAccepting: activeOrdersCount < 40,
    };
  } catch (e) {
    return {
      activeOrdersCount: 2,
      estimatedWaitMinutes: 10,
      crowdLevel: 'MODERATE',
      crowdLabel: 'Moderate Queue',
      crowdColor: 'text-sky-600 bg-sky-50',
      activeItemsInKitchen: 4,
      isKitchenAccepting: true,
    };
  }
}
