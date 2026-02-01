import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PointsInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function PointsInput({ value, onChange, onBlur, className }: PointsInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder="pts"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={cn('w-16 h-8 text-xs', className)}
    />
  );
}
