
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
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { ProfilePictures } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { ADMIN_EMAIL } from "@/lib/constants";

const profileFormSchema = z.object({
  displayName: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }).max(50, {
    message: "Name must not be longer than 50 characters."
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSetupPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const adminPfp = ProfilePictures.find(p => p.id === 'pfp_admin');

  const getDefaultPfp = () => {
    if (isAdmin && adminPfp) {
        return adminPfp.imageUrl;
    }
    return user?.photoURL || ProfilePictures.find(p => p.id === 'pfp1')?.imageUrl || ProfilePictures[0].imageUrl
  }

  const [selectedPfp, setSelectedPfp] = useState(getDefaultPfp());

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
    mode: "onChange",
  });
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user || !auth.currentUser || !firestore) {
        toast({ title: "Error", description: "Not authenticated or services unavailable.", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    
    try {
        const userDocRef = doc(firestore, "users", user.uid);
        
        // 1. Update Auth profile
        await updateProfile(auth.currentUser, {
            displayName: data.displayName,
            photoURL: selectedPfp,
        });
        
        // 2. Update Firestore user document
        const userData = {
            displayName: data.displayName,
            photoURL: selectedPfp,
        };

        setDoc(userDocRef, userData, { merge: true }).catch(error => {
            if (error.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: userData,
                }));
            } else {
                 console.error("Firestore update error:", error);
                 toast({
                     variant: "destructive",
                     title: "Database Update Failed",
                     description: error.message || "Could not save profile to the database.",
                 });
            }
        });

        toast({
            title: "Profile Updated!",
            description: "Your profile has been successfully saved.",
        });
        
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Profile update error:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Set Up Your Profile</CardTitle>
        <CardDescription>
          Choose a profile picture and add your name to complete your registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <FormLabel>Choose Your Avatar</FormLabel>
                <div className="flex flex-wrap gap-4 justify-center">
                    {ProfilePictures.map((pfp) => (
                        <button
                            type="button"
                            key={pfp.id}
                            onClick={() => setSelectedPfp(pfp.imageUrl)}
                            className={cn(
                                "rounded-full transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                selectedPfp === pfp.imageUrl ? "ring-2 ring-primary" : ""
                            )}
                        >
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={pfp.imageUrl} alt={`Avatar ${pfp.id}`} />
                                <AvatarFallback>AV</AvatarFallback>
                            </Avatar>
                        </button>
                    ))}
                </div>
            </div>

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This name will be displayed on your reports.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
