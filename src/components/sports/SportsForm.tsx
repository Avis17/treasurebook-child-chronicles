
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  sport: z.string().min(2, {
    message: "Sport must be at least 2 characters.",
  }),
  date: z.string(),
  level: z.string(),
  position: z.string(),
  organizer: z.string(),
  achievement: z.string(),
  certificate: z.boolean().default(false),
  notes: z.string().optional(),
});

const levelOptions = [
  "School Level",
  "Inter-School",
  "District Level",
  "State Level",
  "National Level",
  "International Level",
];

const sportOptions = [
  "Football",
  "Basketball",
  "Volleyball",
  "Tennis",
  "Table Tennis",
  "Badminton",
  "Swimming",
  "Cricket",
  "Hockey",
  "Athletics",
  "Martial Arts",
  "Gymnastics",
  "Chess",
  "Other",
];

export type SportsFormValues = z.infer<typeof formSchema>;

interface SportsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SportsFormValues) => void;
  initialData?: SportsFormValues;
}

export const SportsForm = ({ isOpen, onClose, onSubmit, initialData }: SportsFormProps) => {
  const form = useForm<SportsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sport: initialData?.sport || "",
      date: initialData?.date || "",
      level: initialData?.level || "",
      position: initialData?.position || "",
      organizer: initialData?.organizer || "",
      achievement: initialData?.achievement || "",
      certificate: initialData?.certificate || false,
      notes: initialData?.notes || "",
    },
  });

  const handleSubmit = (values: SportsFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Sports Record" : "Add New Sports Record"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update your sports activity details" : "Enter your sports activity details below"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Sport</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportOptions.map((option) => (
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {levelOptions.map((option) => (
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
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g., Forward, Goalkeeper" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Who organized the event?" />
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
                    <Input {...field} placeholder="E.g., Gold medal, First place" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Certificate</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Any additional notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="sm:col-span-2">
              {initialData ? "Update" : "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
