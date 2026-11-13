import { useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { AppShell } from '@/layouts/AppShell';
import { Badge, Button, Card, Dropdown, Field, Input, Segmented, Select, useToast } from '@/components/ui';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { JsonPanel } from './components/JsonPanel';
import { boardSegmented, fieldLabels, labelText } from './utils';
import { ToolInputsEditor } from './components/ToolInputsEditor';
import { stockResponse, toolFields, toolRiskLevels } from './data';
import { duplicateNames } from './utils';

type Auth = 'none' | 'key' | 'oauth';
type RiskLevel = (typeof toolRiskLevels)[number]['value'];
type TestResult = { ok: boolean; ms: number; body: Record<string, string | number> };

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ value: m, label: m }));

const headersByAuth: Record<Auth, { name: string; value: string } | null> = {
  none: null,
  key: { name: 'X-Api-Key', value: '•••• vault: inventory-key' },
  oauth: { name: 'Authorization', value: 'Bearer •••• from OAuth' },
};

const sectionTitle = 'text-[15px] leading-[22px] font-semibold text-fg';

function RiskSelect({ value, onChange }: { value: RiskLevel; onChange: (value: RiskLevel) => void }) {
  const current = toolRiskLevels.find((r) => r.value === value) ?? toolRiskLevels[0];
  return (
    <Dropdown
      width={280}
      items={toolRiskLevels.map((r) => ({
        label: r.label,
        description: r.hint,
        icon: r.value === value ? 'check' : undefined,
        onSelect: () => onChange(r.value),
      }))}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="flex h-9 w-full items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 text-left transition-colors hover:bg-subtle"
        >
          <span className="sr-only">Risk level:</span>
          <Badge tone={current.tone} bordered={false} className="h-5 px-2 text-body-s">
            {current.label}
          </Badge>
          <span className="truncate text-body-s text-fg-3">{current.hint}</span>
          <Icon name="chevron-down" size={14} strokeWidth={2} className="ml-auto shrink-0 text-fg-3" />
        </button>
      )}
    />
  );
}

