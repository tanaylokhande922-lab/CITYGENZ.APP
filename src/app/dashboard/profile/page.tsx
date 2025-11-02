
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
import { useAuth, useFirestore, useStorage, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

const profileFormSchema = z.object({
  displayName: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }).max(50, {
    message: "Name must not be longer than 50 characters."
  }),
  photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSetupPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
    mode: "onChange",
  });
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user || !auth.currentUser || !firestore || !storage) {
        toast({ title: "Error", description: "Not authenticated or services unavailable.", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);

    try {
        let photoURL = user.photoURL || '';
        const photoFile = data.photo?.[0];

        // 1. Upload photo if a new one is selected
        if (photoFile) {
            const storageRef = ref(storage, `profile-pictures/${user.uid}`);
            const uploadResult = await uploadBytes(storageRef, photoFile);
            photoURL = await getDownloadURL(uploadResult.ref);
        }

        // 2. Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
            displayName: data.displayName,
            photoURL: photoURL,
        });

        // 3. Update Firestore user document
        const userDocRef = doc(firestore, "users", user.uid);
        const updatedData = {
            displayName: data.displayName,
            photoURL: photoURL,
        };
        await updateDoc(userDocRef, updatedData).catch(error => {
            if (error.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updatedData
                }));
            }
        });
        
        toast({
            title: "Profile Updated!",
            description: "Your profile has been successfully saved.",
        });

        // 4. Redirect to dashboard
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Profile update error:", error);
        if (error.code !== 'permission-denied') {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "An unexpected error occurred.",
            });
        }
    } finally {
        setIsSubmitting(false);
    }
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        }
        reader.readAsDataURL(file);
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
          Please add your name and a profile picture to complete your registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={photoPreview || user?.photoURL || undefined} />
                    <AvatarFallback className="text-3xl">
                        {photoPreview ? null : getInitials(user?.displayName) || <UserIcon size={40}/>}
                    </AvatarFallback>
                </Avatar>
                <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" {...form.register("photo")} onChange={handlePhotoChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
