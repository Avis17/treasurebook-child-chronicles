
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  sportName: z.string().min(2, {
    message: "Sport name must be at least 2 characters.",
  }),
  eventName: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }),
  eventDate: z.date(),
  eventType: z.string().min(2, {
    message: "Event type must be at least 2 characters.",
  }),
  venue: z.string().optional(),
  coach: z.string().optional(),
  level: z.string().optional(),
  notes: z.string().optional(),
  achievement: z.string().optional(),
});

// Define sport type options
const sportTypeOptions = [
  "Football",
  "Basketball",
  "Tennis",
  "Swimming",
  "Athletics",
  "Martial Arts",
  "Hockey",
  "Cricket",
  "Badminton",
  "Table Tennis",
  "Volleyball",
  "Other"
];

// Define position options
const positionOptions = [
  "1st Position / Gold",
  "2nd Position / Silver",
  "3rd Position / Bronze",
  "Finalist",
  "Semi-finalist",
  "Quarter-finalist",
  "Participation",
  "Other"
];

interface SportsRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  initialData?: z.infer<typeof formSchema>;
}

export const SportsRecordForm = ({ isOpen, onClose, onSubmit, initialData }: SportsRecordFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      sportName: "",
      eventName: "",
      position: "",
      eventDate: new Date(),
      eventType: "",
      venue: "",
      coach: "",
      level: "",
      notes: "",
      achievement: "",
    },
  });

  const [customSportType, setCustomSportType] = useState("");
  const [showCustomSport, setShowCustomSport] = useState(false);

  useEffect(() => {
    if (initialData?.eventType === "Other") {
      setShowCustomSport(true);
      setCustomSportType(initialData.sportName || "");
    }
  }, [initialData]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const finalValues = { ...values };
    
    // If "Other" is selected as event type, use the custom sport type value
    if (values.eventType === "Other" && customSportType) {
      finalValues.sportName = customSportType;
    } else {
      finalValues.sportName = values.eventType;
    }
    
    onSubmit(finalValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Sports Record" : "Add New Sports Record"}</DialogTitle>
          <DialogDescription>
            Enter the details of your sports activity below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Event's name" {...field} />
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
                  <FormLabel>Sport Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowCustomSport(value === "Other");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCustomSport && (
              <FormItem>
                <FormLabel>Custom Sport Type</FormLabel>
                <FormControl>
                  <Input
                    value={customSportType}
                    onChange={(e) => setCustomSportType(e.target.value)}
                    placeholder="Enter sport type"
                  />
                </FormControl>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position/Result</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="Venue" {...field} />
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
                  <FormLabel>Coach</FormLabel>
                  <FormControl>
                    <Input placeholder="Coach" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input placeholder="Level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Notes" {...field} />
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
                  <FormLabel>Achievement</FormLabel>
                  <FormControl>
                    <Input placeholder="Achievement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="sm:col-span-2">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
