# Design Document

## Overview

The editor sidebar is a compact, fixed-height tools panel that provides quick access to essential music editing controls for the Tonic Flow music notation editor. It will be implemented as a React component within the Next.js frontend, utilizing the existing UI component library and Tailwind CSS for styling. The sidebar maintains a focused design that complements the main editing interface without obstructing the composition workflow.

## Architecture

### Component Hierarchy

```
EditorSidebar (Container)
├── SidebarHeader (Collapse/Expand Toggle)
├── TempoControl (BPM Input & Controls)
├── KeySignatureControl (Dropdown Selector)
├── TimeSignatureControl (Fraction Selector)
├── NoteDurationPalette (Note Value Buttons)
├── ArticulationPalette (Expression Tools)
└── SidebarFooter (Additional Tools)
```

### State Management

The sidebar will use React's built-in state management with context for sharing editor state:

- **Local State**: UI-specific state (collapsed/expanded, active tools)
- **Editor Context**: Shared composition state (tempo, key, time signature)
- **Composition Store**: Persistent composition data via Dexie (IndexedDB)

### Integration Points

- **Editor Context**: Shares state with the main notation editor
- **Composition API**: Syncs changes with backend via REST endpoints
- **UI Components**: Leverages `@repo/ui` component library
- **Keyboard Shortcuts**: Integrates with global keyboard handler

## Components and Interfaces

### EditorSidebar Component

```typescript
interface EditorSidebarProps {
  compositionId?: string;
  isCollapsed?: boolean;
  onCollapseToggle?: (collapsed: boolean) => void;
  className?: string;
}

interface EditorSidebarState {
  isCollapsed: boolean;
  activeNoteDuration: NoteDuration;
  activeArticulation: Articulation | null;
}
```

**Responsibilities:**
- Manage sidebar collapse/expand state
- Coordinate tool state changes
- Handle keyboard shortcuts
- Persist user preferences


### KeySignatureControl Component

```typescript
type KeySignature = {
  key: string; // 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'
  mode: 'major' | 'minor';
};
```

**Features:**
- Dropdown with major and minor keys
- Visual key signature representation
- Search/filter functionality
- Common keys prioritized in list

### TimeSignatureControl Component

```typescript
interface TimeSignatureControlProps {
  timeSignature: TimeSignature;
  onTimeSignatureChange: (timeSignature: TimeSignature) => void;
  disabled?: boolean;
}

type TimeSignature = {
  numerator: number;
  denominator: number;
};
```

**Features:**
- Common time signatures as quick buttons (4/4, 3/4, 2/4, 6/8)
- Custom input for uncommon signatures
- Visual fraction representation
- Validation for valid time signatures

### NoteDurationPalette Component

```typescript
interface NoteDurationPaletteProps {
  activeDuration: NoteDuration;
  onDurationChange: (duration: NoteDuration) => void;
  availableDurations?: NoteDuration[];
}

type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'thirty-second';
```

**Features:**
- Visual note symbols for each duration
- Active duration highlighting
- Keyboard shortcut indicators
- Tooltip with duration names

### ArticulationPalette Component

```typescript
interface ArticulationPaletteProps {
  activeArticulation: Articulation | null;
  onArticulationChange: (articulation: Articulation | null) => void;
  availableArticulations?: Articulation[];
}

type Articulation = 'staccato' | 'legato' | 'accent' | 'tenuto' | 'marcato' | 'fermata';
```

**Features:**
- Symbol buttons for each articulation
- Toggle selection (click to deselect)
- Grouped by category (dynamics, articulations)
- Expandable palette for additional symbols

## Data Models

### Composition State

```typescript
interface CompositionState {
  id: string;
  tempo: number;
  keySignature: KeySignature;
  timeSignature: TimeSignature;
  lastModified: Date;
}
```

### Editor Preferences

```typescript
interface EditorPreferences {
  sidebarCollapsed: boolean;
  defaultNoteDuration: NoteDuration;
  favoriteKeys: KeySignature[];
  keyboardShortcutsEnabled: boolean;
}
```

### Tool State

```typescript
interface ToolState {
  activeTool: 'note' | 'rest' | 'articulation' | 'text';
  noteDuration: NoteDuration;
  articulation: Articulation | null;
  isInputMode: boolean;
}
```

## Error Handling

### Validation Errors

- **Tempo Validation**: Range validation (30-200 BPM) with user-friendly messages
- **Time Signature Validation**: Mathematical validation for valid fractions
- **Input Sanitization**: Prevent invalid characters in numeric inputs

### Network Errors

- **Offline Mode**: Cache changes locally when API is unavailable
- **Sync Conflicts**: Handle concurrent edits with conflict resolution
- **Retry Logic**: Automatic retry for failed API calls with exponential backoff

### User Experience Errors

- **Tool State Recovery**: Restore previous state on component remount
- **Keyboard Shortcut Conflicts**: Graceful handling of conflicting shortcuts
- **Accessibility Errors**: Screen reader announcements for state changes

## Testing Strategy

### Unit Tests

**Component Testing:**
- Render tests for all sidebar components
- State management and prop handling
- Event handler functionality
- Keyboard navigation behavior

**Integration Testing:**
- Editor context integration
- API communication
- Local storage persistence
- Keyboard shortcut handling

### Visual Testing

**Responsive Design:**
- Sidebar behavior at different screen sizes
- Collapsed/expanded state transitions
- Tool palette layouts

**Accessibility Testing:**
- Screen reader compatibility
- Keyboard navigation flow
- Color contrast compliance
- Focus management

### End-to-End Testing

**User Workflows:**
- Complete composition creation with sidebar tools
- Tool state persistence across sessions
- Keyboard shortcut functionality
- Multi-user collaboration scenarios

**Performance Testing:**
- Sidebar rendering performance
- State update responsiveness
- Memory usage with large compositions
- Network request optimization

## Implementation Notes

### Styling Approach

- **Tailwind CSS**: Utility-first styling with custom component classes
- **Design Tokens**: Consistent spacing, colors, and typography
- **Dark Mode**: Support for light/dark theme switching
- **Responsive Design**: Adaptive layout for different screen sizes

### Accessibility Considerations

- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Logical focus order and visual indicators
- **Color Independence**: Information not conveyed by color alone

### Performance Optimizations

- **React.memo**: Prevent unnecessary re-renders
- **Debounced Updates**: Batch rapid state changes
- **Lazy Loading**: Load articulation symbols on demand
- **Virtual Scrolling**: For large tool palettes (future enhancement)

### Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Progressive Enhancement**: Core functionality without JavaScript
- **Polyfills**: Minimal polyfills for essential features
- **Graceful Degradation**: Fallbacks for unsupported features