import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Group, Slot } from "@/types";
import { Users, Calendar, DollarSign, Clock, CheckCircle, Circle, Sparkles } from "lucide-react";
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
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  if (!group) return null;

  const availableSlots = group.slots.filter(slot => slot.isAvailable);
  const takenSlots = group.slots.filter(slot => !slot.isAvailable);

  // Check if group has payoutOrder field, default to 'auto' if not present
  const isManualGroup = group.payoutOrder === 'manual';

  const handleSlotSelect = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
  };

  const handleJoinGroup = async () => {
    // For manual groups, require slot selection
    if (isManualGroup && !selectedSlot) {
      toast({
        title: "Please select a slot",
        description: "Choose an available slot to join this group.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      // For auto groups, pass 0 for auto assignment, for manual pass selected slot
      const slotToJoin = isManualGroup ? selectedSlot! : 0;
      await onJoinGroup(group.id, slotToJoin);
      setSelectedSlot(null);
      onClose();
    } catch (error) {
      console.error('Join group failed:', error);
    } finally {
      setIsJoining(false);
    }
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

          {/* Slot Selection or Auto Join Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {isManualGroup ? 'Select Your Slot' : 'Join Group'}
              </h3>
              {isManualGroup && (
                <Badge variant="secondary">
                  {availableSlots.length} available
                </Badge>
              )}
            </div>
            
            {isManualGroup ? (
              // Manual slot selection - show all slots
              <>
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

                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm text-accent-foreground">
                    <strong>💡 How it works:</strong> Select your preferred slot to choose when you'll receive your payout. 
                    Available slots are highlighted, taken slots are grayed out.
                  </p>
                </div>
              </>
            ) : (
              // Auto assignment info
              availableSlots.length > 0 ? (
                <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Auto Assignment</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        This group uses automatic slot assignment. When you join, you'll be randomly assigned an available month for your payout.
                      </p>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">{availableSlots.length} spots available</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/50 rounded-xl">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium text-foreground mb-2">Group is Full</h4>
                  <p className="text-sm text-muted-foreground">
                    This group has reached its maximum capacity. Check back later or browse other groups.
                  </p>
                </div>
              )
            )}
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
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isJoining}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="hero" 
              onClick={handleJoinGroup}
              disabled={
                availableSlots.length === 0 || 
                isJoining || 
                (isManualGroup && !selectedSlot)
              }
              className="flex-1"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  {isManualGroup ? (
                    `Join Group ${selectedSlot ? `(Slot #${selectedSlot})` : ''}`
                  ) : (
                    'Join Group (Auto Assignment)'
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailsModal;