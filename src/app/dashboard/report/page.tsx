
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { MapPin, Loader2 } from "lucide-react";
import { useFirestore, useUser, useStorage, errorEmitter, FirestorePermissionError } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

const reportFormSchema = z.object({
  category: z.string({ required_error: "Please select an issue category." }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not be longer than 500 characters."
  }),
  photo: z.any().refine((files) => files?.length == 1, 'Photo is required.'),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  address: string;
  error: string | null;
}

export default function ReportIssuePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: "",
    error: null
  });

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(data: ReportFormValues) {
    if (!user || !firestore || !storage) {
        toast({ title: "Error", description: "You must be logged in to report an issue.", variant: "destructive"});
        return;
    }
    if (!location.latitude || !location.longitude) {
        toast({ title: "Location Required", description: "Please provide your location before submitting.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);

    try {
        const photoFile = data.photo[0];

        // Compression options
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }
        
        // 1. Compress image
        const compressedFile = await imageCompression(photoFile, options);
        
        const photoRef = ref(storage, `issues/${user.uid}/${Date.now()}-${compressedFile.name}`);
        
        // 2. Upload compressed photo to storage
        const uploadResult = await uploadBytes(photoRef, compressedFile);
        const photoUrl = await getDownloadURL(uploadResult.ref);

        // 3. Create issue document in Firestore
        const issueData = {
            userId: user.uid,
            category: data.category,
            description: data.description,
            photoUrl: photoUrl,
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address, // Saving fetched address
            reportedDate: serverTimestamp(),
            status: "Reported",
        };

        const reportsCollectionRef = collection(firestore, 'users', user.uid, 'reportedIssues');
        
        await addDoc(reportsCollectionRef, issueData).catch(error => {
             if (error.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: reportsCollectionRef.path,
                    operation: 'create',
                    requestResourceData: issueData,
                }));
             }
             throw error; // re-throw to be caught by outer catch
        });

        toast({
            title: "Report Submitted!",
            description: "Thank you for helping improve your city.",
        });
        
        form.reset();
        setLocation({ latitude: null, longitude: null, address: "", error: null });
        router.push("/dashboard/issues");

    } catch (error: any) {
        console.error("Report submission error:", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "Could not save your report. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  function handleGetLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          setLocation({
            latitude,
            longitude,
            address, // You can use a geocoding service here to get a real address
            error: null,
          });
          toast({
            title: "Location Captured",
            description: "Your current location has been set.",
          });
        },
        (error) => {
          setLocation(l => ({ ...l, error: error.message }));
          toast({
            variant: "destructive",
            title: "Location Error",
            description: error.message,
          });
        }
      );
    } else {
      const errorMsg = "Geolocation is not supported by this browser.";
      setLocation(l => ({...l, error: errorMsg}));
      toast({
        variant: "destructive",
        title: "Location Error",
        description: errorMsg,
      });
    }
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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    <Input type="file" accept="image/*" {...form.register("photo")} disabled={isSubmitting} />
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
                        <Input value={location.address} placeholder="Click button to get location" readOnly/>
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isSubmitting}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Live Location
                    </Button>
                </div>
                 <FormDescription>Your current location will be attached to the report.</FormDescription>
                 {location.error && <p className="text-sm font-medium text-destructive">{location.error}</p>}
            </FormItem>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
