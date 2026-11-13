import { Tabs } from '@/components/ui';

const items = [
  { value: 'all', label: 'All runs', to: '/runs' },
  { value: 'live', label: 'Live logs', to: '/runs/live' },
  { value: 'alerts', label: 'Alerts', to: '/runs/alerts' },
  { value: 'incidents', label: 'Incidents', to: '/runs/incidents' },
];

/** Section tabs shared by the Runs, Live logs, Alerts and Incidents pages. */
export function RunsTabs() {
  return <Tabs items={items} label="Runs sections" />;
}
