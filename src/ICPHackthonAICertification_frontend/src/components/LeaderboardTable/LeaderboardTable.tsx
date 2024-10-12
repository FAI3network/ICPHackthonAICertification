import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import "./leaderboardTable.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import { Model, LeaderboardTableProps } from "./types";


export default function LeaderboardTable({ models }: LeaderboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Model>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2" size={16} />
        </button>
      ),
      cell: ({ row }) => (
        <Link to={`/model/${row.original.id}`} className="modelName">
          {row.original.data.name}
        </Link>
      ),
    },
    {
      accessorKey: "SPD",
      header: ({ column }) => (
        <button
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statistical Parity Difference
          <ArrowUpDown className="ml-2" size={16} />
        </button>
      ),
      cell: ({ row }) => {
        const metrics = row.original.metrics;
        const badgeClass = getStatusBadgeClass(metrics[0], 0.1, 0.4);
        return (
          <div className={`status-badge ${badgeClass}`}>
            {Number(metrics[0]).toFixed(3)}
          </div>
        );
      },
    },
    {
      accessorKey: "DI",
      header: ({ column }) => (
        <button
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Disparate Impact
          <ArrowUpDown className="ml-2" size={16} />
        </button>
      ),
      cell: ({ row }) => {
        const metrics = row.original.metrics;
        const badgeClass = getStatusBadgeClass(metrics[1], 0.8, 1.25);
        return (
          <div className={`status-badge ${badgeClass}`}>
            {Number(metrics[1]).toFixed(3)}
          </div>
        );
      },
    },
    {
      accessorKey: "AOD",
      header: ({ column }) => (
        <button
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Average Odds Difference
          <ArrowUpDown className="ml-2" size={16} />
        </button>
      ),
      cell: ({ row }) => {
        const metrics = row.original.metrics;
        const badgeClass = getStatusBadgeClass(metrics[2], 0.1, 0.2);
        return (
          <div className={`status-badge ${badgeClass}`}>
            {Number(metrics[2]).toFixed(3)}
          </div>
        );
      },
    },
    {
      accessorKey: "EOD",
      header: ({ column }) => (
        <button
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Equal Opportunity Difference
          <ArrowUpDown className="ml-2" size={16} />
        </button>
      ),
      cell: ({ row }) => {
        const metrics = row.original.metrics;
        const badgeClass = getStatusBadgeClass(metrics[3], 0.1, 0.2);
        return (
          <div className={`status-badge ${badgeClass}`}>
            {Number(metrics[3]).toFixed(3)}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: models,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="table-container">
      {models && (
        <>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search your favorite model..."
              value={String(table.getColumn("name")?.getFilterValue() ?? "")}
              onChange={(event) => {
                table.getColumn("name")?.setFilterValue(event.target.value);
              }}
              className="search-bar"
            />
            <Dropdown table={table} />
          </div>
          <div>
            <table className="table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    <th>#</th>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className={row.getIsSelected() ? "selected" : ""}>
                      <td>{row.index + 1}</td>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function getStatusBadgeClass(value: number, lowThreshold: number, highThreshold: number): string {
  if (value >= -lowThreshold && value <= lowThreshold) {
    return "status-badge-green";
  } else if (value > highThreshold || value < -highThreshold) {
    return "status-badge-red";
  } else {
    return "status-badge-yellow";
  }
}
