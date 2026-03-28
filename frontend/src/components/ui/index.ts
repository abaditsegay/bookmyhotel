// UI Component Library Index
// Centralized exports for all design system components

// New Material-UI based components
export { default as MuiButton } from './MuiButton';
export { default as MuiCard } from './MuiCard';
export { default as FormField } from './FormField';
export { default as StatusChip } from './StatusChip';
export { default as InfoField } from './InfoField';
export { default as PageHeader } from './PageHeader';
export { default as SurfaceCard } from './SurfaceCard';

export {
  LoadingSpinner,
  LoadingBar,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  EmptyState
} from './LoadingStates';

// Design system exports
export { designSystem, statusColors, animations } from '../../theme/designSystem';
export { default as theme } from '../../theme/theme';

// Legacy exports for backward compatibility
export { Badge } from './badge';
export { Button } from './MuiButton';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table';
export { Input } from './input';
export { Label } from './label';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { Textarea } from './textarea';
export { Separator } from './separator';
export { ScrollArea } from './scroll-area';
export { Skeleton } from './skeleton';