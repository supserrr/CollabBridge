"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconEye, IconEdit, IconTrash, IconDots } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const recentProjects = [
  {
    id: "PRJ-001",
    client: "John & Sarah Smith",
    project: "Wedding Photography",
    status: "In Progress",
    amount: "$2,500",
    date: "2024-01-15",
    avatar: "/avatars/01.png",
  },
  {
    id: "PRJ-002", 
    client: "TechCorp Inc.",
    project: "Corporate Headshots",
    status: "Completed",
    amount: "$1,200",
    date: "2024-01-10",
    avatar: "/avatars/02.png",
  },
  {
    id: "PRJ-003",
    client: "Emily Johnson",
    project: "Family Portraits",
    status: "Pending",
    amount: "$800",
    date: "2024-01-08",
    avatar: "/avatars/03.png",
  },
  {
    id: "PRJ-004",
    client: "Mike Wilson",
    project: "Product Photography",
    status: "In Progress",
    amount: "$1,500",
    date: "2024-01-05",
    avatar: "/avatars/04.png",
  },
  {
    id: "PRJ-005",
    client: "Anna Davis",
    project: "Portrait Session",
    status: "Completed",
    amount: "$600",
    date: "2024-01-03",
    avatar: "/avatars/05.png",
  },
]

export function DashboardDataTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of your recent projects and clients.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={project.avatar} />
                    <AvatarFallback>
                      {project.client.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{project.client}</div>
                    <div className="text-sm text-muted-foreground">{project.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{project.project}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    project.status === "Completed" ? "default" :
                    project.status === "In Progress" ? "secondary" :
                    "outline"
                  }
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{project.amount}</TableCell>
              <TableCell>{project.date}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <IconDots className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <IconEye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconEdit className="mr-2 h-4 w-4" />
                      Edit project
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
