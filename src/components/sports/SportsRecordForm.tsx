
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { SportsRecord } from "@/pages/Sports";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  eventName: z.string().min(1, { message: "Event name is required" }),
  eventType: z.string().min(1, { message: "Event type is required" }),
  date: z.date({ required_error: "Date is required" }),
  position: z.string().min(1, { message: "Position/Result is required" }),
  venue: z.string().min(1, { message: "Venue is required" }),
  achievement: z.string().optional(),
  level: z.string().min(1, { message: "Competition level is required" }),
  coach: z.string().optional(),
  notes: z.string().optional(),
});

interface SportsRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SportsRecord) => void;
  initialData?: SportsRecord;
}

export const SportsRecordForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SportsRecordFormProps) => {
  const isEditing = !!initialData;

  const defaultValues = {
    eventName: "",
    eventType: "",
    date: new Date(),
    position: "",
    venue: "",
    achievement: "",
    level: "",
    coach: "",
    notes: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        achievement: initialData.achievement || "",
        coach: initialData.coach || "",
        notes: initialData.notes || "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");
    
    const recordData: SportsRecord = {
      ...(initialData || { 
        userId: "",
        eventName: values.eventName,
        eventType: values.eventType,
        date: formattedDate,
        position: values.position,
        venue: values.venue,
        level: values.level,
        achievement: values.achievement || "",
        coach: values.coach || ""
      }),
      ...values,
      date: formattedDate,
    };
    
    onSubmit(recordData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Sports Record" : "Add New Sports Record"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your sports achievement." : "Enter the details of your sports achievement below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="100m Sprint" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport / Event Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Athletics">Athletics</SelectItem>
                        <SelectItem value="Swimming">Swimming</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Badminton">Badminton</SelectItem>
                        <SelectItem value="Table Tennis">Table Tennis</SelectItem>
                        <SelectItem value="Hockey">Hockey</SelectItem>
                        <SelectItem value="Volleyball">Volleyball</SelectItem>
                        <SelectItem value="Chess">Chess</SelectItem>
                        <SelectItem value="Martial Arts">Martial Arts</SelectItem>
                        <SelectItem value="Gymnastics">Gymnastics</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competition Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="Inter-School">Inter-School</SelectItem>
                        <SelectItem value="District">District</SelectItem>
                        <SelectItem value="State">State</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="Olympic">Olympic</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Result</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1st Position / Gold">1st Position / Gold</SelectItem>
                        <SelectItem value="2nd Position / Silver">2nd Position / Silver</SelectItem>
                        <SelectItem value="3rd Position / Bronze">3rd Position / Bronze</SelectItem>
                        <SelectItem value="Participation">Participation</SelectItem>
                        <SelectItem value="Finalist">Finalist</SelectItem>
                        <SelectItem value="Semi-finalist">Semi-finalist</SelectItem>
                        <SelectItem value="Quarter-finalist">Quarter-finalist</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="City Sports Complex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="achievement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievement Details (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Broke school record with timing 11.2s" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Coach's name" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about this achievement"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update Record" : "Add Record"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
