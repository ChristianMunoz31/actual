import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { css } from '@emotion/css';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { FinancialText } from '#components/FinancialText';
import { useRechartsAnimation } from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { useFormat } from '#hooks/useFormat';

import { useMonthlyTrend } from './useDashboardData';
import type { MonthlyTrendRow } from './useDashboardData';

type MonthlyTrendWidgetProps = {
  numMonths?: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: { payload: MonthlyTrendRow }[];
  format: ReturnType<typeof useFormat>;
};

function CustomTooltip({ active, payload, format }: TooltipProps) {
  const { t } = useTranslation();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const row = payload[0].payload;
  return (
    <div
      className={css({
        borderRadius: 2,
        boxShadow: '0 1px 6px rgba(0, 0, 0, .20)',
        backgroundColor: theme.menuBackground,
        color: theme.menuItemText,
        padding: 10,
        minWidth: 150,
      })}
    >
      <div style={{ marginBottom: 8 }}>
        <strong>{monthUtils.format(row.month, 'MMMM yyyy')}</strong>
      </div>
      <AlignedText
        left={t('Income:')}
        right={<FinancialText>{format(row.income, 'financial')}</FinancialText>}
      />
      <AlignedText
        left={t('Expenses:')}
        right={
          <FinancialText>{format(row.expense, 'financial')}</FinancialText>
        }
      />
      <AlignedText
        left={t('Net:')}
        right={
          <FinancialText as="strong">
            {format(row.income - row.expense, 'financial')}
          </FinancialText>
        }
      />
    </div>
  );
}

export function MonthlyTrendWidget({ numMonths = 6 }: MonthlyTrendWidgetProps) {
  const { t } = useTranslation();
  const animationProps = useRechartsAnimation();
  const format = useFormat();
  const { data, isLoading } = useMonthlyTrend(numMonths);

  return (
    <View style={{ padding: 15, height: '100%' }}>
      <Text style={{ ...styles.mediumText, marginBottom: 10 }}>
        {t('Income vs. Expenses')}
      </Text>
      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.pageTextLight }}>
            <Trans>Loading…</Trans>
          </Text>
        </View>
      ) : (
        <Container>
          {(width, height) => (
            <LineChart
              responsive
              width={width}
              height={height}
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={value => monthUtils.format(value, 'MMM')}
                tick={{ fill: theme.pageText, fontSize: 11 }}
                tickLine={{ stroke: theme.pageText }}
              />
              <YAxis
                tickFormatter={value => format(value, 'financial-no-decimals')}
                tick={{ fill: theme.pageText, fontSize: 11 }}
                tickLine={{ stroke: theme.pageText }}
                tickSize={0}
              />
              <Tooltip
                content={<CustomTooltip format={format} />}
                isAnimationActive={false}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="income"
                name={t('Income')}
                stroke={theme.reportsGreen}
                strokeWidth={2}
                dot={false}
                {...animationProps}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name={t('Expenses')}
                stroke={theme.reportsRed}
                strokeWidth={2}
                dot={false}
                {...animationProps}
              />
            </LineChart>
          )}
        </Container>
      )}
    </View>
  );
}
