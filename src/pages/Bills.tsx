import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";

interface Bill {
  id: string;
  bill_number: string;
  customer_name: string;
  customer_mobile: string;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  payment_method: string;
  created_at: string;
}

const Bills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    checkAuth();
    loadBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, paymentFilter, dateFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadBills = async () => {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error: any) {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = bills;

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.customer_mobile.includes(searchTerm)
      );
    }

    if (paymentFilter === "paid") {
      filtered = filtered.filter((b) => b.unpaid_amount === 0);
    } else if (paymentFilter === "unpaid") {
      filtered = filtered.filter((b) => b.unpaid_amount > 0);
    } else if (paymentFilter === "partial") {
      filtered = filtered.filter((b) => b.paid_amount > 0 && b.unpaid_amount > 0);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(
        (b) => new Date(b.created_at).toDateString() === filterDate
      );
    }

    setFilteredBills(filtered);
  };

  const handleViewBill = async (billId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-bill-pdf", {
        body: { billId },
      });

      if (error) throw error;

      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(data);
        newWindow.document.close();
      }
    } catch (error: any) {
      toast.error("Failed to generate bill");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Bills</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bill History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6 flex-wrap">
              <Input
                placeholder="Search by bill number, customer name, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bills</SelectItem>
                  <SelectItem value="paid">Fully Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[180px]"
              />
              {dateFilter && (
                <Button variant="outline" onClick={() => setDateFilter("")}>
                  Clear Date
                </Button>
              )}
            </div>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredBills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bills found matching your criteria.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-mono">{bill.bill_number}</TableCell>
                      <TableCell>{bill.customer_name}</TableCell>
                      <TableCell>{bill.customer_mobile}</TableCell>
                      <TableCell>
                        {new Date(bill.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>₹{bill.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {bill.unpaid_amount === 0 ? (
                          <Badge variant="default">Paid</Badge>
                        ) : bill.paid_amount === 0 ? (
                          <Badge variant="destructive">Unpaid</Badge>
                        ) : (
                          <Badge variant="secondary">Partial</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewBill(bill.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Bills;
