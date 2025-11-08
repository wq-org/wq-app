# PulsarLoading Component

A pulsing loader animation component built with React, Tailwind CSS, and class-variance-authority.  
Based on the **Pulsar** loader from [uiball.com/ldrs](https://uiball.com/ldrs/).

## Installation

The component is already available in your project at:
```
src/components/ui/pulsar-loading.tsx
```

## Basic Usage

```tsx
import PulsarLoading from '@/components/ui/pulsar-loading';

export default function MyComponent() {
  return <PulsarLoading />;
}
```

## Props

| Prop      | Type                              | Default   | Description                           |
|-----------|-----------------------------------|-----------|---------------------------------------|
| `variant` | `'black' \| 'white'`              | `'black'` | Color scheme of the pulsar            |
| `size`    | `'sm' \| 'md' \| 'lg' \| 'xl'`    | `'md'`    | Size of the loader                    |
| `speed`   | `number`                          | `1750`    | Animation duration in milliseconds    |
| `className` | `string`                        | -         | Additional CSS classes                |
| ...rest   | `HTMLDivElement` attributes       | -         | All standard div props are supported  |

## Size Variants

### Small (sm)
```tsx
<PulsarLoading size="sm" />
```
- Height/Width: `h-6 w-6` (24px)
- Best for: Inline text, small buttons

### Medium (md) - Default
```tsx
<PulsarLoading size="md" />
```
- Height/Width: `h-10 w-10` (40px)
- Best for: Regular buttons, card loading states

### Large (lg)
```tsx
<PulsarLoading size="lg" />
```
- Height/Width: `h-16 w-16` (64px)
- Best for: Section loading states, modal content

### Extra Large (xl)
```tsx
<PulsarLoading size="xl" />
```
- Height/Width: `h-24 w-24` (96px)
- Best for: Full-screen loading, splash screens

## Color Variants

### Black (Default)
```tsx
<PulsarLoading variant="black" />
```
Best for: Light backgrounds, general use

### White
```tsx
<PulsarLoading variant="white" />
```
Best for: Dark backgrounds, dark mode, colored buttons

**Example with dark background:**
```tsx
<div className="bg-gray-900 p-8 rounded-lg">
  <PulsarLoading variant="white" size="lg" />
</div>
```

## Speed Variations

### Fast
```tsx
<PulsarLoading speed={1000} />
```
Animation completes in 1 second

### Normal (Default)
```tsx
<PulsarLoading speed={1750} />
```
Animation completes in 1.75 seconds

### Slow
```tsx
<PulsarLoading speed={3000} />
```
Animation completes in 3 seconds

## Real-World Examples

### Full-Screen Loading
Perfect for route transitions or initial app loading.

```tsx
export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <PulsarLoading variant="black" size="xl" />
    </div>
  );
}
```

### Auth Route Guard Loading
Used in authentication protection components.

```tsx
import { useUser } from '@/contexts/UserContext';
import PulsarLoading from '@/components/ui/pulsar-loading';

export default function RequireAuth({ children }) {
  const { session, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PulsarLoading variant="black" size="xl" speed={1750} />
      </div>
    );
  }

  return session ? children : <Navigate to="/login" />;
}
```

### Inline Button Loading
Show loading state inside a button.

```tsx
export default function SubmitButton({ isLoading }) {
  return (
    <button 
      disabled={isLoading}
      className="px-6 py-2 bg-black text-white rounded-lg flex items-center gap-3"
    >
      {isLoading && <PulsarLoading variant="white" size="sm" speed={1000} />}
      <span>{isLoading ? 'Loading...' : 'Submit'}</span>
    </button>
  );
}
```

### Card Loading State
Display a loader while content is being fetched.

```tsx
export default function DataCard({ isLoading, data }) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 flex items-center justify-center">
        <PulsarLoading variant="black" size="lg" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-8">
      {/* Your card content */}
    </div>
  );
}
```

### Onboarding Step Loading
Used in multi-step onboarding flows.

```tsx
export default function StepAccount({ onNext }) {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PulsarLoading variant="black" size="xl" speed={1750} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Centered in Container
Center the loader within a specific container.

```tsx
<div className="relative w-full h-64">
  <div className="absolute inset-0 flex items-center justify-center">
    <PulsarLoading size="lg" />
  </div>
</div>
```

## Accessibility

The component includes proper ARIA attributes for screen readers:

```tsx
<div
  role="status"
  aria-live="polite"
  aria-label="Loading"
>
  <span className="sr-only">Loading...</span>
  {/* Pulsar animation */}
</div>
```

## Customization

### Custom Colors
While the component provides `black` and `white` variants, you can customize colors using CSS custom properties:

```tsx
<PulsarLoading
  className="[--pulsar-color:theme(colors.blue.500)]"
  size="lg"
/>
```

### Custom Animation Timing
Adjust the animation speed dynamically:

```tsx
const [speed, setSpeed] = useState(1750);

<PulsarLoading speed={speed} />
```

## Technical Details

### Animation
The component uses CSS `@keyframes` for smooth, performant animations:
- Two overlapping circles animate from `scale(0)` to `scale(1)`
- Opacity transitions from `1` to `0.25`
- Second circle has a delay of `-50%` of the animation duration

### Performance
- Uses `will-change-transform` for optimized rendering
- Pure CSS animations (no JavaScript timers)
- Minimal re-renders with memoization-friendly props

## Browser Support

Works in all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- CSS Animations
- CSS `calc()`

## Migration from LoadingSkeletonCarousel

If you're migrating from the old `LoadingSkeletonCarousel` component:

**Before:**
```tsx
<LoadingSkeletonCarousel 
  items={4} 
  heightPx={500} 
  durationMs={8000}
/>
```

**After:**
```tsx
<div className="flex items-center justify-center min-h-[500px]">
  <PulsarLoading variant="black" size="xl" speed={1750} />
</div>
```

## Credits

- Original design: [uiball.com/ldrs](https://uiball.com/ldrs/)
- Implementation: Pure React + Tailwind CSS
- Variants: Powered by [class-variance-authority](https://cva.style/)

