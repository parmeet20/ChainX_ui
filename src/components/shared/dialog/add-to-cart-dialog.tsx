"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, TextCursor, Phone, MapPin, Package } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { IProduct } from "@/utils/types";
import { getProvider } from "@/services/blockchain";
import { createNewWarehouse } from "@/services/warehouse/warehouseService";
import { toast } from "sonner";
import useStore from "@/store/user_store";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contact_details: z.string().min(8, "Invalid contact information"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  product_stock: z.number().min(1, "Minimum 1 item required"),
});

export function AddToCartDialog({
  open,
  setOpen,
  product,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: IProduct;
}) {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  const {user} = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      contact_details: "",
      product_stock: 1,
      latitude: 0,
      longitude: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!program || !publicKey) return;
    try {
      const tx = await createNewWarehouse(
        program,
        values.name,
        values.description,
        values.contact_details,
        values.latitude,
        values.longitude,
        values.product_stock,
        product.factory_id,
        product.factory_pda.toString(),
        product.publicKey.toString(),
        publicKey
      );

      // Send email notification
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          name: values.name,
          description: values.description,
          contact_details: values.contact_details,
          warehouseSize: values.product_stock
        }),
      });

      toast("Warehouse Created Successfully", {
        description: "Transaction confirmed and confirmation email sent",
        action: (
          <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
            View Transaction
          </a>
        ),
      });
      setOpen(false);
      return tx;
    } catch (error) {
      console.log(error);
      toast("Error Creating Warehouse", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Create New Warehouse
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Details
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Latitude
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormItem className="col-span-1">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Longitude
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Warehouse Size
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <TextCursor className="h-4 w-4" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Special instructions or notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Warehouse
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