/** W8-06 · Custom tool editor — HTTP tool definition, agent-facing inputs and a test request panel. */
export default function CustomTool() {
  const toast = useToast();
  const [name, setName] = useState('inventory.check_stock');
  const [risk, setRisk] = useState<RiskLevel>('read');
  const [description, setDescription] = useState('Checks stock.');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://inventory.northwindlabs.com/v2/stock/{sku}');
  const [auth, setAuth] = useState<Auth>('key');
  const [fields, setFields] = useState(toolFields);
  const [testValues, setTestValues] = useState<Record<string, string>>({ sku: 'LMP-204', warehouse: 'Reno' });
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult>({ ok: true, ms: 184, body: stockResponse });

  const dupes = duplicateNames(fields);
  const testFields = fields.filter(
    (f, i) => f.name.trim() && fields.findIndex((g) => g.name.trim() === f.name.trim()) === i,
  );
  const header = headersByAuth[auth];

  const sendTest = () => {
    setTesting(true);
    window.setTimeout(() => {
      const missing = testFields.find((f) => f.required && !testValues[f.name]?.trim());
      if (missing) {
        setResult({
          ok: false,
          ms: 41,
          body: { error: 'validation_failed', message: `${missing.name} is required` },
        });
      } else {
        const sku = testValues.sku?.trim() || 'LMP-204';
        const stock = [...sku].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 90;
        setResult({
          ok: true,
          ms: 120 + (stock % 80),
          body: {
            ...stockResponse,
            sku,
            warehouse: testValues.warehouse?.trim() || 'All',
            in_stock: stock,
          },
        });
      }
      setTesting(false);
    }, 700);
  };

  const save = () => {
    if (dupes.size) {
      toast({
        title: 'Fix the inputs before saving',
        description: 'Field names must be unique.',
        tone: 'danger',
      });
      return;
    }
    toast({
      title: 'Tool saved',
      description: `${name} is available to agents in this workspace.`,
      tone: 'ok',
    });
  };

  const copyResponse = () => {
    void navigator.clipboard?.writeText(JSON.stringify(result.body, null, 2)).catch(() => undefined);
    toast({ title: 'Response copied', tone: 'ok' });
  };

  return (
    <AppShell
      active="Integrations"
      role="builder"
      crumbs={[{ label: 'Custom tools', to: '/integrations' }, { label: 'Check stock level' }]}
    >
      <div className="flex flex-wrap items-center gap-2 text-13">
        <nav aria-label="Tool location" className="flex min-w-0 flex-1 items-center gap-2">
          <Link to="/integrations" className="font-medium text-link hover:underline">
            Custom tools
          </Link>
          <span className="text-fg-3" aria-hidden>
            /
          </span>
          <span className="truncate text-fg-2" aria-current="page">
            Check stock level
          </span>
        </nav>
        <h1 className="sr-only">Check stock level</h1>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="download"
          onClick={() =>
            toast({
              title: 'Import from an OpenAPI file',
              description: 'Paste a URL or drop a .yaml / .json spec.',
            })
          }
        >
          Import from API spec
        </Button>
        <Button size="sm" onClick={save}>
          Save tool
        </Button>
      </div>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <div className="flex w-full min-w-0 flex-col gap-4 xl:flex-1">
          <Card padding="none" className="flex flex-col gap-3.5 rounded-[18px] p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Tool name" className={fieldLabels}>
                {(id) => (
                  <Input
                    id={id}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-mono text-body-s"
                    spellCheck={false}
                  />
                )}
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className={labelText}>Risk level</span>
                <RiskSelect value={risk} onChange={setRisk} />
              </div>
            </div>

            <Field label="Description" className={fieldLabels}>
              {(id) => (
                <div className="flex flex-col gap-1.5">
                  <Input
                    id={id}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-10"
                  />
                  {description.trim().length < 60 && (
                    <InlineNotice tone="ai" className="items-start rounded-md px-2.5 py-2 text-body-s">
                      Agents use this text to choose tools. Add when to use it, e.g. “Use when a customer asks
                      if an item is in stock or when it ships.”
                    </InlineNotice>
                  )}
                </div>
              )}
            </Field>

            <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2">
              <Field label="Method" className={fieldLabels}>
                {(id) => (
                  <Select
                    id={id}
                    value={method}
                    options={methods}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                )}
              </Field>
              <Field label="URL" className={fieldLabels}>
                {(id) => (
                  <Input
                    id={id}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="font-mono text-body-s"
                    spellCheck={false}
                  />
                )}
              </Field>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <span className={labelText}>Auth</span>
                <Segmented
                  label="Auth"
                  size="sm"
                  className={cn(boardSegmented, '[&>button]:h-7')}
                  value={auth}
                  onChange={setAuth}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'key', label: 'API key' },
                    { value: 'oauth', label: 'OAuth' },
                  ]}
                />
              </div>
              <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1.5">
                <span className={labelText}>Headers</span>
                <div className="flex min-h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 font-mono text-body-s">
                  {header ? (
                    <>
                      <span className="text-fg">{header.name}</span>
                      <span className="truncate text-fg-3">{header.value}</span>
                    </>
                  ) : (
                    <span className="font-sans text-fg-3">No auth headers</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="none" className="flex flex-col gap-2.5 rounded-[18px] p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3">
              <h2 className={sectionTitle}>Inputs</h2>
              <span className="text-body-s text-fg-3">The agent fills these in</span>
            </div>
            <ToolInputsEditor fields={fields} onChange={setFields} />
          </Card>
        </div>

        <Card
          padding="none"
          className="flex w-full min-w-0 shrink-0 flex-col gap-3 rounded-[18px] p-4 xl:w-[380px]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className={sectionTitle}>Test</h2>
            <Badge
              tone={result.ok ? 'ok' : 'danger'}
              icon={result.ok ? 'check-sm' : 'close'}
              bordered={false}
              className="h-5 border-transparent px-2 text-body-s"
            >
              {result.ok ? 'Last test passed' : 'Last test failed'}
            </Badge>
          </div>
          {testFields.map((field) => (
            <Field key={field.id} label={field.name} required={field.required} className={fieldLabels}>
              {(id) => (
                <Input
                  id={id}
                  size="sm"
                  value={testValues[field.name] ?? ''}
                  onChange={(e) => setTestValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  className="font-mono text-body-s"
                />
              )}
            </Field>
          ))}
          <Button leftIcon="play" fullWidth className="text-13" loading={testing} onClick={sendTest}>
            Send test request
          </Button>
          <div className="flex items-center gap-2" aria-live="polite">
            <Badge
              tone={result.ok ? 'ok' : 'danger'}
              bordered={false}
              className="h-5 border-transparent px-2 text-body-s"
            >
              {result.ok ? '200 OK' : '422 Unprocessable'}
            </Badge>
            <span className="font-mono text-body-s text-fg-3">{result.ms} ms</span>
            <Button variant="link" className="ml-auto text-body-s" onClick={copyResponse}>
              Copy response
            </Button>
          </div>
          <JsonPanel data={result.body} className={cn(testing && 'opacity-60')} />
          <p className="text-body-s text-fg-3">Saved as the output example the agent sees.</p>
        </Card>
      </div>
    </AppShell>
  );
}
