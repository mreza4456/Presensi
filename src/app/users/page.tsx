"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Check, X, Edit, Trash, PlusCircleIcon, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteUsers, getAllUsers, assignUserRole, removeUserRole } from "@/action/users"
import React from "react"
import { IUser } from "@/interface"
import { toast } from "sonner"
import LoadingSkeleton from "@/components/loading-skeleton"
import { useRouter } from "next/navigation"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

export default function UsersPage() {
    const [Users, setUsers] = React.useState<IUser[]>([])
    const [loading, setLoading] = React.useState<boolean>(true)
    const [openModal, setOpenModal] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<IUser | null>(null)
    const [selectedRole, setSelectedRole] = React.useState("")
    const [roles, setRoles] = React.useState<{ id: string; name: string }[]>([])
    const router = useRouter()

    const fetchData = async () => {
        try {
            setLoading(true)
            const response: any = await getAllUsers()
            if (!response.success) throw new Error(response.message)
            setUsers(response.data)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this User?")) return

        const res = await deleteUsers(id)
        if (res.success) {
            toast.success("Users deleted successfully")
            setUsers((prev) => prev.filter((m) => m.id !== id))
        } else {
            toast.error(res.message)
        }
    }

    async function openAddRoleModal(user: IUser) {
        setSelectedUser(user)
        setSelectedRole("")
        setOpenModal(true)

        // fetch daftar role dari system_roles
        const res = await fetch("/api/system_roles") // nanti ganti dengan action getAllRoles
        const data = await res.json()
        setRoles(data)
    }

    async function handleAssignRole() {
        if (!selectedUser || !selectedRole) {
            toast.error("Pilih role terlebih dahulu")
            return
        }

        const res = await assignUserRole(selectedUser.id, selectedRole)
        if (res.success) {
            toast.success(res.message)

            // update state Users
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === selectedUser.id
                        ? {
                            ...u,
                            roles: [...(u.roles || []), roles.find((r) => r.id === selectedRole)!],
                        }
                        : u
                )
            )

            setOpenModal(false)
        } else {
            toast.error(res.message)
        }
    }

    // --- definisi kolom ---
    const columns: ColumnDef<IUser>[] = [
        {
            accessorKey: "first_name",
            header: "First Name",
        },
        {
            accessorKey: "last_name",
            header: "Last Name",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "gender",
            header: "Gender",
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const active = row.getValue("is_active") as boolean
                return active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" /> Active
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-300 text-black">
                        <X className="w-3 h-3 mr-1" /> Inactive
                    </span>
                )
            },
        },
        {
            accessorKey: "roles",
            header: "Role",
            cell: ({ row }) => {
                const user = row.original
                const roles = user.roles || []

                if (roles.length > 0) {
                    return (
                        <div className="flex flex-wrap gap-2">
                            {roles.map((r) => (
                                <div
                                    key={r.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500 text-white"
                                >
                                    {r.name}
                                    <button
                                        onClick={async () => {
                                            const res = await removeUserRole(user.id, r.id)
                                            if (res.success) {
                                                toast.success(res.message)
                                                // update state Users
                                                setUsers((prev) =>
                                                    prev.map((u) =>
                                                        u.id === user.id
                                                            ? { ...u, roles: u.roles?.filter((rr) => rr.id !== r.id) }
                                                            : u
                                                    )
                                                )
                                            } else {
                                                toast.error(res.message)
                                            }
                                        }}
                                    >
                                        <XCircle className="h-3 w-3 text-white hover:text-red-300" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                }

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddRoleModal(user)}
                        className="flex items-center gap-1 text-blue-600"
                    >
                        <PlusCircleIcon className="h-4 w-4" /> Tambahkan Role
                    </Button>
                )
            },
        },


{
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const member = row.original
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/users/edit/${member.id}`)}
                            className="cursor-pointer bg-secondary border-0 shadow-0 p-0 m-0"
                        >
                            <Edit />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 cursor-pointer bg-secondary border-0  p-0 m-0 "
                            onClick={() => handleDelete(member.id!)}
                        >
                            <Trash />
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <ContentLayout title="Users">
            <div className="w-full max-w-6xl mx-auto">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <DataTable columns={columns} data={Users} filterColumn="first_name" />
                )}
            </div>

            {/* Modal Tambah Role */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambahkan Role untuk {selectedUser?.first_name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <select
                            className="w-full border rounded p-2"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">-- Pilih Role --</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAssignRole}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentLayout>
    )
}
