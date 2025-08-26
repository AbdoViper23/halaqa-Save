import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Filter, DollarSign, Calendar, Clock, Sparkles } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useGroupsStore } from "@/stores/useGroupsStore";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/hooks/use-toast";
import GroupDetailsModal from "@/components/GroupDetailsModal";
import FilterModal from "@/components/FilterModal";
import AIRecommendationChat from "@/components/AIRecommendationChat";

interface FilterState {
  amountRange: [number, number];
  duration: string;
  availableSlots: string;
  startDate: string;
}

const BrowseGroups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    amountRange: [0, 2000],
    duration: 'any',
    availableSlots: 'any',
    startDate: ''
  });

  const { 
    groups, 
    getAvailableGroups, 
    joinGroupSlot, 
    fetchAvailableGroups,
    isLoading: groupsLoading,
    error: groupsError 
  } = useGroupsStore();
  const { joinGroup: joinUserGroup } = useUserStore();
  const { toast } = useToast();

  // Fetch groups from backend on component mount
  useEffect(() => {
    fetchAvailableGroups();
  }, [fetchAvailableGroups]);

  // Show error if groups failed to load
  useEffect(() => {
    if (groupsError) {
      toast({
        title: "Error Loading Groups",
        description: groupsError,
        variant: "destructive",
      });
    }
  }, [groupsError, toast]);

  // Get only groups with available slots
  const availableGroups = getAvailableGroups();

  // Apply filters and search
  const filteredGroups = useMemo(() => {
    return availableGroups.filter(group => {
      // Search filter
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Amount filter
      const matchesAmount = group.monthlyAmount >= filters.amountRange[0] && 
                           group.monthlyAmount <= filters.amountRange[1];

      // Duration filter
      let matchesDuration = true;
      if (filters.duration !== 'any') {
        switch (filters.duration) {
          case '3-6':
            matchesDuration = group.duration >= 3 && group.duration <= 6;
            break;
          case '6-12':
            matchesDuration = group.duration > 6 && group.duration <= 12;
            break;
          case '12+':
            matchesDuration = group.duration > 12;
            break;
        }
      }

      // Available slots filter
      const availableSlots = group.slots.filter(slot => slot.isAvailable).length;
      let matchesSlots = true;
      if (filters.availableSlots !== 'any') {
        switch (filters.availableSlots) {
          case '1-2':
            matchesSlots = availableSlots >= 1 && availableSlots <= 2;
            break;
          case '3-5':
            matchesSlots = availableSlots >= 3 && availableSlots <= 5;
            break;
          case '5+':
            matchesSlots = availableSlots >= 5;
            break;
        }
      }

      // Start date filter
      let matchesStartDate = true;
      if (filters.startDate) {
        matchesStartDate = new Date(group.startDate) >= new Date(filters.startDate);
      }

      return matchesSearch && matchesAmount && matchesDuration && matchesSlots && matchesStartDate;
    });
  }, [availableGroups, searchTerm, filters]);

  const handleJoinGroup = async (groupId: string, slotNumber: number) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      joinGroupSlot(groupId, slotNumber, 'user-1'); // Current user ID
      joinUserGroup(groupId);
      
      toast({
        title: "🎉 Successfully joined group!",
        description: `You've joined slot #${slotNumber}. Welcome to the group!`,
      });
    } catch (error) {
      toast({
        title: "Failed to join group",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      amountRange: [0, 2000],
      duration: 'any',
      availableSlots: 'any',
      startDate: ''
    });
  };

  const hasActiveFilters = 
    filters.amountRange[0] !== 0 || 
    filters.amountRange[1] !== 2000 ||
    filters.duration !== 'any' ||
    filters.availableSlots !== 'any' ||
    filters.startDate !== '';

  const selectedGroupData = groups.find(group => group.id === selectedGroup);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Browse Savings Groups
          </h1>
          <p className="text-muted-foreground text-lg">
            Find the perfect group that matches your savings goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search groups by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            className="lg:w-auto"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-2 h-2 w-2 p-0" />
            )}
          </Button>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-muted rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(filters.amountRange[0] !== 0 || filters.amountRange[1] !== 2000) && (
                <Badge variant="secondary">
                  ${filters.amountRange[0]} - ${filters.amountRange[1]}
                </Badge>
              )}
              {filters.duration !== 'any' && (
                <Badge variant="secondary">{filters.duration} months</Badge>
              )}
              {filters.availableSlots !== 'any' && (
                <Badge variant="secondary">{filters.availableSlots} slots</Badge>
              )}
              {filters.startDate && (
                <Badge variant="secondary">From {filters.startDate}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {groupsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const availableSlots = group.slots.filter(slot => slot.isAvailable).length;
              const takenMembers = group.slots.filter(slot => !slot.isAvailable);
              
              return (
                <Card 
                  key={group.id} 
                  className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <CardContent className="p-6">
                    {/* Group Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg">
                        {group.image ? (
                          <img src={group.image} alt={group.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Sparkles className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{group.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{group.description}</p>
                      </div>
                    </div>

                    {/* Group Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">Monthly</span>
                        </div>
                        <span className="font-semibold text-foreground">${group.monthlyAmount}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">Duration</span>
                        </div>
                        <span className="font-semibold text-foreground">{group.duration} months</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">Cycle</span>
                        </div>
                        <span className="font-semibold text-foreground">{group.currentCycle}/{group.duration}</span>
                      </div>
                    </div>

                    {/* Available Slots Highlight */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Available Slots</span>
                        <Badge 
                          variant={availableSlots > 3 ? "default" : availableSlots > 0 ? "secondary" : "destructive"}
                          className={availableSlots > 0 ? "bg-gradient-accent text-accent-foreground" : ""}
                        >
                          {availableSlots} left
                        </Badge>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-gradient-accent h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((group.totalMembers - availableSlots) / group.totalMembers) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Members Preview */}
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Current Members</p>
                      <div className="flex -space-x-2">
                        {takenMembers.slice(0, 5).map((slot, index) => (
                          <div 
                            key={slot.slotNumber}
                            className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center border-2 border-background text-xs text-primary-foreground"
                          >
                            {slot.memberAvatar ? (
                              <img 
                                src={slot.memberAvatar} 
                                alt="Member" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                          </div>
                        ))}
                        {takenMembers.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">+{takenMembers.length - 5}</span>
                          </div>
                        )}
                        {availableSlots > 0 && (
                          <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center">
                            <span className="text-accent text-xs font-medium">+{availableSlots}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="hero"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroup(group.id);
                      }}
                    >
                      <Users className="w-4 h-4" />
                      View Details & Join
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!groupsLoading && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-semibold text-xl text-foreground mb-2">
              {searchTerm || hasActiveFilters ? "No groups match your criteria" : "No groups found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || hasActiveFilters 
                ? "Try adjusting your search or filters" 
                : "Be the first to create a new group"
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(searchTerm || hasActiveFilters) && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  clearFilters();
                }}>
                  Clear All Filters
                </Button>
              )}
              <Button variant="hero">
                Create New Group
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GroupDetailsModal
        group={selectedGroupData || null}
        isOpen={selectedGroup !== null}
        onClose={() => setSelectedGroup(null)}
        onJoinGroup={handleJoinGroup}
      />

      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* AI Recommendation Chat */}
      <AIRecommendationChat />
    </div>
  );
};

export default BrowseGroups;