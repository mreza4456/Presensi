import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  List,
  Building2,
  UserCheck,
  Group,
  Calendar,
  ClipboardCheck,
  ShieldCheck,
  User2,
  Armchair,
  Building
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
  permission?: string;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },

    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/organization",
          label: "Organization",
          icon: Building2,
          permission: "view_organization"
        },

        {
          href: "/members",
          label: "Member",
          icon: UserCheck,
          permission: "view_member",
        },
        {
          href: "/department",
          label: "Department",
          icon: Building,
          permission: "view_department",
        },
        {
          href: "/position",
          label: "Position",
          icon: Armchair,
          permission: "view_member",
        },
        {
          href: "/attendance",
          label: "Attendance",
          icon: ClipboardCheck,
          permission: "view_attendance",
        },

      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users,
          permission: "view_user"
        },
        {
          href: "/schedule",
          label: "Schedule",
          icon: Calendar,
          permission: "view_schedule",
        },
        {
          href: "/role",
          label: "Role",
          icon: ShieldCheck,
          permission: "view_role",
        },
        {
          href: "/permission",
          label: "Permission",
          icon: List,
          permission: "view_permission",
        }
      ]
    }
  ];
}
