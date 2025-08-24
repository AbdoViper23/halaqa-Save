import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterState {
  amountRange: [number, number];
  duration: string;
  availableSlots: string;
  startDate: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const FilterModal = ({ isOpen, onClose, filters, onFiltersChange, onClearFilters }: FilterModalProps) => {
  const hasActiveFilters = 
    filters.amountRange[0] !== 0 || 
    filters.amountRange[1] !== 2000 ||
    filters.duration !== 'any' ||
    filters.availableSlots !== 'any' ||
    filters.startDate !== '';

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Groups
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Find groups that match your preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Monthly Amount Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Monthly Contribution</Label>
            <div className="px-3">
              <Slider
                value={filters.amountRange}
                onValueChange={(value) => updateFilters({ amountRange: value as [number, number] })}
                max={2000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.amountRange[0]}</span>
              <span>${filters.amountRange[1]}+</span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Duration (Months)</Label>
            <Select value={filters.duration} onValueChange={(value) => updateFilters({ duration: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Any duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any duration</SelectItem>
                <SelectItem value="3-6">3-6 months</SelectItem>
                <SelectItem value="6-12">6-12 months</SelectItem>
                <SelectItem value="12+">12+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Available Slots */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Available Slots</Label>
            <Select value={filters.availableSlots} onValueChange={(value) => updateFilters({ availableSlots: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Any number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any number</SelectItem>
                <SelectItem value="1-2">1-2 slots</SelectItem>
                <SelectItem value="3-5">3-5 slots</SelectItem>
                <SelectItem value="5+">5+ slots</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Starting From</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {(filters.amountRange[0] !== 0 || filters.amountRange[1] !== 2000) && (
                  <Badge variant="secondary" className="text-xs">
                    ${filters.amountRange[0]} - ${filters.amountRange[1]}
                    <button
                      onClick={() => updateFilters({ amountRange: [0, 2000] })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.duration !== 'any' && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.duration} months
                    <button
                      onClick={() => updateFilters({ duration: 'any' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.availableSlots !== 'any' && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.availableSlots} slots
                    <button
                      onClick={() => updateFilters({ availableSlots: 'any' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.startDate && (
                  <Badge variant="secondary" className="text-xs">
                    From {filters.startDate}
                    <button
                      onClick={() => updateFilters({ startDate: '' })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="hero" onClick={onClose} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;