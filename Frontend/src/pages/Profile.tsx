import React, { useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { useGroupsStore } from '@/stores/useGroupsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import { 
  User, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Target,
  Plus,
  Search,
  Filter,
  ExternalLink,
  DollarSign,
  Calendar,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { profile, transactions, userGroups } = useUserStore();
  const { getUserGroups } = useGroupsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const userGroupsData = getUserGroups(userGroups);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.groupName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ icon: Icon, title, value, subtitle, className = "" }: any) => (
    <Card className={`hover-scale ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl font-bold">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-primary-foreground">
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-primary-foreground/80 mb-2">Member since {new Date(profile.joinedDate).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-primary-foreground/90">{profile.successRate}% Success Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Total Saved"
            value={`$${profile.totalSaved.toLocaleString()}`}
            subtitle="Across all groups"
          />
          <StatCard
            icon={Users}
            title="Active Groups"
            value={profile.activeGroups}
            subtitle="Currently participating"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Groups"
            value={profile.completedGroups}
            subtitle="Successfully finished"
          />
          <StatCard
            icon={Target}
            title="Success Rate"
            value={`${profile.successRate}%`}
            subtitle="Payment reliability"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/groups/create">
                <Button className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </Link>
              <Link to="/groups/browse">
                <Button variant="outline" className="w-full" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Groups
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Groups Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Active Groups</CardTitle>
              <CardDescription>Groups you're currently participating in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userGroupsData.slice(0, 3).map(group => (
                  <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cycle {group.currentCycle}/{group.duration} • ${group.monthlyAmount}/month
                      </p>
                    </div>
                    <Badge variant="outline">
                      Active
                    </Badge>
                  </div>
                ))}
                {userGroupsData.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{userGroupsData.length - 3} more groups
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your payment and payout history</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map(tx => (
                    <TableRow key={tx.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tx.groupName}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'payout' ? 'default' : 'secondary'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        <span className={tx.type === 'payout' ? 'text-green-600' : 'text-foreground'}>
                          {tx.type === 'payout' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            tx.status === 'completed' ? 'default' : 
                            tx.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.paymentProof ? (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p>No transactions found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;