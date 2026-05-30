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
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useRechartsAnimation } from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { getCustomTick } from '#components/reports/getCustomTick';
import { useFormat } from '#hooks/useFormat';
import { usePrivacyMode } from '#hooks/usePrivacyMode';

import { topNWithOther, useMonthlyCategoryBudget } from './useDashboardData';
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
  const budgeted = row.budgeted || 0;
  const spent = row.spent || 0;
  const remaining = budgeted - spent || 0;
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
          <PrivacyFilter>
            <FinancialText>{format(budgeted, 'financial')}</FinancialText>
          </PrivacyFilter>
        }
      />
      <AlignedText
        left={t('Spent:')}
        right={
          <PrivacyFilter>
            <FinancialText>{format(spent, 'financial')}</FinancialText>
          </PrivacyFilter>
        }
      />
      <AlignedText
        left={t('Remaining:')}
        right={
          <PrivacyFilter>
            <FinancialText as="strong">
              {format(remaining, 'financial')}
            </FinancialText>
          </PrivacyFilter>
        }
      />
    </div>
  );
}

export function BudgetVsActualWidget({ month }: BudgetVsActualWidgetProps) {
  const { t } = useTranslation();
  const animationProps = useRechartsAnimation();
  const format = useFormat();
  const privacyMode = usePrivacyMode();
  const { data, isLoading } = useMonthlyCategoryBudget(month);

  const chartData = topNWithOther(
    data.filter(row => row.budgeted !== 0 || row.spent !== 0),
    10,
    row => Math.max(row.budgeted, row.spent),
    t('Other'),
  );

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
              accessibilityLayer
              aria-label={t('Budgeted versus actual spending by category')}
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
                tickFormatter={value =>
                  getCustomTick(
                    format(value, 'financial-no-decimals'),
                    privacyMode,
                  )
                }
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
