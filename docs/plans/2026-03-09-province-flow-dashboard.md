# Province Flow Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Vue 3 dashboard page that compares provider A and B shipment volume across same-province and cross-province flows, with weight-band analysis driven by the attached Excel dataset.

**Architecture:** Convert the Excel attachment into a local typed dataset, derive all dashboard views from a single aggregation layer, and render the analysis through reusable Vue components wired into the existing route and sidebar system. Keep `结算重量(吨)` as the primary metric and allow `票数` as a view toggle that reuses the same aggregation contracts.

**Tech Stack:** Vue 3, TypeScript, Vite, Element Plus, Vue Router, Pinia, ECharts or Vue ECharts, local static dataset module

---

### Task 1: Prepare dashboard dependencies and source dataset

**Files:**
- Modify: `package.json`
- Create: `src/data/province-flow-dashboard/rawData.ts`
- Create: `src/data/province-flow-dashboard/types.ts`
- Create: `src/data/province-flow-dashboard/README.md`

**Step 1: Add the charting dependency**

Update `package.json` to add one charting path only. Prefer `echarts` plus `vue-echarts` if wrapper ergonomics are useful, otherwise plain `echarts`.

**Step 2: Create the typed raw data contracts**

Define exact types for:

```ts
export type ProviderCode = '甲' | '乙'
export type FlowType = '同省' | '不同省'
export type MetricType = 'weight' | 'tickets'
```

Include a `RawRecord` type with:

- `shipProvince`
- `receiveProvince`
- `orderDate`
- `provider`
- `totalWeight`
- `ticketCount`
- `pieceCount`
- `avgWeight`
- `countyCoverage`
- `flowType`
- `flowKey`
- `weightBands.band0300`
- `weightBands.band300600`
- `weightBands.band6001200`
- `weightBands.band1200Plus`

**Step 3: Convert the Excel attachment into a local module**

Create `src/data/province-flow-dashboard/rawData.ts` with exported typed rows based on the attachment:

`c:\Users\ZTOCC\Downloads\query_result_2026-03-09T11_19_30.144777113+08_00.xlsx`

Store only the fields needed by the dashboard. Derive `flowType` and `flowKey` during conversion.

**Step 4: Document the dataset source**

In `src/data/province-flow-dashboard/README.md`, note:

- source file path
- conversion date
- field mapping
- rule for same-province vs cross-province

**Step 5: Install dependencies and verify**

Run: `npm install`

Expected: lockfile updates with charting packages present.

**Step 6: Commit**

```bash
git add package.json package-lock.json src/data/province-flow-dashboard
git commit -m "feat: add province flow dashboard data source"
```

### Task 2: Build aggregation utilities

**Files:**
- Create: `src/views/data-analysis/province-flow-dashboard/utils/aggregation.ts`
- Create: `src/views/data-analysis/province-flow-dashboard/utils/format.ts`
- Create: `src/views/data-analysis/province-flow-dashboard/utils/constants.ts`

**Step 1: Define fixed weight-band metadata**

In `constants.ts`, export ordered band definitions:

```ts
export const WEIGHT_BANDS = [
  { key: 'band0300', label: '0-300kg' },
  { key: 'band300600', label: '300-600kg' },
  { key: 'band6001200', label: '600-1200kg' },
  { key: 'band1200Plus', label: '1200+kg' }
]
```

**Step 2: Write the minimal aggregation helpers**

Implement pure functions for:

- filtering records by dashboard state
- computing overview totals
- grouping by flow type and provider
- grouping cross-province rows by `flowKey`
- grouping by weight band and provider
- computing `difference` and `differenceRate`

Guard `differenceRate` so division by zero returns `null`.

**Step 3: Add formatter helpers**

Implement concise formatters for:

- tons with 2-3 decimals
- tickets as integer
- percent with fallback to `--`
- signed differences

**Step 4: Add a lightweight verification script or sample assertions**

Create inline assertions or a simple exported `debugAggregateSnapshot()` function that can be invoked during development to confirm:

- same-province and cross-province split is stable
- band sums roughly match total weight
- provider totals are non-negative

**Step 5: Verify by importing into a temporary console log in the dashboard page**

Run: `npm run build`

Expected: TypeScript and bundling pass with the new utility layer.

**Step 6: Commit**

```bash
git add src/views/data-analysis/province-flow-dashboard/utils
git commit -m "feat: add province flow dashboard aggregations"
```

### Task 3: Build the dashboard shell and state model

**Files:**
- Create: `src/views/data-analysis/province-flow-dashboard/index.vue`
- Create: `src/views/data-analysis/province-flow-dashboard/types.ts`
- Create: `src/views/data-analysis/province-flow-dashboard/composables/useDashboardState.ts`

**Step 1: Define the dashboard state contract**

Create the state shape:

```ts
export type DashboardState = {
  dateRange: [string, string] | []
  shipProvince: string[]
  receiveProvince: string[]
  flowType: '全部' | '同省' | '不同省'
  metric: 'weight' | 'tickets'
  activeFlowKey: string | null
}
```

**Step 2: Implement a composable for state and reset logic**

Expose:

- initial state
- setters for each filter
- `setActiveFlowKey`
- `resetDrilldown`

**Step 3: Build the page shell**

In `index.vue`, wire:

