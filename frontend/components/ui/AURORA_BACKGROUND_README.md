# Aurora Background Component

A beautiful animated aurora background component for your profile pages and other sections.

## Installation

The Aurora Background component has been successfully installed in your project. All required dependencies and configurations are already set up.

## Files Added/Modified

- ✅ `components/ui/aurora-background.tsx` - The main Aurora Background component
- ✅ `tailwind.config.js` - Updated with aurora animation and color variables
- ✅ `components/profile/aurora-profile-examples.tsx` - Example usage components

## Usage

### Basic Usage

```tsx
import { AuroraBackground } from "@/components/ui/aurora-background";

export function MyComponent() {
  return (
    <AuroraBackground>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold dark:text-white">
          Welcome to Your Profile
        </h1>
        <p className="text-lg dark:text-neutral-200">
          Beautiful aurora background for your content
        </p>
      </div>
    </AuroraBackground>
  );
}
```

### Profile Page Integration

```tsx
import { AuroraBackground } from "@/components/ui/aurora-background";

export function ProfilePage() {
  return (
    <AuroraBackground className="h-screen">
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Profile content with backdrop blur for readability */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-8">
          <h1>User Profile</h1>
          {/* Rest of your profile content */}
        </div>
      </div>
    </AuroraBackground>
  );
}
```

### Profile Banner/Header Usage

```tsx
import { AuroraBackground } from "@/components/ui/aurora-background";

export function ProfileBanner() {
  return (
    <AuroraBackground 
      className="h-[40vh]" 
      showRadialGradient={false}
    >
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">John Doe</h1>
          <p className="text-xl text-white/80">Professional Photographer</p>
        </div>
      </div>
    </AuroraBackground>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Content to display over the aurora background |
| `className` | `string` | - | Additional CSS classes to apply |
| `showRadialGradient` | `boolean` | `true` | Whether to show the radial gradient mask effect |

## Features

- ✨ Beautiful animated aurora effect
- 🌙 Dark/light theme support
- 📱 Responsive design
- ⚡ Smooth 60s animation loop
- 🎨 Customizable with Tailwind classes
- 🔧 TypeScript support

## Styling Tips

1. **Content Readability**: Use backdrop blur and semi-transparent backgrounds for content:
   ```tsx
   <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-6">
     Your content here
   </div>
   ```

2. **Text Contrast**: Use appropriate text colors for visibility:
   ```tsx
   <h1 className="text-slate-900 dark:text-white">Title</h1>
   ```

3. **Z-Index**: Ensure content is above the background:
   ```tsx
   <div className="relative z-10">Content</div>
   ```

4. **Height Control**: Customize the height as needed:
   ```tsx
   <AuroraBackground className="h-[50vh]">
   ```

## Examples

Check out the example components in `components/profile/aurora-profile-examples.tsx` for more usage patterns.

## Animation Details

- **Duration**: 60 seconds linear infinite
- **Effect**: Gradient position animation from 50% to 350%
- **Colors**: Blue, indigo, violet gradient spectrum
- **Performance**: Optimized with `will-change-transform`

## Troubleshooting

If you encounter any issues:

1. Make sure all Tailwind classes are properly configured
2. Ensure the component is wrapped with proper z-index for content
3. Check that dark mode is properly configured in your app
4. Verify that the tailwind.config.js includes the aurora animation

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest) 
- ✅ Safari (latest)
- ✅ Mobile browsers
