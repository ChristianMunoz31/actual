import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import { FinancialText } from '#components/FinancialText';
import {
  getColorScale,
  useRechartsAnimation,
} from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { useFormat } from '#hooks/useFormat';

import { useMonthlyCategoryBudget } from './useDashboardData';

type CategoryBreakdownWidgetProps = {
  month: string;
};

type BreakdownDatum = {
  name: string;
  spent: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: { payload: BreakdownDatum }[];
  total: number;
  format: ReturnType<typeof useFormat>;
};

function CustomTooltip({ active, payload, total, format }: TooltipProps) {
  const { t } = useTranslation();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const datum = payload[0].payload;
  const percent = total > 0 ? Math.round((datum.spent / total) * 100) : 0;
  return (
    <div
      className={css({
        borderRadius: 2,
        boxShadow: '0 1px 6px rgba(0, 0, 0, .20)',
        backgroundColor: theme.menuBackground,
        color: theme.menuItemText,
        padding: 10,
      })}
    >
      <div style={{ marginBottom: 4 }}>
        <strong>{datum.name}</strong>
      </div>
      <FinancialText>
        {format(datum.spent, 'financial')} ({t('{{percent}}%', { percent })})
      </FinancialText>
    </div>
  );
}

export function CategoryBreakdownWidget({
  month,
}: CategoryBreakdownWidgetProps) {
  const { t } = useTranslation();
  const animationProps = useRechartsAnimation();
  const format = useFormat();
  const { data, isLoading } = useMonthlyCategoryBudget(month);

  const colors = getColorScale('qualitative');
  const chartData: BreakdownDatum[] = data
    .filter(row => row.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .map(row => ({ name: row.name, spent: row.spent }));
  const total = chartData.reduce((sum, row) => sum + row.spent, 0);

  return (
    <View style={{ padding: 15, height: '100%' }}>
      <Text style={{ ...styles.mediumText, marginBottom: 10 }}>
        {t('Spending by Category')}
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
            <Trans>No spending this month.</Trans>
          </Text>
        </View>
      ) : (
        <Container>
          {(width, height) => (
            <PieChart width={width} height={height}>
              <Pie
                data={chartData}
                dataKey="spent"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={Math.min(width, height) / 5}
                outerRadius={Math.min(width, height) / 2.8}
                {...animationProps}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip total={total} format={format} />}
                isAnimationActive={false}
              />
            </PieChart>
          )}
        </Container>
      )}
    </View>
  );
}
