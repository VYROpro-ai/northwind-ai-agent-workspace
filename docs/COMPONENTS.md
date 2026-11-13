# Components

Everything below is exported from barrel files, so imports stay short:

```tsx
import { Button, Badge, Card, CardHeader, Modal, useToast } from '@/components/ui';
import { AgentMessage, Composer, ToolCall, ReasoningBlock } from '@/components/ai';
import { LineChart, BarChart, Sparkline, Donut, Gauge } from '@/components/charts';
import { Icon } from '@/components/icons';
```

Visit **`/design-system`** in the running app for live examples of every component and state.

## UI (`src/components/ui`)

| Component | Notes |
|---|---|
| `Button` | `variant`: primary · secondary · ghost · danger · ai · inverse · link — `size`: xs · sm · md · lg — `leftIcon`, `rightIcon`, `loading`, `pill` |
| `IconButton` | Icon-only; `label` is required for accessibility. `dot` shows an unread indicator |
| `Badge`, `StatusBadge`, `CountBadge` | Tones: neutral · brand · ai · ok · warn · danger · info · inverse. `StatusBadge` maps run states |
| `Avatar`, `AvatarGroup`, `AgentAvatar` | People are circles; agents are rounded squares |
| `Card`, `CardHeader` | Flat or raised containers with the dashboard header pattern |
| `Field`, `Input`, `Textarea`, `Select`, `Kbd` | `Field` wires label / hint / error and aria attributes |
| `Switch`, `Checkbox`, `Radio`, `Segmented`, `Slider` | Native inputs underneath — keyboard and screen-reader friendly |
| `Tabs` | `underline` or `pill`; items with `to` become router links |
| `Modal`, `Drawer` | Portal, scrim, focus trap, Escape, scroll lock |
| `Dropdown` | Menu with click-outside, Escape and arrow-key navigation |
| `Tooltip` | CSS-only, shows on hover and focus |
| `Alert`, `Banner` | Inline alerts and full-width global banners |
| `ToastProvider`, `useToast` | `toast({ title, description, tone, action })` |
| `Progress`, `Skeleton`, `EmptyState`, `Divider`, `Spinner` | Feedback states |
| `TableContainer`, `Table`, `THead`, `TR`, `TH`, `TD`, `Pagination` | Scrolls horizontally on small screens |
| `CodeBlock` | Dark code panel with copy button |

## AI (`src/components/ai`)

| Component | Notes |
|---|---|
| `UserMessage`, `AgentMessage`, `SystemMessage` | Chat thread building blocks |
| `Composer` | Text area + attach / prompts / voice; Send becomes Stop while streaming |
| `ToolCall`, `ToolCallGroup` | States: running · succeeded · failed · blocked · approval · timeout · reconnect; expandable I/O |
| `ReasoningBlock`, `ThoughtChip` | Collapsible reasoning steps |
| `CitationChip`, `SuggestionChip`, `TokenMeter` | Small AI parts |
| `AiBadge`, `StreamingCaret`, `TypingDots` | Streaming indicators |

## Charts (`src/components/charts`)

Dependency-free SVG charts that read colours from tokens (`color="var(--chart-1)"`) and resize fluidly.

| Component | Use |
|---|---|
| `Sparkline` | Trend in stat cards |
| `LineChart` + `Legend` | Multi-series lines/areas, dashed forecasts, threshold line, hover tooltip |
| `BarChart` | Stacked bars with highlight + tooltip |
| `BarList` | Ranked horizontal bars |
| `Donut`, `Gauge` | Share of total, credit usage |

## Icons

180 stroke icons on a 24 px grid (1.75 px stroke). Colour follows `currentColor`:

```tsx
<Icon name="tool-call" size={16} className="text-ai-text" />
```

Add an icon by appending an entry to `src/components/icons/icons.tsx` — the `IconName` type updates automatically.

## Layout

`AppShell` (`src/layouts/AppShell.tsx`) renders the sidebar, top bar and main area:

```tsx
<AppShell active="Runs" role="builder" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'All runs' }]}>
  …
</AppShell>
```

`role` filters the navigation the same way the product does (owner, admin, builder, reviewer, member, viewer).
