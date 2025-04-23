
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
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
import { ExtraCurricularRecord } from "@/pages/Extracurricular";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  activity: z.string().min(1, { message: "Activity name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.date({ required_error: "Date is required" }),
  level: z.string().min(1, { message: "Level is required" }),
  organizer: z.string().min(1, { message: "Organizer is required" }),
  achievement: z.string().min(1, { message: "Achievement details are required" }),
  certificate: z.boolean().default(false),
  notes: z.string().optional(),
});

interface ExtraCurricularFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtraCurricularRecord) => void;
  initialData?: ExtraCurricularRecord;
}

export const ExtraCurricularForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ExtraCurricularFormProps) => {
  const isEditing = !!initialData;

  const defaultValues = {
    activity: "",
    category: "",
    date: new Date(),
    level: "",
    organizer: "",
    achievement: "",
    certificate: false,
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
        notes: initialData.notes || "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");
    
    const recordData: ExtraCurricularRecord = {
      ...(initialData || { userId: "" }),
      ...values,
      date: formattedDate,
    };
    
    onSubmit(recordData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Extracurricular Activity" : "Add New Extracurricular Activity"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of your extracurricular activity." 
              : "Enter the details of your extracurricular activity below."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Piano Competition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Dance">Dance</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Debate">Debate</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                        <SelectItem value="Theatre">Theatre</SelectItem>
                        <SelectItem value="Literature">Literature</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Robotics">Robotics</SelectItem>
                        <SelectItem value="Coding">Coding</SelectItem>
                        <SelectItem value="Leadership">Leadership</SelectItem>
                        <SelectItem value="Social Service">Social Service</SelectItem>
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
                    <FormLabel>Level</FormLabel>
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
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
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
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer / Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="School / Institution name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="achievement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievement / Position</FormLabel>
                    <FormControl>
                      <Input placeholder="1st Prize in Piano Competition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="certificate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Certificate Received
                    </FormLabel>
                    <FormDescription>
                      Check if you received a certificate for this activity
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about this activity"
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
              <Button type="submit">
                {isEditing ? "Update Record" : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
