import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  Package,
  LogOut,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    totalBills: 0,
  });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadStats = async () => {
    try {
      const [products, customers, bills] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }),
        supabase.from("customers").select("*", { count: "exact" }),
        supabase.from("bills").select("*", { count: "exact" }),
      ]);

      const lowStock = products.data?.filter(
        (p) => p.stock <= p.low_stock_threshold
      ).length || 0;

      setStats({
        totalProducts: products.count || 0,
        lowStockProducts: lowStock,
        totalCustomers: customers.count || 0,
        totalBills: bills.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "from-primary to-primary/80",
      href: "/products",
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: "from-warning to-warning/80",
      href: "/products",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "from-secondary to-secondary/80",
      href: "/customers",
    },
    {
      title: "Total Bills",
      value: stats.totalBills,
      icon: FileText,
      color: "from-success to-success/80",
      href: "/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            GANAPATI ELECTRONICS & EMITRA BATADU
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your shop overview.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(stat.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/products")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Add, edit, or remove products from your inventory
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/create-bill")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-secondary" />
                Create Bill
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate new bills and invoices for customers
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/customers")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View and manage your customer database
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/reports")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View bills history and generate reports
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/accounting")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Accounting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Chart of Accounts and General Ledger
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;