
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

const achievementOptions = [
  "1st Prize / Gold Medal",
  "2nd Prize / Silver Medal",
  "3rd Prize / Bronze Medal",
  "Special Recognition",
  "Participation Certificate",
  "Honorable Mention",
  "Best Performance",
  "Other"
];

const categoryOptions = [
  "Arts & Culture",
  "Music",
  "Dance",
  "Drama & Theatre",
  "Debate & Public Speaking",
  "Academic Competitions",
  "Community Service",
  "Leadership",
  "Technology & Coding",
  "Environmental Activities",
  "Other"
];

const levelOptions = [
  "School Level",
  "Inter-School",
  "District Level",
  "State Level",
  "National Level",
  "International Level"
];

const formSchema = z.object({
  activity: z.string().min(2, {
    message: "Activity must be at least 2 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  date: z.string(),
  level: z.string(),
  organizer: z.string(),
  achievement: z.string(),
  certificate: z.boolean().default(false),
  notes: z.string().optional(),
});

interface ExtraCurricularFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialData?: any;
}

export const ExtraCurricularForm = ({ isOpen, onClose, onSubmit, initialData }: ExtraCurricularFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity: initialData?.activity || "",
      category: initialData?.category || "",
      date: initialData?.date || "",
      level: initialData?.level || "",
      organizer: initialData?.organizer || "",
      achievement: initialData?.achievement || "",
      certificate: initialData?.certificate || false,
      notes: initialData?.notes || "",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Activity" : "Add Activity"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Edit your activity details." : "Enter your activity details."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Activity</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Soccer" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
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
                    <Input placeholder="e.g. 2021-01-01" {...field} />
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
              name="organizer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. School" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select achievement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {achievementOptions.map((option) => (
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

            <Button type="submit" className="sm:col-span-2">{initialData ? "Update" : "Submit"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
