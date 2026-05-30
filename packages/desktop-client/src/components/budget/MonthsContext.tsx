// @ts-strict-ignore
import React, { createContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';

export type MonthBounds = {
  start: string;
  end: string;
};

export function getValidMonthBounds(
  bounds: MonthBounds,
  startMonth: undefined | string,
  endMonth: string,
) {
  return {
    start: startMonth < bounds.start ? bounds.start : startMonth,
    end: endMonth > bounds.end ? bounds.end : endMonth,
  };
}

type MonthsContextProps = {
  months: string[];
  type: string;
};

export const MonthsContext = createContext<MonthsContextProps>(null);

type MonthsProviderProps = {
  startMonth: string | undefined;
  numMonths: number;
  monthBounds: MonthBounds;
  type: string;
  children: ReactNode;
};

export function MonthsProvider({
  startMonth,
  numMonths,
  monthBounds,
  type,
  children,
}: MonthsProviderProps) {
  // Memoized so the context value (and the derived `months` array) keeps a
  // stable identity across parent re-renders — otherwise every consumer
  // (each month column / budget cell) re-renders on any parent change. This is
  // the sanctioned manual-memo exception to React Compiler (a Context value).
  const value = useMemo(() => {
    const endMonth = monthUtils.addMonths(startMonth, numMonths - 1);
    const bounds = getValidMonthBounds(monthBounds, startMonth, endMonth);
    const months = monthUtils.rangeInclusive(bounds.start, bounds.end);
    return { months, type };
  }, [startMonth, numMonths, monthBounds, type]);

  return (
    <MonthsContext.Provider value={value}>{children}</MonthsContext.Provider>
  );
}
