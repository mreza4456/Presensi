"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React, { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

import { IOrganization } from "@/interface"
import { addOrganization, deleteLogo, updateOrganization, uploadLogo } from "@/action/organization"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import ProfilePhotoDialog from "@/components/change-foto"


interface OrganizationFormProps {
  formType: "add" | "edit"
  initialValues?: Partial<IOrganization>
}

// ✅ Zod schema sinkron dengan IOrganization
const OrganizationFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, "Nama organisasi minimal 2 karakter."),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  industry: z.string().optional(),
  size_category: z.string().optional(),
  timezone: z.string().optional(),
  currency_code: z.string().optional(),
  country_code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("URL tidak valid").or(z.literal("")).optional(),
  email: z.string().email("Email tidak valid").or(z.literal("")).optional(),
  logo_url: z.string().url("URL tidak valid").nullable().optional(),


  is_active: z.boolean().default(true),
  subscription_tier: z.string().optional(),
  subscription_expires_at: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)),
})

export default function OrganizationForm({
  formType,
  initialValues,
}: OrganizationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [selectedLogoFile, setSelectedLogoFile] = React.useState<File | null>(
    null
  )

  // ✅ Inisialisasi form
  const form = useForm<z.infer<typeof OrganizationFormSchema>>({
    resolver: zodResolver(OrganizationFormSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      legal_name: "",
      tax_id: "",
      industry: "",
      size_category: "",
      timezone: "",
      currency_code: "",
      country_code: "",
      address: "",
      city: "",
      state_province: "",
      postal_code: "",
      phone: "",
      email: "",
      website: "",
      logo_url: "",
      is_active: true,
      subscription_tier: "",
      subscription_expires_at: "",
    },
  });

  React.useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      form.reset({
        code: initialValues.code || "",
        name: initialValues.name || "",
        legal_name: initialValues.legal_name || "",
        tax_id: initialValues.tax_id || "",
        industry: initialValues.industry || "",
        size_category: initialValues.size_category || "",
        timezone: initialValues.timezone || "",
        currency_code: initialValues.currency_code || "",
        country_code: initialValues.country_code || "",
        address: initialValues.address || "",
        city: initialValues.city || "",
        state_province: initialValues.state_province || "",
        postal_code: initialValues.postal_code || "",
        phone: initialValues.phone || "",
        email: initialValues.email || "",
        website: initialValues.website || "",
        logo_url: initialValues.logo_url || "",
        is_active: initialValues.is_active ?? true,
        subscription_tier: initialValues.subscription_tier || "",
        subscription_expires_at: initialValues.subscription_expires_at || "",
      });
    }
  }, [initialValues, form]);

  async function onSubmit(values: z.infer<typeof OrganizationFormSchema>) {
    try {
      setLoading(true)

      let logoUrl = values.logo_url; // default pakai yang lama

      if (selectedLogoFile) {
        // 1. Upload dulu logo baru
        const uploaded = await uploadLogo(selectedLogoFile);
        if (uploaded) {
          // 2. Kalau ada logo lama, hapus
          if (initialValues?.logo_url) {
            await deleteLogo(initialValues.logo_url);
          }
          // 3. Update ke logo baru
          logoUrl = uploaded;
        }
      }

      const payload = {
        ...values,
        logo_url: logoUrl,
      };

      let response
      if (formType === "add") {
        response = await addOrganization(payload)
      } else if (formType === "edit" && initialValues?.id) {
        response = await updateOrganization(initialValues.id, payload)
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save organization")
      }

      toast.success(
        formType === "add"
          ? "Organization added successfully!"
          : "Organization updated successfully!"
      )
      router.push("/organization")
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="relative">
          <CardHeader>
            <CardTitle>
              {formType === "add" ? "Create Organization" : "Edit Organization"}
            </CardTitle>
            <CardDescription>
              {formType === "add"
                ? "Enter organization details"
                : "Update organization details"}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-3 gap-4 gap-y-8 mb-8 mt-10">


            {/* ...di dalam form... */}
            <div className="col-span-1 row-span-3 flex flex-col items-center gap-3">
              <img
                src={form.watch("logo_url") || "/placeholder.svg"}
                alt="Logo Preview"
                className="w-70 h-70 rounded-full object-cover border"
              />

              <ProfilePhotoDialog
                organizationId={initialValues?.id}
                currentLogo={form.watch("logo_url")}
                onChange={(newLogo) => form.setValue("logo_url", newLogo || "")}
              />
            </div>

            {/* Code */}
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Organization Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Organization Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Legal Name */}
            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Legal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Legal Entity Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax ID */}
            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Tax ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Industry */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Industry Type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className=" col-span-3 grid grid-cols-4 gap-4 gap-y-8">

            {/* Size Category */}
            <FormField
              control={form.control}
              name="size_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Small, Medium, Large" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Timezone */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Asia/Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. IDR, USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ID, US" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State/Province */}
            <FormField
              control={form.control}
              name="state_province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State / Province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Postal Code */}
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+62..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Switch */}
          <div className="grid grid-cols-2 col-span-3 gap-4">

            {/* Subscription Tier */}
            <FormField
              control={form.control}
              name="subscription_tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Tier</FormLabel>
                  <FormControl>
                    <Input placeholder="Basic, Pro, Enterprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subscription Expiry */}
            <FormField
              control={form.control}
              name="subscription_expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Expires At</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ""} // ⬅️ null → ""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
             

          <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="absolute top-4 right-4">
                  
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
         

        <div className="flex gap-4 col-span-2 mt-8 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : formType === "add"
                ? "Create"
                : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
