import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Group, Slot } from "@/types";
import { Users, Calendar, DollarSign, Clock, CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GroupDetailsModalProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinGroup: (groupId: string, slotNumber: number) => void;
}

const GroupDetailsModal = ({ group, isOpen, onClose, onJoinGroup }: GroupDetailsModalProps) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const { toast } = useToast();

  if (!group) return null;

  const availableSlots = group.slots.filter(slot => slot.isAvailable);
  const takenSlots = group.slots.filter(slot => !slot.isAvailable);

  const handleSlotSelect = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
  };

  const handleJoinGroup = () => {
    if (!selectedSlot) {
      toast({
        title: "Please select a slot",
        description: "Choose an available slot to join this group.",
        variant: "destructive",
      });
      return;
    }

    onJoinGroup(group.id, selectedSlot);
    setSelectedSlot(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{group.name}</DialogTitle>
          <DialogDescription>{group.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="font-semibold">${group.monthlyAmount}</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{group.duration} months</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="font-semibold">{group.totalMembers}</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Current Cycle</p>
              <p className="font-semibold">{group.currentCycle}</p>
            </div>
          </div>

          {/* Payment Timeline */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Payment Timeline</h3>
            <div className="bg-muted rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {group.currentCycle} of {group.duration} cycles
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-gradient-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(group.currentCycle / group.duration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Available Slots Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Select Your Slot</h3>
              <Badge variant="secondary">
                {availableSlots.length} available
              </Badge>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {group.slots.map((slot) => (
                <button
                  key={slot.slotNumber}
                  onClick={() => slot.isAvailable && handleSlotSelect(slot.slotNumber)}
                  disabled={!slot.isAvailable}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                    ${slot.isAvailable 
                      ? selectedSlot === slot.slotNumber
                        ? 'border-accent bg-accent/10 text-accent scale-105'
                        : 'border-muted hover:border-accent/50 hover:bg-accent/5 text-foreground'
                      : 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span>#{slot.slotNumber}</span>
                    <span className="text-xs">
                      Month {slot.payoutMonth}
                    </span>
                    {slot.isAvailable ? (
                      selectedSlot === slot.slotNumber ? (
                        <CheckCircle className="w-4 h-4 text-accent" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>💡 Select a slot to choose when you'll receive your payout</p>
              <p>Available slots are highlighted in green, taken slots are grayed out</p>
            </div>
          </div>

          {/* Current Members */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Current Members</h3>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-3">
              {takenSlots.map((slot) => (
                <div key={slot.slotNumber} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground mb-2 mx-auto">
                    {slot.memberAvatar ? (
                      <img 
                        src={slot.memberAvatar} 
                        alt="Member" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Slot #{slot.slotNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="hero" 
              onClick={handleJoinGroup}
              disabled={!selectedSlot}
              className="flex-1"
            >
              Join Group {selectedSlot && `(Slot #${selectedSlot})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailsModal;