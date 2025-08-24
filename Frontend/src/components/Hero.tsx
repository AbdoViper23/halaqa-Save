import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Shield, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <h1 className="font-display font-bold text-5xl lg:text-7xl text-primary-foreground mb-6 leading-tight">
              Join.<br />
              <span className="bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
                Save.
              </span><br />
              Earn.
            </h1>
            
            <p className="text-xl lg:text-2xl text-primary-foreground/90 mb-8 max-w-lg mx-auto lg:mx-0">
              Join monthly savings groups where people save together and each month one person receives the total collected amount.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/groups/create">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Create Group
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/groups/browse">
                <Button variant="glass" size="xl" className="w-full sm:w-auto">
                  Join Group
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center lg:text-left">
                <div className="w-12 h-12 bg-card/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-3">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-1">Smart Group Matching</h3>
                <p className="text-primary-foreground/70 text-sm">AI-powered matching with like-minded savers</p>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="w-12 h-12 bg-card/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-3">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-1">Secure Payments</h3>
                <p className="text-primary-foreground/70 text-sm">Bank-level security for all transactions</p>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="w-12 h-12 bg-card/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-3">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-1">Anonymous & Private</h3>
                <p className="text-primary-foreground/70 text-sm">Your identity stays protected throughout</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative z-10 max-w-4xl mx-auto">
              <img 
                src={heroImage} 
                alt="People saving together in groups" 
                className="w-full h-auto rounded-3xl shadow-strong"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl" />
            </div>
            {/* Floating stats cards */}
            
            <div className="absolute -top-4 -right-2 md:-top-6 md:-right-6 bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-medium animate-float z-20">
              <div className="text-2xl font-bold text-primary">$50K+</div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </div>

            <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-medium animate-float z-20" style={{ animationDelay: "2s" }}>
              <div className="text-2xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;