"use client";
import { getProvider } from "@/services/blockchain";
import { createNewProduct } from "@/services/product/productService";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import useStore from "@/store/user_store";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  name: z.string().max(32, "Name must be at most 32 characters"),
  description: z
    .string()
    .max(512, "Description must be at most 512 characters"),
  batch_no: z.string().max(64, "Batch number must be at most 64 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().min(0, "Quantity must be a positive number"),
  rawMaterialUsed: z.number().min(0.01, "Raw material cost must be atleast 0.01"),
  mrp: z.number().min(0, "MRP must be a positive number"),
});

const CreateProductPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname!.split("/")[3];
  const factory_pda = id.toString();
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      batch_no: "",
      price: 0,
      quantity: 0,
      mrp: 0,
      rawMaterialUsed:0,
    },
  });

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const uploadToIPFS = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key:
              process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      setUploadProgress(null);
      return `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      setUploadProgress(null);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!imageFile) {
      toast.error("Please select a product image");
      return;
    }

    // Validate image file
    if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
      toast.error(
        "Invalid file type. Please upload a JPEG, JPG, PNG, or WEBP image."
      );
      return;
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    try {
      setLoading(true);

      // Upload image to IPFS
      toast.info("Uploading image to IPFS...");
      const imageUrl = await uploadToIPFS(imageFile);
      toast.success("Image uploaded successfully!");

      // Create product with IPFS image URL
      toast.info("Creating product on blockchain...");
      const tx = await createNewProduct(
        program,
        values.name,
        values.description,
        imageUrl,
        values.batch_no,
        values.price,
        values.quantity,
        values.mrp,
        values.rawMaterialUsed,
        factory_pda,
        publicKey
      );

      toast.success("Product created successfully!", {
        action: (
          <a
            href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Transaction
          </a>
        ),
      });

      // Send email notification
      try {
        toast.info("Sending confirmation email...");
        await axios.post("/api/product/created-product", {
          email: user?.email, // Replace with actual user email
          message: `A new product has been created with the following details:
                
                Name: ${values.name}
                Description: ${values.description}
                Batch Number: ${values.batch_no}
                Price: ${values.price}
                Quantity: ${values.quantity}
                MRP: ${values.mrp}`,
          productName: values.name,
          imageUrl: imageUrl,
        });
        toast.success("Confirmation email sent!");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        toast.warning("Product created but email notification failed");
      }

      // Reset form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      router.push(`/services/factory/${id}`);
    } catch (error: unknown) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPEG, JPG, PNG, or WEBP image."
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size too large. Maximum size is 5MB.");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container mx-auto pt-24 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Register a new manufacturing product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Image Upload Field */}
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                  </FormControl>
                  {uploadProgress !== null && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          {...field}
                          disabled={loading}
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
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description"
                          className="min-h-[100px]"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batch_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter batch number"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rawMaterialUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raw Material Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter Raw Material Cost"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRP</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter MRP"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !imageFile}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProductPage;
