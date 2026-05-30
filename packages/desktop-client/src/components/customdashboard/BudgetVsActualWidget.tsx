import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { FinancialText } from '#components/FinancialText';
import { useRechartsAnimation } from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { useFormat } from '#hooks/useFormat';

import { useMonthlyCategoryBudget } from './useDashboardData';
import type { CategoryBudgetRow } from './useDashboardData';

type BudgetVsActualWidgetProps = {
  month: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: { payload: CategoryBudgetRow }[];
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
        <strong>{row.name}</strong>
      </div>
      <AlignedText
        left={t('Budgeted:')}
        right={
          <FinancialText>{format(row.budgeted, 'financial')}</FinancialText>
        }
      />
      <AlignedText
        left={t('Spent:')}
        right={<FinancialText>{format(row.spent, 'financial')}</FinancialText>}
      />
      <AlignedText
        left={t('Remaining:')}
        right={
          <FinancialText as="strong">
            {format(row.budgeted - row.spent, 'financial')}
          </FinancialText>
        }
      />
    </div>
  );
}

export function BudgetVsActualWidget({ month }: BudgetVsActualWidgetProps) {
  const { t } = useTranslation();
  const animationProps = useRechartsAnimation();
  const format = useFormat();
  const { data, isLoading } = useMonthlyCategoryBudget(month);

  const chartData = data.filter(row => row.budgeted !== 0 || row.spent !== 0);

  return (
    <View style={{ padding: 15, height: '100%' }}>
      <Text style={{ ...styles.mediumText, marginBottom: 10 }}>
        {t('Budget vs. Actual')}
      </Text>
      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.pageTextLight }}>
            <Trans>Loading…</Trans>
          </Text>
        </View>
      ) : chartData.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.pageTextLight }}>
            <Trans>No budgeted categories this month.</Trans>
          </Text>
        </View>
      ) : (
        <Container>
          {(width, height) => (
            <BarChart
              responsive
              width={width}
              height={height}
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-35}
                height={70}
                textAnchor="end"
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
                cursor={{ fill: 'transparent' }}
                content={<CustomTooltip format={format} />}
                isAnimationActive={false}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="budgeted"
                name={t('Budgeted')}
                fill={theme.reportsBlue}
                {...animationProps}
              />
              <Bar
                dataKey="spent"
                name={t('Spent')}
                fill={theme.reportsRed}
                {...animationProps}
              />
            </BarChart>
          )}
        </Container>
      )}
    </View>
  );
}
