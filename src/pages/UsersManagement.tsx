
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { VERIFICATION_STATUS } from "@/lib/constants";

interface User {
  uid: string;
  email: string;
  displayName: string;
  verificationStatus: string;
  permissions?: {
    storage: boolean;
    aiInsights: boolean;
    quiz: boolean;
  };
  createdAt: any;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        permissions: doc.data().permissions || { storage: false, aiInsights: false, quiz: false }
      } as User));
      
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        verificationStatus: newStatus,
      });

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { ...user, verificationStatus: newStatus } : user
        )
      );

      toast({
        title: "Status Updated",
        description: `User verification status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleStoragePermissionChange = async (userId: string, enabled: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        "permissions.storage": enabled,
      });

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { 
            ...user, 
            permissions: { 
              ...user.permissions, 
              storage: enabled 
            } 
          } : user
        )
      );

      toast({
        title: "Permissions Updated",
        description: `Storage permission ${enabled ? 'enabled' : 'disabled'} for user`,
      });
    } catch (error) {
      console.error("Error updating storage permission:", error);
      toast({
        title: "Error",
        description: "Failed to update storage permission",
        variant: "destructive",
      });
    }
  };

  const handleAIInsightsPermissionChange = async (userId: string, enabled: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        "permissions.aiInsights": enabled,
      });

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { 
            ...user, 
            permissions: { 
              ...user.permissions, 
              aiInsights: enabled 
            } 
          } : user
        )
      );

      toast({
        title: "Permissions Updated",
        description: `AI Insights permission ${enabled ? 'enabled' : 'disabled'} for user`,
      });
    } catch (error) {
      console.error("Error updating AI Insights permission:", error);
      toast({
        title: "Error",
        description: "Failed to update AI Insights permission",
        variant: "destructive",
      });
    }
  };

  const handleQuizPermissionChange = async (userId: string, enabled: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        "permissions.quiz": enabled,
      });

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { 
            ...user, 
            permissions: { 
              ...user.permissions, 
              quiz: enabled 
            } 
          } : user
        )
      );

      toast({
        title: "Permissions Updated",
        description: `Quiz permission ${enabled ? 'enabled' : 'disabled'} for user`,
      });
    } catch (error) {
      console.error("Error updating Quiz permission:", error);
      toast({
        title: "Error",
        description: "Failed to update Quiz permission",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString() + " " + timestamp.toDate().toLocaleTimeString();
    }
    return "Invalid date";
  };

  return (
    <AppLayout title="Users Management">
      <div className="space-y-6">
        <p className="text-muted-foreground">Manage user verification statuses and permissions</p>
        
        {loading ? (
          <div className="flex justify-center p-4">Loading users...</div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Storage Access</TableHead>
                  <TableHead>AI Insights Access</TableHead>
                  <TableHead>Quiz Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium
                          ${user.verificationStatus === VERIFICATION_STATUS.APPROVED 
                            ? 'bg-green-100 text-green-800' 
                            : user.verificationStatus === VERIFICATION_STATUS.REJECTED
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {user.verificationStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.verificationStatus === VERIFICATION_STATUS.APPROVED && (
                          <Switch
                            checked={user.permissions?.storage || false}
                            onCheckedChange={(checked) => handleStoragePermissionChange(user.uid, checked)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.verificationStatus === VERIFICATION_STATUS.APPROVED && (
                          <Switch
                            checked={user.permissions?.aiInsights || false}
                            onCheckedChange={(checked) => handleAIInsightsPermissionChange(user.uid, checked)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.verificationStatus === VERIFICATION_STATUS.APPROVED && (
                          <Switch
                            checked={user.permissions?.quiz || false}
                            onCheckedChange={(checked) => handleQuizPermissionChange(user.uid, checked)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.verificationStatus}
                          onValueChange={(value) => handleStatusChange(user.uid, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              <SelectItem value={VERIFICATION_STATUS.PENDING}>Pending</SelectItem>
                              <SelectItem value={VERIFICATION_STATUS.APPROVED}>Approved</SelectItem>
                              <SelectItem value={VERIFICATION_STATUS.REJECTED}>Rejected</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UsersManagement;
