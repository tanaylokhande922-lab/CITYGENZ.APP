
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
            // photoURL is already set on sign up, no need to update it here unless we change it
        });
        
        // 2. Update Firestore user document
        const userData = {
            displayName: data.displayName,
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
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Set Up Your Profile</CardTitle>
        <CardDescription>
          Please add your name to complete your registration. Your profile picture has been randomly assigned.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="text-3xl">
                        {getInitials(user?.displayName) || <UserIcon size={40}/>}
                    </AvatarFallback>
                </Avatar>
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
