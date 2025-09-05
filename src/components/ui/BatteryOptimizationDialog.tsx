
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BatteryOptimization } from '@capawesome-team/capacitor-android-battery-optimization';
import { Capacitor } from '@capacitor/core';

interface BatteryOptimizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatteryOptimizationDialog({ open, onOpenChange }: BatteryOptimizationDialogProps) {
  const openBatteryOptimizationSettings = async () => {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }
    await BatteryOptimization.openBatteryOptimizationSettings();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center">
          <DialogTitle>Important Notification Information</DialogTitle>
          <DialogDescription>
            To ensure you receive notifications reliably, please disable battery optimization for this app.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Dismiss</Button>
          <Button onClick={openBatteryOptimizationSettings}>Open Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
