import { useEffect, useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';

import { useCategories } from '#hooks/useCategories';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { aqlQuery } from '#queries/aqlQuery';

export type CategoryBudgetRow = {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
};

export type MonthlyTrendRow = {
  month: string;
  income: number;
  expense: number;
};

function shortCellName(name: string): string {
  const idx = name.indexOf('!');
  return idx === -1 ? name : name.slice(idx + 1);
}

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

// Budgeted vs actual spending per expense category for a single month.
// Reads the same budget-sheet cells the Budget page uses, so figures match
// exactly. `sum-amount-{id}` is negative for spending; we surface it as a
// positive magnitude.
export function useMonthlyCategoryBudget(month: string): {
  data: CategoryBudgetRow[];
  isLoading: boolean;
} {
  const { data: categories } = useCategories();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const [data, setData] = useState<CategoryBudgetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const handler =
      budgetType === 'tracking'
        ? 'tracking-budget-month'
        : 'envelope-budget-month';

    send(handler, { month })
      .then(cells => {
        if (cancelled) {
          return;
        }

        const valueByCell = new Map<string, number>();
        for (const cell of cells) {
          valueByCell.set(shortCellName(cell.name), toNumber(cell.value));
        }

        const expenseCategories = (categories?.list ?? []).filter(
          category => !category.is_income && !category.hidden,
        );

        setData(
          expenseCategories.map(category => ({
            id: category.id,
            name: category.name,
            budgeted: valueByCell.get(`budget-${category.id}`) ?? 0,
            spent: -(valueByCell.get(`sum-amount-${category.id}`) ?? 0),
          })),
        );
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month, budgetType, categories]);

  return { data, isLoading };
}

function trendQuery(startMonth: string, endMonth: string, income: boolean) {
  return q('transactions')
    .filter({
      $and: [
        { date: { $transform: '$month', $gte: startMonth } },
        { date: { $transform: '$month', $lte: endMonth } },
      ],
      'account.offbudget': false,
      'payee.transfer_acct': null,
      amount: income ? { $gt: 0 } : { $lt: 0 },
    })
    .groupBy({ $month: '$date' })
    .select([{ month: { $month: '$date' } }, { amount: { $sum: '$amount' } }]);
}

// On-budget income vs expense totals for the last `numMonths` months,
// excluding transfers. Expense is surfaced as a positive magnitude.
export function useMonthlyTrend(numMonths: number = 6): {
  data: MonthlyTrendRow[];
  isLoading: boolean;
} {
  const [data, setData] = useState<MonthlyTrendRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const endMonth = monthUtils.currentMonth();
    const startMonth = monthUtils.subMonths(endMonth, numMonths - 1);

    Promise.all([
      aqlQuery(trendQuery(startMonth, endMonth, true)),
      aqlQuery(trendQuery(startMonth, endMonth, false)),
    ])
      .then(([incomeResult, expenseResult]) => {
        if (cancelled) {
          return;
        }

        const incomeByMonth = new Map<string, number>(
          incomeResult.data.map((row: { month: string; amount: number }) => [
            row.month,
            row.amount,
          ]),
        );
        const expenseByMonth = new Map<string, number>(
          expenseResult.data.map((row: { month: string; amount: number }) => [
            row.month,
            row.amount,
          ]),
        );

        setData(
          monthUtils.rangeInclusive(startMonth, endMonth).map(month => ({
            month,
            income: incomeByMonth.get(month) ?? 0,
            expense: -(expenseByMonth.get(month) ?? 0),
          })),
        );
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [numMonths]);

  return { data, isLoading };
}
