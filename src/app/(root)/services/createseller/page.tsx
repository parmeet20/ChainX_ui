"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, User, Text, Phone, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProvider } from "@/services/blockchain";
import { createSeller } from "@/services/seller/sellerService";
import { toast } from "sonner";
import useStore from "@/store/user_store";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  latitude: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  contact_info: z.string().min(5, "Contact info must be at least 5 characters"),
});

const CreateSellerPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { user } = useStore();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      latitude: 0,
      longitude: 0,
      contact_info: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!program || !publicKey) return;
    try {
      setLoading(true);
      const tx = await createSeller(
        program,
        values.name,
        values.description,
        values.latitude,
        values.longitude,
        values.contact_info,
        publicKey
      );

      // Send email notification
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email, // assuming contact_info contains email
          name: values.name,
          description: values.description,
          contactInfo: values.contact_info,
        }),
      });

      toast("Seller Account Created", {
        description: `${values.name} created successfully. Confirmation email sent.`,
        action: (
          <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
            View Transaction
          </a>
        ),
      });
    } catch (error) {
      console.log(error);
      toast("Error Creating Seller", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-900 p-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create New Seller
          </CardTitle>
          <CardDescription>
            Fill in the details below to register a new seller location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Seller Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter seller name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Text className="h-4 w-4" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the seller's business"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coordinates Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Latitude Field */}
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Latitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter latitude"
                          {...field}
                          onChange={(event) =>
                            field.onChange(parseFloat(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Longitude Field */}
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Longitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter longitude"
                          {...field}
                          onChange={(event) =>
                            field.onChange(parseFloat(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Info Field */}
              <FormField
                control={form.control}
                name="contact_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!loading ? (
                <Button type="submit" className="w-full">
                  Create Seller
                </Button>
              ) : (
                <Button disabled>
                  <Loader2 className="animate-spin" />
                  Please wait
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSellerPage;
