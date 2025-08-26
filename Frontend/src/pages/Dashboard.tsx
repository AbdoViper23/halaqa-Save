import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, TrendingUp, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useGroupsStore } from "@/stores/useGroupsStore";
import { CreateUserPrompt } from "@/components/CreateUserPrompt";

const Dashboard = () => {
  const { 
    profile, 
    user, 
    fetchCurrentUser,
    isLoading: userLoading 
  } = useUserStore();
  
  const { 
    groups, 
    fetchAvailableGroups,
    isLoading: groupsLoading 
  } = useGroupsStore();

  // Fetch user data and groups on component mount
  useEffect(() => {
    fetchCurrentUser();
    fetchAvailableGroups();
  }, [fetchCurrentUser, fetchAvailableGroups]);

  // Calculate stats from real data
  const currentUserGroups = groups.filter(group => 
    user?.joined_groups?.includes(group.id) || false
  );

  const stats = [
    { 
      title: "Total Savings", 
      value: profile?.totalSaved ? `$${profile.totalSaved.toLocaleString()}` : "$0", 
      icon: DollarSign, 
      change: "+12%" 
    },
    { 
      title: "Active Groups", 
      value: currentUserGroups.length.toString(), 
      icon: Users, 
      change: "+1" 
    },
    { 
      title: "Next Payout", 
      value: "Mar 15", 
      icon: Calendar, 
      change: "2 days" 
    },
    { 
      title: "Success Rate", 
      value: profile?.successRate ? `${profile.successRate}%` : "0%", 
      icon: TrendingUp, 
      change: "+2%" 
    },
  ];

  const userGroups = [
    {
      id: 1,
      name: "Tech Professionals",
      amount: 500,
      members: 8,
      cycle: 3,
      total: 8,
      progress: 37.5,
      status: "active"
    },
    {
      id: 2,
      name: "Young Savers",
      amount: 200,
      members: 6,
      cycle: 1,
      total: 6,
      progress: 16.7,
      status: "active"
    },
    {
      id: 3,
      name: "Investment Club",
      amount: 1000,
      members: 12,
      cycle: 8,
      total: 12,
      progress: 66.7,
      status: "active"
    }
  ];

  const recentActivity = [
    { type: "payment", message: "Payment received from Tech Professionals", time: "2 hours ago" },
    { type: "payout", message: "Sarah received payout from Young Savers", time: "1 day ago" },
    { type: "joined", message: "New member joined Investment Club", time: "2 days ago" },
    { type: "payment", message: "You made payment to Investment Club", time: "3 days ago" },
  ];

  // Show CreateUserPrompt if no user exists
  if (!userLoading && !user) {
    return <CreateUserPrompt />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your savings groups
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-accent text-sm font-medium">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Your Groups */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-2xl text-foreground">Your Groups</h2>
              <Link to="/groups/browse">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {userGroups.map((group) => (
                <Card key={group.id} className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{group.name}</h3>
                        <p className="text-muted-foreground">${group.amount}/month • {group.members} members</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Cycle {group.cycle}/{group.total}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          Active
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">{group.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-gradient-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${group.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Total pot: ${group.amount * group.members}
                      </p>
                      <Link to={`/groups/${group.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-display">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/groups/create">
                  <Button variant="hero" className="w-full justify-start">
                    <Plus className="w-4 h-4" />
                    Create New Group
                  </Button>
                </Link>
                <Link to="/groups/browse">
                  <Button variant="accent" className="w-full justify-start">
                    <Users className="w-4 h-4" />
                    Browse Groups
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-display">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;