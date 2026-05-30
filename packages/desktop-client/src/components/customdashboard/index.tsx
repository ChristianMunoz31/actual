import React from 'react';
import { useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';

import { LoadComponent } from '#components/util/LoadComponent';

export function CustomDashboardPage() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }} data-testid="custom-dashboard-page">
      <LoadComponent
        name="CustomDashboard"
        message={t('Loading dashboard…')}
        importer={() =>
          import(/* webpackChunkName: 'custom-dashboard' */ './CustomDashboard')
        }
      />
    </View>
  );
}
