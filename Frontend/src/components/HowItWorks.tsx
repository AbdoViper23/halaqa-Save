import { Users, CreditCard, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Users,
      title: "Join a Group",
      description: "Find or create a savings group that matches your budget and timeline. Groups typically have 5-12 members.",
      color: "text-primary"
    },
    {
      icon: CreditCard,
      title: "Make Monthly Payments",
      description: "Each month, every member contributes the agreed amount. Payments are secure and tracked automatically.",
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      title: "Receive Your Payout",
      description: "When it's your turn, you receive the full pot! Continue participating until everyone gets their turn.",
      color: "text-gold"
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6">
            How Halaqa Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple, transparent, and effective. Join thousands who are already building their financial future together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent -translate-x-4 z-0" />
              )}
              
              <div className="relative bg-card rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${step.color.split('-')[1]}/20 to-${step.color.split('-')[1]}/10 flex items-center justify-center mb-6`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-4">
                    {index + 1}
                  </div>
                  
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card rounded-3xl p-8 shadow-soft max-w-2xl mx-auto">
            <h3 className="font-display font-semibold text-2xl text-foreground mb-4">
              Ready to Start Saving?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join a group today and take control of your financial future. No hidden fees, no complex requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-gold text-gold-foreground px-8 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform shadow-medium">
                Browse Groups
              </button>
              <button className="bg-gradient-accent text-accent-foreground px-8 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform shadow-medium">
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;