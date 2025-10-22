import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, FileDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  product_code: string;
  name: string;
  price: number;
  stock: number;
}

interface BillItem {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const CreateBill = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "manual">("cash");
  const [loading, setLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  useEffect(() => {
    checkAuth();
    loadProducts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    }
  };

  const addItem = () => {
    if (!selectedProduct || !quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (qty > product.stock) {
      toast.error("Insufficient stock available");
      return;
    }

    const existingItem = billItems.find((item) => item.product_id === product.id);
    if (existingItem) {
      toast.error("Product already added. Edit quantity in the table.");
      return;
    }

    const newItem: BillItem = {
      product_id: product.id,
      product_code: product.product_code,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      total_price: product.price * qty,
    };

    setBillItems([...billItems, newItem]);
    setSelectedProduct("");
    setQuantity("1");
  };

  const removeItem = (productId: string) => {
    setBillItems(billItems.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || newQty > product.stock) {
      toast.error("Insufficient stock");
      return;
    }

    setBillItems(
      billItems.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: newQty < 1 ? 1 : newQty,
              total_price: item.unit_price * (newQty < 1 ? 1 : newQty),
            }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return billItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const generateBillNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `GE${year}${month}${day}${random}`;
  };

  const handleCreateBill = async () => {
    if (!customerName || !customerMobile) {
      toast.error("Please enter customer name and mobile number");
      return;
    }

    if (billItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    setLoading(true);

    try {
      const billNumber = generateBillNumber();
      const totalAmount = getTotalAmount();
      const paid = parseFloat(paidAmount) || 0;
      const unpaid = totalAmount - paid;

      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("mobile", customerMobile)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await supabase
          .from("customers")
          .update({
            name: customerName,
            address: customerAddress,
          })
          .eq("id", customerId);
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: customerName,
            mobile: customerMobile,
            address: customerAddress,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      const { data: billData, error: billError } = await supabase
        .from("bills")
        .insert({
          bill_number: billNumber,
          customer_id: customerId,
          customer_name: customerName,
          customer_mobile: customerMobile,
          customer_address: customerAddress,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          paid_amount: paid,
          unpaid_amount: unpaid,
          remarks: remarks,
        })
        .select()
        .single();

      if (billError) throw billError;

      const billItemsData = billItems.map((item) => ({
        bill_id: billData.id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from("bill_items")
        .insert(billItemsData);

      if (itemsError) throw itemsError;

      for (const item of billItems) {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock - item.quantity })
            .eq("id", item.product_id);
        }
      }

      toast.success(`Bill ${billNumber} created successfully!`);
      
      try {
        await supabase.functions.invoke("generate-bill-pdf", {
          body: { billId: billData.id },
        });
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
      }

      setBillItems([]);
      setCustomerName("");
      setCustomerMobile("");
      setCustomerAddress("");
      setPaymentMethod("cash");
      setPaidAmount("");
      setRemarks("");
      
      navigate("/reports");
    } catch (error: any) {
      console.error("Error creating bill:", error);
      toast.error(error.message || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = getTotalAmount();
  const paid = parseFloat(paidAmount) || 0;
  const unpaidAmount = totalAmount - paid;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Ganpati Electronics & E Services</h1>
              <p className="text-sm text-muted-foreground">Create New Bill</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Label>Select Product</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.product_code} - {product.name} (Stock: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-32">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addItem} className="w-full md:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">S.R.</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-[100px]">Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.map((item, index) => (
                      <TableRow key={item.product_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div>{item.product_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.product_code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product_id, parseInt(e.target.value))
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>₹{item.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {billItems.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No products added yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerMobile">Mobile *</Label>
                  <Input
                    id="customerMobile"
                    type="tel"
                    maxLength={15}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bill Summary & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Items:</span>
                  <span>{billItems.length}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <hr />

                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Amount Paid</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between text-lg font-semibold text-destructive">
                  <span>Unpaid:</span>
                  <span>₹{unpaidAmount.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: "cash" | "manual") => setPaymentMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="manual">Manual/Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    placeholder="Add any notes..."
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreateBill}
                  disabled={loading || billItems.length === 0}
                >
                  <FileDown className="mr-2 h-5 w-5" />
                  {loading ? "Creating..." : "Create & Generate Bill"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBill;
