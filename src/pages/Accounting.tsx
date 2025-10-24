import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  account_category: string;
  description: string | null;
  is_active: boolean;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_type: string | null;
  status: string;
}

interface JournalLine {
  id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string | null;
  accounts: {
    account_code: string;
    account_name: string;
  };
}

const Accounting = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Chart of Accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .order("account_code");

      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);

      // Load Journal Entries
      const { data: entriesData, error: entriesError } = await supabase
        .from("journal_entries")
        .select("*")
        .order("entry_date", { ascending: false })
        .limit(50);

      if (entriesError) throw entriesError;
      setJournalEntries(entriesData || []);
    } catch (error: any) {
      toast.error("Error loading accounting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Accounting</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">
                <BookOpen className="h-4 w-4 mr-2" />
                Chart of Accounts
              </TabsTrigger>
              <TabsTrigger value="journal">
                <FileText className="h-4 w-4 mr-2" />
                General Ledger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              <Card>
                <CardHeader>
                  <CardTitle>Chart of Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No accounts found
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-mono">
                                {account.account_code}
                              </TableCell>
                              <TableCell className="font-medium">
                                {account.account_name}
                              </TableCell>
                              <TableCell>
                                {getAccountTypeLabel(account.account_type)}
                              </TableCell>
                              <TableCell>
                                {getCategoryLabel(account.account_category)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {account.description}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="journal">
              <Card>
                <CardHeader>
                  <CardTitle>General Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                  {journalEntries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No journal entries found
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Entry #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {journalEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-mono">
                                {entry.entry_number}
                              </TableCell>
                              <TableCell>
                                {new Date(entry.entry_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{entry.description}</TableCell>
                              <TableCell className="capitalize">
                                {entry.reference_type || 'Manual'}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  entry.status === 'posted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {entry.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Accounting;
