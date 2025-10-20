import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Users, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            GANAPATI ELECTRONICS & EMITRA
          </h1>
          <p className="text-2xl text-muted-foreground">BATADU</p>
          <p className="text-lg text-muted-foreground mt-4">Professional Billing & Inventory Management</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Product Management</h3>
            <p className="text-muted-foreground">Track inventory with 4-digit codes</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-xl font-semibold mb-2">Quick Billing</h3>
            <p className="text-muted-foreground">Generate bills in seconds</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Customer Database</h3>
            <p className="text-muted-foreground">Manage customer information</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-success" />
            <h3 className="text-xl font-semibold mb-2">PDF Reports</h3>
            <p className="text-muted-foreground">Auto-generate professional invoices</p>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Login to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
