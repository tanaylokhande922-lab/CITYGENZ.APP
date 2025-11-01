"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

const reportFormSchema = z.object({
  category: z.string({ required_error: "Please select an issue category." }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not be longer than 500 characters."
  }),
  photo: z.any().refine((file) => file?.length == 1, 'Photo is required.'),
  location: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportIssuePage() {
  const { toast } = useToast();
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      description: "",
    },
  });

  function onSubmit(data: ReportFormValues) {
    console.log(data);
    toast({
      title: "Report Submitted!",
      description: "Thank you for helping improve your city. Your report has been received.",
    });
    form.reset();
  }

  function handleGetLocation() {
    form.setValue("location", "123 Civic Center, Your City (Mocked Location)");
     toast({
      title: "Location Captured",
      description: "Mocked location has been set.",
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Report a Civic Issue</CardTitle>
        <CardDescription>
          Help us improve your community by reporting problems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pothole">Pothole</SelectItem>
                      <SelectItem value="Streetlight">Broken Streetlight</SelectItem>
                      <SelectItem value="Waste Management">Waste Management</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about the issue"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide as much detail as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Photo</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" {...form.register("photo")} />
                  </FormControl>
                   <FormDescription>A picture is worth a thousand words.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Location</FormLabel>
                <div className="flex gap-2">
                    <FormControl>
                        <Input value={form.watch('location') || ''} placeholder="Click button to get location" readOnly/>
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleGetLocation}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Live Location
                    </Button>
                </div>
                 <FormDescription>Your current location will be attached to the report.</FormDescription>
            </FormItem>
            
            <Button type="submit">Submit Report</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
