
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages, ProfilePictures } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";
import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";

export default function AuthenticationPage() {
  const loginHeroImage = PlaceHolderImages.find(image => image.id === 'login-hero');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpAadhaar, setSignUpAadhaar] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if user is logged in and not in the middle of a signup process
    if (user && !isSigningUp) {
      // If the user has no display name, they need to set it up.
      if (!user.displayName) {
        router.push('/dashboard/profile');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router, isSigningUp]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      // Let the useEffect handle the redirect
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsSigningUp(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const newUser = userCredential.user;

      // Randomly select a profile picture
      const randomPfp = ProfilePictures[Math.floor(Math.random() * ProfilePictures.length)];

      // Create a user profile document in Firestore
      await setDoc(doc(firestore, "users", newUser.uid), {
        id: newUser.uid,
        aadhaarNumber: signUpAadhaar,
        email: newUser.email,
        registrationDate: new Date().toISOString(),
        displayName: '', // Initialize display name
        photoURL: randomPfp.imageUrl, // Assign random profile picture
      });

      // Redirect to profile setup page
      router.push('/dashboard/profile');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  if (isUserLoading || (user && !isSigningUp)) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo />
            <h1 className="text-3xl font-bold mt-4">Welcome</h1>
            <p className="text-balance text-muted-foreground">
              Sign in or create an account to start reporting
            </p>
          </div>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>
                      Enter your email below to login to your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-signin">Email</Label>
                      <Input id="email-signin" type="email" placeholder="m@example.com" required value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password-signin">Password</Label>
                        <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                          Forgot your password?
                        </Link>
                      </div>
                      <Input id="password-signin" type="password" required value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">Sign In</Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>
                      Enter your information to create an account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input id="email-signup" type="email" placeholder="m@example.com" required value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="aadhaar">Aadhaar Number</Label>
                      <Input id="aadhaar" type="text" placeholder="XXXX XXXX XXXX" required value={signUpAadhaar} onChange={(e) => setSignUpAadhaar(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input id="password-signup" type="password" required value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">Create an account</Button>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginHeroImage && (
          <Image
            src={loginHeroImage.imageUrl}
            alt={loginHeroImage.description}
            fill
            className="object-cover"
            data-ai-hint={loginHeroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-4xl font-bold">Your Voice, Your City</h2>
            <p className="text-lg mt-2 max-w-lg">Empowering citizens to build a better community, one report at a time.</p>
        </div>
      </div>
    </div>
  );
}