- filter bar slot area
- metric cards area
- comparison charts area
- detail table area

Use computed properties so all downstream components consume one filtered aggregate source.

**Step 4: Add empty-state handling**

If filtered data is empty, show a clear empty state instead of zeroed charts.

**Step 5: Verify route-level rendering**

Run: `npm run dev`

Expected: page mounts without runtime errors when temporarily routed directly.

**Step 6: Commit**

```bash
git add src/views/data-analysis/province-flow-dashboard
git commit -m "feat: create province flow dashboard shell"
```

### Task 4: Implement filter and overview components

**Files:**
- Create: `src/views/data-analysis/province-flow-dashboard/components/DashboardFilterBar.vue`
- Create: `src/views/data-analysis/province-flow-dashboard/components/OverviewMetricCards.vue`

**Step 1: Build the filter bar**

Include:

- date range picker
- ship province multi-select
- receive province multi-select
- flow type radio group or segmented control
- metric toggle for `结算重量(吨)` and `票数`
- reset button

Emit only state changes; do not aggregate here.

**Step 2: Build the overview cards**

Render:

- 甲总货量
- 乙总货量
- 总差值
- 同省差值
- 不同省差值
- 不同省占比

Support clicking same-province and cross-province cards to set `flowType`.

**Step 3: Apply consistent visual encoding**

Keep provider colors and positive/negative difference colors fixed and reusable.

**Step 4: Verify interaction**

Run: `npm run dev`

Expected: filter state updates card values and card clicks change downstream charts.

**Step 5: Commit**

```bash
git add src/views/data-analysis/province-flow-dashboard/components/DashboardFilterBar.vue src/views/data-analysis/province-flow-dashboard/components/OverviewMetricCards.vue
git commit -m "feat: add province flow dashboard filters and overview"
```

### Task 5: Implement chart components

**Files:**
- Create: `src/views/data-analysis/province-flow-dashboard/components/FlowTypeCompareChart.vue`
- Create: `src/views/data-analysis/province-flow-dashboard/components/InterProvinceDiffChart.vue`
- Create: `src/views/data-analysis/province-flow-dashboard/components/WeightBandCompareChart.vue`
- Create: `src/views/data-analysis/province-flow-dashboard/components/BaseChart.vue`

**Step 1: Create a thin chart wrapper**

Encapsulate chart mount, resize, and dispose behavior in `BaseChart.vue`.

**Step 2: Build same-province vs cross-province comparison**

Render grouped bars for:

- same-province: 甲 vs 乙
- cross-province: 甲 vs 乙

Optionally add a secondary structure chart if layout allows.

**Step 3: Build cross-province difference ranking**

Render a horizontal ranking chart sorted by absolute difference.

On bar click, emit the selected `flowKey`.

**Step 4: Build weight-band comparison**

Render two panels or one split chart:

- same-province weight-band comparison
- cross-province weight-band comparison

Use the four fixed weight bands in order.

**Step 5: Verify chart behavior**

Run: `npm run build`

Expected: charts compile, resize correctly, and no SSR-only APIs are used.

**Step 6: Commit**

```bash
git add src/views/data-analysis/province-flow-dashboard/components
git commit -m "feat: add province flow dashboard charts"
```

### Task 6: Implement the detail table and route integration

**Files:**
- Create: `src/views/data-analysis/province-flow-dashboard/components/FlowDetailTable.vue`
- Modify: `src/router/routes.ts`
- Modify: `src/layout/components/Sidebar.vue`

**Step 1: Build the detail table**

Columns should include:

- 流向
- 流向类型
- 甲重量
- 乙重量
- 差值
- 差异率
- 甲票数
- 乙票数

Default sort by absolute difference descending.

**Step 2: Add the new route**

Register a route under an existing analysis or management section. Keep route metadata readable and consistent with the sidebar naming.

**Step 3: Add the hardcoded sidebar menu entry**

Update the sidebar mega-menu data and `handleMegaItemClick` so the user can navigate to the page.

**Step 4: Verify the menu workflow**

Run: `npm run dev`

Expected: the sidebar entry appears, clicking it routes to the new page, and the page renders.

**Step 5: Commit**

```bash
git add src/views/data-analysis/province-flow-dashboard/components/FlowDetailTable.vue src/router/routes.ts src/layout/components/Sidebar.vue
git commit -m "feat: wire province flow dashboard into navigation"
```

### Task 7: Final visual polish and verification

**Files:**
- Modify: `src/views/data-analysis/province-flow-dashboard/index.vue`
- Modify: `src/views/data-analysis/province-flow-dashboard/components/*.vue`

**Step 1: Refine spacing and responsive layout**

Ensure desktop and mobile widths do not collapse charts or make tables unusable.

**Step 2: Validate metric toggle behavior**

Switch between `结算重量(吨)` and `票数` and confirm:

- overview cards update
- all chart axes update
- table columns remain semantically correct

**Step 3: Validate data edge cases**

Check:

- provider B equals zero in difference-rate rows
- unknown provinces
- filtered empty result sets

**Step 4: Run full verification**

Run: `npm run build`

Expected: successful production build.

Run: `npm run dev`

Expected: no console errors during interaction.

**Step 5: Commit**

```bash
git add src/views/data-analysis/province-flow-dashboard
git commit -m "feat: finish province flow dashboard"
```
