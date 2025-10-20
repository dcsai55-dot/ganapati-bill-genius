import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, FileDown, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Bill {
  id: string;
  bill_number: string;
  customer_name: string;
  customer_mobile: string;
  customer_address?: string;
  total_amount: number;
  payment_method: string;
  pdf_url?: string;
  created_at: string;
}

interface BillItem {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadBills();
  }, []);

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

  const viewBillDetails = async (bill: Bill) => {
    setSelectedBill(bill);
    
    try {
      const { data, error } = await supabase
        .from("bill_items")
        .select("*")
        .eq("bill_id", bill.id);

      if (error) throw error;
      setBillItems(data || []);
      setDialogOpen(true);
    } catch (error: any) {
      toast.error("Failed to load bill details");
    }
  };

  const downloadPDF = async (billId: string) => {
    try {
      toast.info("Generating PDF...");
      const { data, error } = await supabase.functions.invoke("generate-bill-pdf", {
        body: { billId },
      });

      if (error) throw error;
      
      if (data?.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
    } catch (error: any) {
      toast.error("PDF generation coming soon!");
    }
  };

  const getTotalRevenue = () => {
    return bills.reduce((sum, bill) => sum + bill.total_amount, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Reports & Bills</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bills.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{getTotalRevenue().toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Average Bill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{bills.length > 0 ? (getTotalRevenue() / bills.length).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bill History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : bills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bills created yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-mono">{bill.bill_number}</TableCell>
                      <TableCell>{bill.customer_name}</TableCell>
                      <TableCell>{bill.customer_mobile}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{bill.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={bill.payment_method === "cash" ? "default" : "secondary"}>
                          {bill.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(bill.created_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewBillDetails(bill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPDF(bill.id)}
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details: {selectedBill?.bill_number}</DialogTitle>
            <DialogDescription>
              {selectedBill?.customer_name} - {selectedBill?.customer_mobile}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{item.product_code}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>₹{item.total_price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end text-xl font-bold border-t pt-4">
              Total: ₹{selectedBill?.total_amount.toFixed(2)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;