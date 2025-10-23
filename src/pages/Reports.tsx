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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, FileDown, Eye, Edit, MessageSquare } from "lucide-react";
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
  paid_amount: number;
  unpaid_amount: number;
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [newPaidAmount, setNewPaidAmount] = useState<string>("");
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
      
      // Map the data to ensure paid_amount and unpaid_amount are present
      const mappedBills = (data || []).map((bill: any) => ({
        ...bill,
        paid_amount: bill.paid_amount || 0,
        unpaid_amount: bill.unpaid_amount ?? bill.total_amount
      }));
      
      setBills(mappedBills);
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
      
      // Open the generated HTML in a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow && data) {
        printWindow.document.write(data);
        printWindow.document.close();
      }
      
      toast.success("PDF generated successfully!");
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const getPaymentStatus = (bill: Bill) => {
    if (bill.unpaid_amount === 0) return "paid";
    if (bill.paid_amount === 0) return "unpaid";
    return "partial";
  };

  const openPaymentDialog = (bill: Bill) => {
    setEditingBill(bill);
    setNewPaidAmount(bill.paid_amount.toString());
    setPaymentDialogOpen(true);
  };

  const updatePaymentStatus = async () => {
    if (!editingBill) return;
    
    try {
      const paid = parseFloat(newPaidAmount) || 0;
      const unpaid = editingBill.total_amount - paid;

      const { error } = await supabase
        .from("bills")
        .update({ 
          paid_amount: paid,
          unpaid_amount: unpaid
        } as any)
        .eq("id", editingBill.id);

      if (error) throw error;
      
      toast.success("Payment status updated!");
      setPaymentDialogOpen(false);
      loadBills();
    } catch (error: any) {
      toast.error("Failed to update payment status");
    }
  };

  const sendSMS = async (bill: Bill) => {
    try {
      toast.info("Sending SMS...");
      await supabase.functions.invoke("send-bill-sms", {
        body: { 
          mobile: bill.customer_mobile,
          billNumber: bill.bill_number,
          customerName: bill.customer_name,
          totalAmount: bill.total_amount,
          paidAmount: bill.paid_amount,
          unpaidAmount: bill.unpaid_amount
        },
      });
      toast.success("SMS sent successfully!");
    } catch (error: any) {
      console.error("SMS error:", error);
      toast.error("Failed to send SMS");
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
                    <TableHead>Paid</TableHead>
                    <TableHead>Unpaid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => {
                    const status = getPaymentStatus(bill);
                    return (
                      <TableRow key={bill.id}>
                        <TableCell className="font-mono">{bill.bill_number}</TableCell>
                        <TableCell>{bill.customer_name}</TableCell>
                        <TableCell>{bill.customer_mobile}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{bill.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ₹{bill.paid_amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          ₹{bill.unpaid_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              status === "paid" ? "default" : 
                              status === "unpaid" ? "destructive" : 
                              "secondary"
                            }
                          >
                            {status === "paid" ? "Paid" : status === "unpaid" ? "Unpaid" : "Partial"}
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
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPaymentDialog(bill)}
                              title="Edit Payment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadPDF(bill.id)}
                              title="Download PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendSMS(bill)}
                              title="Send SMS"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Bill: {editingBill?.bill_number} - Total: ₹{editingBill?.total_amount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Amount Paid</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                max={editingBill?.total_amount}
                value={newPaidAmount}
                onChange={(e) => setNewPaidAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-between text-lg">
              <span>Unpaid Amount:</span>
              <span className="font-bold text-destructive">
                ₹{((editingBill?.total_amount || 0) - (parseFloat(newPaidAmount) || 0)).toFixed(2)}
              </span>
            </div>
            <Button onClick={updatePaymentStatus} className="w-full">
              Update Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;