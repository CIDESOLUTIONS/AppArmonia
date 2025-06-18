import * as React from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Select } from "./select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T | string
  title: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  actions?: React.ReactNode
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Buscar...",
  onSearch,
  pagination,
  onPageChange,
  onLimitChange,
  actions,
  className,
  emptyMessage = "No hay datos disponibles"
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const getValue = (item: T, key: string): any => {
    return key.split('.').reduce((obj, k) => obj?.[k], item)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        )}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Cargando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.render 
                        ? column.render(item)
                        : getValue(item, column.key as string)
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              options={[
                { value: "10", label: "10 por página" },
                { value: "20", label: "20 por página" },
                { value: "50", label: "50 por página" }
              ]}
              value={pagination.limit.toString()}
              onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
              className="w-40"
            />
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-3 py-1 text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
