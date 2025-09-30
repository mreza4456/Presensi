"use client"

import React from "react"
import { useParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Check, Pencil, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { IWorkScheduleDetail } from "@/interface"
import {
  getWorkScheduleDetails,
  createWorkScheduleDetail,
  updateWorkScheduleDetail,
  deleteWorkScheduleDetail,
} from "@/action/schedule"
import TopBar from "@/components/top-bar"
import LoadingSkeleton from "@/components/loading-skeleton"
import { ContentLayout } from "@/components/admin-panel/content-layout"

const detailSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  is_working_day: z.boolean(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
})

type DetailForm = z.infer<typeof detailSchema>

export default function WorkScheduleDetailsPage() {
  const params = useParams()
  const scheduleId = Number(params.id)

  const [details, setDetails] = React.useState<IWorkScheduleDetail[]>([])
  const [loading, setLoading] = React.useState(true)

  const [open, setOpen] = React.useState(false)
  const [editingDetail, setEditingDetail] = React.useState<IWorkScheduleDetail | null>(null)

  const fetchDetails = async () => {
    setLoading(true)
    const res: any = await getWorkScheduleDetails(scheduleId)
    if (res.success) {
      setDetails(res.data)
    } else {
      toast.error(res.message)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchDetails()
  }, [scheduleId])

  const form = useForm<DetailForm>({
    resolver: zodResolver(detailSchema)as any,
    defaultValues: {
      day_of_week: 1,
      is_working_day: true,
      start_time: "",
      end_time: "",
      break_start: "",
      break_end: "",
    },
  })

  const handleSubmit = async (values: DetailForm) => {
    try {
      let res
      if (editingDetail) {
        res = await updateWorkScheduleDetail(editingDetail.id, values)
      } else {
        res = await createWorkScheduleDetail({ ...values, work_schedule_id: scheduleId })
      }
      if (!res.success) throw new Error(res.message)
      toast.success(editingDetail ? "Updated successfully" : "Created successfully")
      setOpen(false)
      setEditingDetail(null)
      fetchDetails()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (showId: string) => {
    try {
      setLoading(true);
      const response = await deleteWorkScheduleDetail(showId);
      if (!response.success) throw new Error(response.message);

      toast.success("Show deleted successfully");
      fetchDetails(); // refresh list
    } catch (error: any) {
      toast.error(error.message || "Failed to delete show");
    } finally {
      setLoading(false);
    }
  };


  const columns: ColumnDef<IWorkScheduleDetail>[] = [
    { accessorKey: "day_of_week", header: "Day" },
    { accessorKey: "start_time", header: "Start" },
    { accessorKey: "end_time", header: "End" },
    { accessorKey: "break_start", header: "Break Start", cell: (info) => info.getValue() ?? "-" },
    { accessorKey: "break_end", header: "Break End", cell: (info) => info.getValue() ?? "-" },
    {
      accessorKey: "is_working_day",
      header: "Working Day",
      cell: ({ row }) => (row.getValue("is_working_day") ? <Check /> : "-"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const d = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setEditingDetail(d)
                form.reset(d)
                setOpen(true)
              }}
            >
              <Pencil />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-red-500"
              onClick={() => handleDelete(d.id)}
            >
              <Trash />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <ContentLayout title="Schedule Details">

      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="">
       
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild className="float-end ml-5">
              <Button
                onClick={() => {
                  setEditingDetail(null)
                  form.reset()
                }}
              >
                Add <Plus className="ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDetail ? "Edit Detail" : "Add Detail"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="day_of_week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week (0-6)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_working_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Day</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="break_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Break Start</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="break_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Break End</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    {editingDetail ? "Update" : "Create"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <DataTable columns={columns} data={details} filterColumn="day_of_week" />
        )}
      </div>
    </ContentLayout>
  )
}
