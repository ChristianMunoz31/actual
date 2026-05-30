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
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useRechartsAnimation } from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { getCustomTick } from '#components/reports/getCustomTick';
import { useFormat } from '#hooks/useFormat';
import { usePrivacyMode } from '#hooks/usePrivacyMode';

import { useMonthlyTrend } from './useDashboardData';
import type { MonthlyTrendRow } from './useDashboardData';

type MonthlyTrendWidgetProps = {
  month: string;
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
  const income = row.income || 0;
  const expense = row.expense || 0;
  const net = income - expense || 0;
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
        right={
          <PrivacyFilter>
            <FinancialText>{format(income, 'financial')}</FinancialText>
          </PrivacyFilter>
        }
      />
      <AlignedText
        left={t('Expenses:')}
        right={
          <PrivacyFilter>
            <FinancialText>{format(expense, 'financial')}</FinancialText>
          </PrivacyFilter>
        }
      />
      <AlignedText
        left={t('Net:')}
        right={
          <PrivacyFilter>
            <FinancialText as="strong">
              {format(net, 'financial')}
            </FinancialText>
          </PrivacyFilter>
        }
      />
    </div>
  );
}

export function MonthlyTrendWidget({
  month,
  numMonths = 6,
}: MonthlyTrendWidgetProps) {
  const { t } = useTranslation();
  const animationProps = useRechartsAnimation();
  const format = useFormat();
  const privacyMode = usePrivacyMode();
  const { data, isLoading } = useMonthlyTrend(numMonths, month);

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
              accessibilityLayer
              aria-label={t(
                'Income versus expenses over the last {{count}} months',
                {
                  count: numMonths,
                },
              )}
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
