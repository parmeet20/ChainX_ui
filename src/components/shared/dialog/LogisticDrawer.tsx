"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const LogisticFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(["TRUCK", "TRAIN", "SHIP", "PLANE", "DRONE"]),
  stock: z.number().min(1, "Stock must be at least 1."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  contact_info: z
    .string()
    .min(5, "Contact info must be at least 5 characters."),
});

export function LogisticDrawer({
  isOpen,
  onOpenChange,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof LogisticFormSchema>) => void;
  loading: boolean;
}) {
  const form = useForm<z.infer<typeof LogisticFormSchema>>({
    resolver: zodResolver(LogisticFormSchema),
    defaultValues: {
      name: "",
      role: "TRUCK",
      stock: 0,
      latitude: 0,
      longitude: 0,
      contact_info: "",
    },
  });

  function handleSubmit(data: z.infer<typeof LogisticFormSchema>) {
    onSubmit(data);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hidden">
          Open Logistic Form
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] z-[600]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Become a Logistic Partner
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[600]">
                        <SelectItem value="TRUCK">Truck</SelectItem>
                        <SelectItem value="TRAIN">Train</SelectItem>
                        <SelectItem value="SHIP">Ship</SelectItem>
                        <SelectItem value="PLANE">Plane</SelectItem>
                        <SelectItem value="DRONE">Drone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter vehicle stock"
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
                name="contact_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone/Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter longitude"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Logistic...
                </>
              ) : (
                "Create Logistic Partner"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
