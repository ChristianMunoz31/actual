import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgArrowLeft, SvgArrowRight } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Page } from '#components/Page';
import { ReportCard } from '#components/reports/ReportCard';

import { BudgetVsActualWidget } from './BudgetVsActualWidget';
import { CategoryBreakdownWidget } from './CategoryBreakdownWidget';
import { MonthlyTrendWidget } from './MonthlyTrendWidget';

const CARD_HEIGHT = 380;

export function CustomDashboard() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(monthUtils.currentMonth());

  return (
    <Page header={t('Dashboard')}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Button
          variant="bare"
          aria-label={t('Previous month')}
          onPress={() => setMonth(prev => monthUtils.subMonths(prev, 1))}
        >
          <SvgArrowLeft width={12} height={12} />
        </Button>
        <Text
          style={{ ...styles.mediumText, minWidth: 160, textAlign: 'center' }}
        >
          {monthUtils.format(month, 'MMMM yyyy')}
        </Text>
        <Button
          variant="bare"
          aria-label={t('Next month')}
          onPress={() => setMonth(prev => monthUtils.addMonths(prev, 1))}
        >
          <SvgArrowRight width={12} height={12} />
        </Button>
      </View>

      <View
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        <View style={{ gridColumn: 'span 2', height: CARD_HEIGHT }}>
          <ReportCard size={2}>
            <BudgetVsActualWidget month={month} />
          </ReportCard>
        </View>
        <View style={{ gridColumn: 'span 1', height: CARD_HEIGHT }}>
          <ReportCard size={1}>
            <CategoryBreakdownWidget month={month} />
          </ReportCard>
        </View>
        <View style={{ gridColumn: 'span 3', height: CARD_HEIGHT }}>
          <ReportCard size={3}>
            <MonthlyTrendWidget numMonths={6} />
          </ReportCard>
        </View>
      </View>
    </Page>
  );
}
