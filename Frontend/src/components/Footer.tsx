import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/halaqa-logo.png" alt="Halaqa Logo" className="w-14 h-14 object-contain" />
              <span className="font-display font-bold text-2xl">Halaqa</span>
            </div>
            <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-md">
              Building financial futures together through smart savings groups. Join thousands who are already saving smarter.
            </p>
            <div className="mt-6 flex space-x-4">
              <div className="w-10 h-10 bg-primary-foreground/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-primary-foreground/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors cursor-pointer">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-primary-foreground/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors cursor-pointer">
                <span className="text-sm font-bold">in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/dashboard" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/groups/browse" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Browse Groups</Link></li>
              <li><Link to="/groups/create" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Create Group</Link></li>
              <li><Link to="/assistant" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 Halaqa. All rights reserved.
          </p>
          <p className="text-primary-foreground/60 text-sm mt-4 md:mt-0">
            Powered by community savings
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;