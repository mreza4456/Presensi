"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

import { IUser } from "@/interface";
import { getAllUsers, updateUsers } from "@/action/users";
import LoadingSkeleton from "@/components/loading-skeleton";
import { ContentLayout } from "@/components/admin-panel/content-layout";

// --- Zod schema ---
const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      gender: "male",
      is_active: true,
    },
  });

  // Fetch user
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const resUsers: any = await getAllUsers();
        if (!resUsers.success) throw new Error(resUsers.message);

        const found = resUsers.data.find((u: IUser) => u.id === id);
        if (!found) {
          toast.error("User not found");
          router.push("/users");
          return;
        }

        // reset form values (tanpa role_id)
        form.reset({
          ...found,
        });
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, form, router]);

  const onSubmit = async (values: FormValues) => {
    const res = await updateUsers(id as string, values);
    if (res.success) {
      toast.success("User updated successfully");
      router.push("/users");
    } else {
      toast.error(res.message);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <ContentLayout title="Edit User">
      <div className="max-w-xl mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-6 rounded-lg shadow"
          >
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <select
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Status Active</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
}
