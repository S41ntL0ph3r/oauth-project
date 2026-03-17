export const ANALYTICS_EVENTS = {
  dashboardOpened: 'dashboard_opened',
  expenseAdded: 'expense_added',
  expenseDeleted: 'expense_deleted',
  categoryCreated: 'category_created',
  financialChartViewed: 'financial_chart_viewed',
  budgetCreated: 'budget_created',
  budgetUpdated: 'budget_updated',
  budgetDeleted: 'budget_deleted',
  backupOpened: 'backup_opened',
  backupCreated: 'backup_created',
  featureVisited: 'feature_visited',
  navigationChanged: 'navigation_changed',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsEventPayload {
  event: AnalyticsEventName;
  distinctId: string;
  properties?: AnalyticsProperties;
}
