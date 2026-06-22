## Goal
Add a visual layout preview below the Setup Style selector on both reservation forms (External + Internal). Pure UI/UX — no changes to logic, options, capacities, schema, or submitted values.

## Assets
Upload the three images to Lovable Assets (CDN) via `lovable-assets create`:
- `src/assets/espaco_01.png.asset.json`
- `src/assets/espaco_02.png.asset.json`
- `src/assets/espaco_03.png.asset.json`

## Image mapping — keyed by setup option ID
New file `src/lib/layout-previews.ts` exports:
- `LAYOUT_PREVIEW_MAP: Record<string, { src: string; alt: string }>`
- `getLayoutPreview(id: string)` which falls back to `espaco_01.png` for any unmapped id

Initial mapping (per ID so individual layouts can diverge later):
- `auditorium-a-*` (all 5 setups) → `espaco_02.png`
- `auditorium-b-*` (both setups) → `espaco_03.png`
- `coffee-bistro`, `coffee-bistro-side`, `square-layout`, and fallback → `espaco_01.png`

## Capacity label helper
In the same file: `formatCapacity(capacity: number | null): string`
- number → `"Up to {n} people"`
- null → `"Capacity available upon request"`

## New reusable component: `SetupStylePreview.tsx`
Props: `setup: SetupOption | undefined`

### States
- No setup selected: render the Card with a muted placeholder message — "Choose a setup style to preview the room layout."
- Setup selected: render Card with:
  1. **Image area** (clickable, opens shadcn `Dialog` for larger view)
     - `aspect-video` (or `aspect-[4/3]` on mobile via responsive class) for layout stability
     - `<img loading="lazy" />`, `object-contain`, rounded, subtle border
     - shadcn `Skeleton` overlay shown until `onLoad` fires (reset on `src` change via effect)
     - Fade transition: `transition-opacity duration-200`, opacity 0 → 100 on load; key/state reset on `src` change produces a cross-fade feel between selections
     - Responsive max-height: `max-h-48` mobile → `sm:max-h-64` tablet → `md:max-h-80` desktop
  2. **Content area** below image:
     - Layout name (`setup.label`) as card title
     - Room name (`setup.room`) as muted subtext
     - Capacity displayed via shadcn `Badge` using `formatCapacity(setup.capacity)`
     - Helper line: "Click the image to enlarge"
  3. **Expand Preview button**: a small text button or icon-only button below the image (outside the image click target) labeled "Expand Preview" (with a small `Maximize2` or `Expand` icon). This makes the enlarged preview more discoverable and accessible beyond clicking the image directly.
  4. **Dialog**: on image click or "Expand Preview" click, open existing shadcn `Dialog` showing the image larger with preserved aspect ratio and a close button.

### Responsiveness
- Mobile: full-width, reduced height
- Tablet (`sm:`): full-width card, medium height
- Desktop (`md:`): large preview, full height

## Form integration: responsive two-column layout
In both reservation forms, wrap the existing Setup Style `<Field>` block and the new `<SetupStylePreview setup={setup} />` inside a responsive grid:

```
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    [existing Setup Style Field + helper text]
  </div>
  <div>
    <SetupStylePreview setup={setup} />
  </div>
</div>
```

- Desktop/tablet (`md:`): two-column — left column = selector + helper text, right column = preview card. Reduces vertical scrolling.
- Mobile (`<md`): stack vertically, preview below selector.

Files to edit:
- `src/features/internal-event/InternalEventForm.tsx`
- `src/features/user-reservation/UserReservationForm.tsx`

The existing inline "room · max capacity" hint under the Select stays as-is.

## Out of scope
- No changes to backend, schema, validation, reservation flow, option list, names, or capacities.
- No replacement of the Select control.

## Files summary
- create: 3× `src/assets/espaco_0{1,2,3}.png.asset.json`
- create: `src/lib/layout-previews.ts`
- create: `src/components/SetupStylePreview.tsx`
- edit: `src/features/internal-event/InternalEventForm.tsx`
- edit: `src/features/user-reservation/UserReservationForm.tsx`