import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupsStore } from '@/stores/useGroupsStore';
import { useUserStore } from '@/stores/useUserStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Navigation from '@/components/Navigation';
import { toast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Sparkles,
  Upload,
  Eye
} from 'lucide-react';
import { CreateGroupData } from '@/types';

// Step components defined outside to prevent re-creation on each render
const Step1BasicInfo = ({ formData, updateFormData }: { 
  formData: CreateGroupData, 
  updateFormData: (updates: Partial<CreateGroupData>) => void 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span>Basic Information</span>
      </CardTitle>
      <CardDescription>Give your savings group a name and description</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="groupName">Group Name *</Label>
        <Input
          id="groupName"
          placeholder="e.g., Young Professionals Savings Circle"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className="text-lg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose and goals of your savings group..."
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Group Image (Optional)</Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Step2Settings = ({ formData, updateFormData }: { 
  formData: CreateGroupData, 
  updateFormData: (updates: Partial<CreateGroupData>) => void 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <span>Group Settings</span>
      </CardTitle>
      <CardDescription>Configure the financial details of your group</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="monthlyAmount">Monthly Contribution *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="monthlyAmount"
              type="number"
              placeholder="500"
              value={formData.monthlyAmount}
              onChange={(e) => updateFormData({ monthlyAmount: Number(e.target.value) || 0 })}
              className="pl-10 text-lg"
            />
          </div>
          <p className="text-sm text-muted-foreground">Amount each member contributes monthly</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalMembers">Total Members *</Label>
          <div className="relative">
            <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="totalMembers"
              type="number"
              min="2"
              max="50"
              value={formData.totalMembers}
              onChange={(e) => updateFormData({ totalMembers: Number(e.target.value) || 2 })}
              className="pl-10 text-lg"
            />
          </div>
          <p className="text-sm text-muted-foreground">Maximum number of participants</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (Months) *</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="duration"
            type="number"
            min="2"
            max="24"
            value={formData.duration}
            onChange={(e) => updateFormData({ duration: Number(e.target.value) || 2 })}
            className="pl-10 text-lg"
          />
        </div>
        <p className="text-sm text-muted-foreground">How long the savings cycle will run</p>
      </div>

      {/* Preview calculations */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium">Preview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Pool:</span>
            <span className="ml-2 font-medium">
              ${(formData.monthlyAmount * formData.totalMembers).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Your Total:</span>
            <span className="ml-2 font-medium">
              ${(formData.monthlyAmount * formData.duration).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Step3PayoutOrder = ({ formData, updateFormData }: { 
  formData: CreateGroupData, 
  updateFormData: (updates: Partial<CreateGroupData>) => void 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-primary" />
        <span>Payout Order</span>
      </CardTitle>
      <CardDescription>Choose how payout months are assigned</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <RadioGroup 
        value={formData.payoutOrder} 
        onValueChange={(value: 'auto' | 'manual') => updateFormData({ payoutOrder: value })}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Auto-assign (Recommended)</p>
                <p className="text-sm text-muted-foreground">
                  Members will be randomly assigned payout months when they join
                </p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Manual Selection</p>
                <p className="text-sm text-muted-foreground">
                  Members can choose their preferred payout month (first-come, first-served)
                </p>
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>

      {formData.payoutOrder === 'auto' && (
        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Auto-assignment Benefits
              </p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Fair and random distribution</li>
                <li>• Faster group filling</li>
                <li>• No conflicts over popular months</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const Step4Review = ({ formData }: { formData: CreateGroupData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Eye className="h-5 w-5 text-primary" />
        <span>Review & Create</span>
      </CardTitle>
      <CardDescription>Review your group settings before creating</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Group Name</Label>
            <p className="text-lg font-medium">{formData.name || 'Untitled Group'}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="text-sm">{formData.description || 'No description provided'}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Payout Method</Label>
            <Badge variant="outline" className="mt-1">
              {formData.payoutOrder === 'auto' ? 'Auto-assign' : 'Manual Selection'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4">
            <h4 className="font-medium mb-3">Financial Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monthly Contribution:</span>
                <span className="font-medium">${formData.monthlyAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Members:</span>
                <span className="font-medium">{formData.totalMembers}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{formData.duration} months</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Monthly Pool:</span>
                  <span>${(formData.monthlyAmount * formData.totalMembers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-primary font-medium">
                  <span>Your Total Investment:</span>
                  <span>${(formData.monthlyAmount * formData.duration).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <p className="text-sm text-card-foreground">
          <strong>Important:</strong> Once created, group settings cannot be changed. 
          Make sure all details are correct before proceeding.
        </p>
      </div>
    </CardContent>
  </Card>
);

const CreateGroup = () => {
  const navigate = useNavigate();
  const { createGroup } = useGroupsStore();
  const { joinGroup } = useUserStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    image: '',
    monthlyAmount: 500,
    duration: 12,
    totalMembers: 12,
    payoutOrder: 'auto',
    selectedSlots: [],
  });

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Group details' },
    { number: 2, title: 'Settings', description: 'Amount & duration' },
    { number: 3, title: 'Payout Order', description: 'Slot selection' },
    { number: 4, title: 'Review', description: 'Confirm details' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await createGroup(formData);
      
      if (success) {
        toast({
          title: "Group Created Successfully!",
          description: `${formData.name} is now ready for members to join.`,
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: "Error Creating Group",
          description: "Failed to create group. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create group error:', error);
      toast({
        title: "Error Creating Group",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<CreateGroupData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
              ${currentStep >= step.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
              }
            `}>
              {currentStep > step.number ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step.number}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-2 transition-all
                ${currentStep > step.number ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>
      <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      <div className="flex justify-between mt-2">
        {steps.map(step => (
          <div key={step.number} className="text-center">
            <p className={`text-sm font-medium ${
              currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.description.trim();
      case 2:
        return formData.monthlyAmount > 0 && formData.totalMembers >= 2 && formData.duration >= 2;
      case 3:
        return formData.payoutOrder;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2Settings formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3PayoutOrder formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Review formData={formData} />;
      default:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Savings Group</h1>
          <p className="text-muted-foreground">Set up a new savings circle for you and your community</p>
        </div>

        <StepIndicator />
        
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Creating...' : 'Create Group'}</span>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateGroup;