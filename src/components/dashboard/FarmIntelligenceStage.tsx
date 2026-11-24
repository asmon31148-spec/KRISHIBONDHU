'use client';

import React from 'react';
import { UnifiedFarmAnalytics, UnifiedFarmAnalyticsProps } from './UnifiedFarmAnalytics';

export type FarmIntelligenceStageProps = UnifiedFarmAnalyticsProps;

export function FarmIntelligenceStage(props: FarmIntelligenceStageProps) {
  return <UnifiedFarmAnalytics {...props} />;
}

export { UnifiedFarmAnalytics };
