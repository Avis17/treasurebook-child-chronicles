import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  userId: string;
}

interface DirectoryTableProps {
  contacts: Contact[];
  onContactDeleted: () => void;
}

export const DirectoryTable = ({ contacts, onContactDeleted }: DirectoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const { toast } = useToast();
  const contactsPerPage = 8;

  const filteredContacts = contacts.filter((contact) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchTermLower) ||
      contact.relationship.toLowerCase().includes(searchTermLower) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTermLower)) ||
      (contact.email && contact.email.toLowerCase().includes(searchTermLower))
    );
  });

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    
    try {
      await deleteDoc(doc(db, "contacts", contactToDelete.id));
      
      toast({
        title: "Contact deleted",
        description: `${contactToDelete.name} has been removed from your directory.`,
      });
      
      setContactToDelete(null);
      setDeleteDialogOpen(false);
      onContactDeleted();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const hasSocialMedia = (contact: Contact) => {
    return Boolean(contact.facebook || contact.twitter || contact.instagram || contact.linkedin);
  };
  
  const openSocialLink = (url: string) => {
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'https://' + url;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="rounded-md border dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="dark:bg-gray-900 dark:hover:bg-gray-800">
              <TableHead className="w-[200px] dark:text-gray-300">Name</TableHead>
              <TableHead className="w-[150px] dark:text-gray-300">Relationship</TableHead>
              <TableHead className="dark:text-gray-300">Contact</TableHead>
              <TableHead className="hidden md:table-cell dark:text-gray-300">Social Media</TableHead>
              <TableHead className="w-[100px] dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentContacts.length > 0 ? (
              currentContacts.map((contact) => (
                <TableRow key={contact.id} className="dark:hover:bg-gray-800/50">
                  <TableCell className="font-medium dark:text-white">
                    {contact.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      {contact.relationship}
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    <div className="space-y-1">
                      {contact.phone && (
                        <div className="text-sm">📱 {contact.phone}</div>
                      )}
                      {contact.email && (
                        <div className="text-sm">✉️ {contact.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell dark:text-gray-300">
                    <div className="flex flex-wrap gap-2">
                      {contact.facebook && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => openSocialLink(contact.facebook!)}
                        >
                          Facebook <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {contact.twitter && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => openSocialLink(contact.twitter!)}
                        >
                          Twitter <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {contact.instagram && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => openSocialLink(contact.instagram!)}
                        >
                          Instagram <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {contact.linkedin && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => openSocialLink(contact.linkedin!)}
                        >
                          LinkedIn <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {!hasSocialMedia(contact) && (
                        <span className="text-gray-500 text-sm">None provided</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(contact)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center dark:text-gray-300">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Showing {indexOfFirstContact + 1}-{Math.min(indexOfLastContact, filteredContacts.length)} of {filteredContacts.length} contacts
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNumber: number;
              
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={currentPage === pageNumber ? "" : "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Are you sure you want to delete {contactToDelete?.name} from your contacts? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="dark:border-gray-700 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContact}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
