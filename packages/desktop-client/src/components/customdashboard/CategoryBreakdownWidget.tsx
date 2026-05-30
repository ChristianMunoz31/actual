import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  getColorScale,
  useRechartsAnimation,
} from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { useFormat } from '#hooks/useFormat';

import { topNWithOther, useMonthlyCategoryBudget } from './useDashboardData';

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
      <PrivacyFilter>
        <FinancialText>
          {format(datum.spent, 'financial')} ({t('{{percent}}%', { percent })})
        </FinancialText>
      </PrivacyFilter>
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
  const chartData: BreakdownDatum[] = topNWithOther(
    data.filter(row => row.spent > 0),
    8,
    row => row.spent,
    t('Other'),
  ).map(row => ({ name: row.name, spent: row.spent }));
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
            <PieChart
              width={width}
              height={height}
              accessibilityLayer
              aria-label={t('Spending share by category')}
            >
              <Pie
                data={chartData}
                dataKey="spent"
                nameKey="name"
                cx="50%"
                cy="44%"
                innerRadius={Math.min(width, height) / 6}
                outerRadius={Math.min(width, height) / 3.2}
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
              <Legend
                verticalAlign="bottom"
                iconSize={10}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          )}
        </Container>
      )}
    </View>
  );
}
