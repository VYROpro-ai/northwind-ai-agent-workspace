import { Button, Checkbox, IconButton, Input, Select } from '@/components/ui';
import type { FieldType, ToolField } from '../data';
import { duplicateNames } from '../utils';

const fieldTypes: FieldType[] = ['Text', 'Number', 'Boolean', 'Date'];

/**
 * Key-value editor for a custom tool's inputs: name, type, required flag and the
 * description the agent reads. Later duplicates of a name are flagged.
 */
export function ToolInputsEditor({
  fields,
  onChange,
}: {
  fields: ToolField[];
  onChange: (fields: ToolField[]) => void;
}) {
  const dupes = duplicateNames(fields);
  const firstIndex = (name: string) => fields.findIndex((f) => f.name.trim().toLowerCase() === name);
  const update = (id: string, patch: Partial<ToolField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2 md:gap-[11px]">
        {fields.map((field, i) => {
          const key = field.name.trim().toLowerCase();
          const duplicate = dupes.has(key) && firstIndex(key) !== i;
          return (
            <li
              key={field.id}
              className="grid grid-cols-[minmax(0,1fr)_100px_28px] items-center gap-2 border-b border-border pb-2 last:border-0 md:grid-cols-[minmax(0,1fr)_100px_72px_minmax(0,1.4fr)_28px] md:border-0 md:pb-0"
            >
              <Input
                size="sm"
                value={field.name}
                invalid={duplicate}
                aria-label={`Field ${i + 1} name`}
                onChange={(e) => update(field.id, { name: e.target.value })}
                className="font-mono text-body-s"
              />
              <Select
                size="sm"
                aria-label={`Field ${i + 1} type`}
                value={field.type}
                options={fieldTypes.map((t) => ({ value: t, label: t }))}
                onChange={(e) => update(field.id, { type: e.target.value as FieldType })}
                className="text-13"
              />
              <IconButton
                icon="close"
                label={`Remove field ${field.name || i + 1}`}
                variant="ghost"
                size="xs"
                className="md:order-last"
                onClick={() => onChange(fields.filter((f) => f.id !== field.id))}
              />
              <Checkbox
                checked={field.required}
                onChange={(e) => update(field.id, { required: e.target.checked })}
                label={<span className="text-body-s">Req.</span>}
                className="items-center"
              />
              <Input
                size="sm"
                value={field.description}
                aria-label={`Field ${i + 1} description`}
                onChange={(e) => update(field.id, { description: e.target.value })}
                placeholder="When and how the agent should fill this"
                className="col-span-2 text-body-s text-fg-2 md:col-span-1"
              />
            </li>
          );
        })}
      </ul>
      {[...dupes].map((name) => (
        <p key={name} className="text-body-s text-danger-text" role="alert">
          Field names must be unique. “{name}” is used twice.
        </p>
      ))}
      <Button
        variant="link"
        className="self-start text-body-s"
        onClick={() =>
          onChange([
            ...fields,
            { id: `f-${Date.now()}`, name: '', type: 'Text', required: false, description: '' },
          ])
        }
      >
        + Add field
      </Button>
    </div>
  );
}
