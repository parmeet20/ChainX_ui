"use client";
import { getProvider } from "@/services/blockchain";
import { createNewFactory } from "@/services/factory/factoryService";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useStore from "@/store/user_store";

const formSchema = z.object({
  name: z.string().max(32, "Name must be at most 32 characters"),
  description: z
    .string()
    .max(512, "Description must be at most 512 characters"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  contact_info: z
    .string()
    .max(512, "Contact information must be at most 512 characters"),
});

const CreateFactoryPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      contact_info: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!program || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setLoading(true);
      const tx = await createNewFactory(
        program,
        values.name,
        values.description,
        values.latitude,
        values.longitude,
        values.contact_info,
        publicKey
      );

      // Prepare email content
      const emailContent = `
        Factory Name: ${values.name}
        Description: ${values.description}
        Location: (${values.latitude}, ${values.longitude})
        Contact: ${values.contact_info}
        Transaction Signature: ${tx}
      `.trim();

      // Send email notification
      await axios.post("/api/factories/create-factory", {
        email: user?.email,
        message: emailContent,
      });

      toast.success("Factory Created", {
        description: `${values.name} successfully created`,
        action: (
          <a
            href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Transaction
          </a>
        ),
      });

      form.reset();
      router.push("/services");
    } catch (error) {
      console.error("Error creating factory:", error);
      toast.error("Failed to create factory", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto pt-24 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Factory</CardTitle>
          <CardDescription>
            Register a new manufacturing facility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Factory Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter factory name" {...field} />
                      </FormControl>
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
                          placeholder="Detailed description of the factory"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter latitude"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter longitude"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contact_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email, phone, or other contact details"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !publicKey}
              >
                {loading ? "Creating..." : "Create Factory"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFactoryPage;
