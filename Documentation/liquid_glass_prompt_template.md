# Apple Liquid Glass Design System - Claude Code Implementation Prompt

## System Overview
Implement Apple's "Liquid Glass" design system with authentic glassmorphism effects. This system creates translucent, blur-based UI elements that appear to float above content with optical glass qualities. The design should adapt to light/dark themes and maintain accessibility standards.

## Core Visual Specifications

### Glass Effect Properties
- **Primary blur radius**: 10px (standard), 16px (heavy), 33px (crystalline)
- **Background opacity**: rgba(255, 255, 255, 0.15) light mode, rgba(255, 255, 255, 0.7) enhanced
- **Backdrop filter**: `backdrop-filter: blur(10px) saturate(180%)`
- **Border**: 1px solid rgba(255, 255, 255, 0.2)

### Shadow System
```css
/* Primary glass shadow */
box-shadow: 
  0 8px 32px rgba(31, 38, 135, 0.2),
  inset 0 4px 20px rgba(255, 255, 255, 0.3);

/* Enhanced depth shadow */
box-shadow:
  0 8px 32px rgba(31, 38, 135, 0.37),
  0 4px 16px rgba(31, 38, 135, 0.20),
  inset 0 4px 20px rgba(255, 255, 255, 0.3);
```

### Corner Radius (Apple Squircle)
- Standard UI elements: 16-20px
- Buttons: 12px
- Cards/Panels: 24px
- Icons: Use formula (10/57) × icon_size

### Color Hierarchy
- **Light mode glass**: rgba(255, 255, 255, 0.7)
- **Dark mode glass**: rgba(0, 0, 0, 0.3) with rgba(255, 255, 255, 0.1) border
- **Accent tints**: Apply at 30% opacity over base glass
- **Saturation boost**: 180% for color vibrancy

## Typography Standards
- **Font family**: System font stack (San Francisco on Apple, Segoe on Windows, Roboto on Android)
- **Text over glass**: 90% white opacity minimum
- **Minimum sizes**: 11pt/14px for body text
- **Style**: Bold weights preferred for clarity
- **Contrast**: Maintain 4.5:1 ratio minimum (WCAG AA)

## Interactive States

### Button States
```
Default: opacity(0.7), blur(10px)
Hover: opacity(0.8), blur(12px), slight scale(1.02)
Active: opacity(0.9), blur(8px), scale(0.98)
Focus: Add 0 0 0 2px rgba(255, 255, 255, 0.5) outline
```

### Touch/Click Feedback
- **Ripple effect**: Expand from touch point with glass material
- **Morphing**: Smooth transitions between states (0.2s ease-out)
- **Haptic equivalent**: Subtle scale animations for visual feedback

## Accessibility Requirements

### Mandatory Features
```css
/* Respect system preferences */
@media (prefers-reduced-transparency: reduce) {
  .glass-element {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-element {
    transition: none;
    animation: none;
  }
}
```

### Contrast Requirements
- **Never compromise** on 4.5:1 text contrast ratio
- Add semi-opaque backgrounds behind text when needed
- Test with accessibility tools during development
- Provide high-contrast mode alternatives

## Platform-Specific Implementations

### Web (CSS/React/Vue/Angular)
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  .liquid-glass {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

### React Native
```javascript
const glassStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
  shadowColor: '#1f2687',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 32,
  elevation: 8, // Android
};
```

### SwiftUI (iOS/macOS)
```swift
.glassEffect(.regular)
.background(.thinMaterial)
.cornerRadius(16)
.shadow(color: .black.opacity(0.2), radius: 16, x: 0, y: 8)
```

### Flutter
```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white.withOpacity(0.15),
    borderRadius: BorderRadius.circular(16),
    border: Border.all(
      color: Colors.white.withOpacity(0.2),
      width: 1,
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.2),
        blurRadius: 32,
        offset: Offset(0, 8),
      ),
    ],
  ),
  child: BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
    child: YourContent(),
  ),
);
```

## Component Types and Usage

### Navigation Elements
- Tab bars that shrink/expand on scroll
- Navigation bars with dynamic opacity
- Floating action buttons
- **Rule**: Only use glass for navigation layer above content

### Content Containers
- Modal dialogs and sheets
- Card components
- Sidebar panels
- **Rule**: Avoid glass-on-glass stacking

### Interactive Elements
- Buttons (primary/secondary variants)
- Form inputs with glass backgrounds
- Toggle switches with glass tracks
- **Rule**: Maintain 44px minimum touch targets

## Performance Optimization

### Critical Considerations
- **Limit blur radius**: ≤40px on mobile, ≤60px on desktop
- **Batch glass elements**: Use containers to reduce individual backdrop calculations
- **GPU acceleration**: Apply `transform: translateZ(0)` for hardware acceleration
- **Debounce animations**: Limit rapid state changes during scrolling

### Fallback Strategy
```css
/* Fallback for unsupported browsers */
@supports not (backdrop-filter: blur(10px)) {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
  }
}
```

## Design Principles

### Functional Hierarchy
1. **Content**: Always opaque and high contrast
2. **Navigation**: Glass layer floating above content
3. **Overlays**: Temporary glass elements (modals, dropdowns)
4. **Never**: Glass backgrounds for primary content reading

### Adaptive Behavior
- **Light backgrounds**: Reduce glass opacity automatically
- **Dark backgrounds**: Increase glass opacity for visibility
- **Busy backgrounds**: Add subtle background overlays behind glass
- **System preferences**: Always respect user accessibility settings

## Implementation Checklist

### Before Development
- [ ] Choose appropriate glass intensity for use case
- [ ] Plan fallback designs for accessibility modes
- [ ] Identify primary content vs navigation elements
- [ ] Test color contrast in various scenarios

### During Development
- [ ] Implement proper blur and backdrop filters
- [ ] Add interactive state animations
- [ ] Include system preference media queries
- [ ] Test performance on target devices
- [ ] Validate touch target sizes

### After Development
- [ ] Test with accessibility tools (axe, Lighthouse)
- [ ] Verify contrast ratios meet WCAG standards
- [ ] Test reduced transparency/motion modes
- [ ] Performance test on lower-end devices
- [ ] Cross-browser/platform compatibility check

## Usage Examples

### Modal Dialog
Create a centered modal with glass background, proper shadows, and accessible close button.

### Navigation Bar
Implement a sticky navigation bar that becomes more opaque when scrolling over light content.

### Card Grid
Build a responsive card grid with glass cards that reveal content on hover/tap.

### Form Interface
Design form inputs with glass styling that maintains readability and proper focus states.

---

**Remember**: Glass effects serve functional purposes for interface hierarchy, not decoration. Always prioritize accessibility and readability over visual appeal. When in doubt, test with real users and accessibility tools.