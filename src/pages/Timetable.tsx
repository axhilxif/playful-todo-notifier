import { useState, useEffect } from 'react';
import { Plus, Calendar, List, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { TimeSlotCard } from '@/components/timetable/TimeSlotCard';
import { TimeSlotForm } from '@/components/timetable/TimeSlotForm';
import { WeeklyCalendar } from '@/components/timetable/WeeklyCalendar';
import { TimeSlot } from '@/types';
import { getTimeSlots, setTimeSlots } from '@/lib/storage';
import { notificationService } from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';

export default function Timetable() {
  const [timeSlots, setTimeSlotsState] = useState<TimeSlot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const { toast } = useToast();

  useEffect(() => {
    const storedSlots = getTimeSlots();
    setTimeSlotsState(storedSlots);
  }, []);

  const saveTimeSlots = (newSlots: TimeSlot[]) => {
    setTimeSlots(newSlots);
    setTimeSlotsState(newSlots);
  };

  const handleAddTimeSlot = (slotData: Omit<TimeSlot, 'id'>) => {
    const newSlot: TimeSlot = {
      ...slotData,
      id: Date.now().toString(),
    };
    
    const updatedSlots = [...timeSlots, newSlot];
    saveTimeSlots(updatedSlots);
    setShowForm(false);
    notificationService.playHaptic();
    
    toast({
      title: "Schedule added! 📅",
      description: `"${newSlot.title}" has been added to your timetable.`,
    });
  };

  const handleEditTimeSlot = (slotData: Omit<TimeSlot, 'id'>) => {
    if (!editingSlot) return;
    
    const updatedSlot: TimeSlot = {
      ...editingSlot,
      ...slotData,
    };
    
    const updatedSlots = timeSlots.map(slot => 
      slot.id === editingSlot.id ? updatedSlot : slot
    );
    
    saveTimeSlots(updatedSlots);
    setEditingSlot(null);
    setShowForm(false);
    notificationService.playHaptic();
    
    toast({
      title: "Schedule updated! ✨",
      description: `"${updatedSlot.title}" has been updated.`,
    });
  };

  const handleDeleteTimeSlot = (id: string) => {
    const slot = timeSlots.find(s => s.id === id);
    const updatedSlots = timeSlots.filter(slot => slot.id !== id);
    saveTimeSlots(updatedSlots);
    notificationService.playHaptic();
    
    if (slot) {
      toast({
        title: "Schedule deleted 🗑️",
        description: `"${slot.title}" has been removed.`,
        variant: "destructive",
      });
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="My Schedule"
        subtitle={`${timeSlots.length} time slots configured`}
        icon={<Calendar className="h-6 w-6" />}
        action={
          <Button 
            onClick={() => setShowForm(true)}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        }
      />

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'calendar')} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">No schedule yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first time slot to organize your day!
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  variant="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Schedule
                </Button>
              </div>
            ) : (
              timeSlots.map((slot, index) => (
                <TimeSlotCard
                  key={slot.id}
                  timeSlot={slot}
                  onEdit={() => {
                    setEditingSlot(slot);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteTimeSlot(slot.id)}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <WeeklyCalendar timeSlots={timeSlots} />
        </TabsContent>
      </Tabs>

      {/* TimeSlot Form Modal */}
      <TimeSlotForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editingSlot ? handleEditTimeSlot : handleAddTimeSlot}
        initialData={editingSlot || undefined}
        title={editingSlot ? "Edit Schedule" : "Add New Schedule"}
      />
    </div>
  );
}