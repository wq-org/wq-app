import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function GamePreviewAlert() {
  return (
    <Alert
      variant="default"
      className="bg-slate-100 border-slate-200 text-slate-800 [&_[data-slot=alert-title]]:text-slate-900 [&_[data-slot=alert-description]]:text-slate-700"
    >
      <AlertTitle>Preview only</AlertTitle>
      <AlertDescription>
        The correct/incorrect icons are for preview only and vanish in production so players do not see them during play.
      </AlertDescription>
    </Alert>
  );
}
