"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { getProvider } from "@/services/blockchain";
import { inspectProduct } from "@/services/inspector/inspectorService";

import { getUserWithPda } from "@/services/user/userService";
import { useRouter } from "next/navigation";
import useStore from "@/store/user_store";
import { IFactory } from "@/utils/types";
import { getFactory } from "@/services/factory/factoryService";

const inspectionOutcomes = [
  "PASS",
  "FAIL",
  "PENDING",
  "RE_INSPECTION",
  "CONDITIONAL_PASS",
] as const;

const formSchema = z.object({
  name: z.string().max(32, "Name must be at most 32 characters"),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  inspection_outcome: z.enum(inspectionOutcomes),
  notes: z.string().max(512, "Notes must be at most 512 characters"),
  fee_charged_per_product: z.coerce
    .number()
    .max(5, "Fee must be a positive number"),
});

export function InspectProductDialog({
  open,
  setOpen,
  p_id,
  prod_pda,
  factoty_pda, // Typo: should be "factory_pda"
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  p_id: number;
  prod_pda: string;
  factoty_pda: string;
}) {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  const [loading, setLoading] = useState(false);

  const [factory, setFactory] = useState<IFactory | null>(null);

  const router = useRouter();
  const {user} = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      inspection_outcome: "PASS",
      notes: "",
      fee_charged_per_product: 0,
    },
  });
  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (!program || !publicKey) {
      console.error("Missing critical data:", {
        program: !!program,
      });
      alert("Blockchain connection error - refresh or reconnect wallet");
      return;
    }
    const usr_pda = await getUserWithPda(program, publicKey);

    try {
      setLoading(true);
      const tx = await inspectProduct(
        program,
        values.name,
        values.latitude,
        values.longitude,
        p_id,
        values.inspection_outcome,
        values.notes,
        values.fee_charged_per_product,
        usr_pda.toString(),
        prod_pda,
        factoty_pda,
        publicKey!
      );

      // Send email notification
      await fetch("/api/inspector/create-inspector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email, // or use user's email if available
          name: values.name,
          inspectionOutcome: values.inspection_outcome,
          notes: values.notes,
          fee: values.fee_charged_per_product,
        }),
      });

      await fetch("/api/inspector/create-inspector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: factory?.contact_info, // or use user's email if available
          name: values.name,
          inspectionOutcome: values.inspection_outcome,
          notes: values.notes,
          fee: values.fee_charged_per_product,
        }),
      });

      console.log("Inspection transaction:", tx);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
      router.push("/services");
    }
  }

  const fetchFactory = async ()=>{
    try {
      const fact = await getFactory(program!,factoty_pda.toString());
      setFactory(fact);
    } catch (error) {
      setFactory(null);
      console.log(error);
    }
  }

  useEffect(()=>{
   fetchFactory();
  },[program,publicKey])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Product Inspection</DialogTitle>
          <DialogDescription>
            {"Submit product inspection details. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter inspection name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inspection_outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Outcome</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inspectionOutcomes.map((outcome) => (
                          <SelectItem key={outcome} value={outcome}>
                            {outcome.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter inspection notes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee_charged_per_product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee per Product ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter fee amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!loading ? (
              <Button type="submit" className="w-full">
                Submit Inspection
              </Button>
            ) : (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
