import { useState, useEffect, useMemo } from "react";
import { useQueryState } from "nuqs";
import { parseAsString, parseAsInteger } from "nuqs";
import { Wrench, Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useCustomTools,
  type CustomToolData,
  type CustomToolInput,
} from "./hooks/use-custom-tools";
import { CustomToolFormDialog } from "./custom-tool-form-dialog";
import { useMinLoading } from "@/hooks/use-min-loading";
import { useDeferredLoading } from "@/hooks/use-deferred-loading";

export function CustomToolsPage() {
  const { tools, loading, refresh, createTool, updateTool, deleteTool } = useCustomTools();
  const spinning = useMinLoading(loading);
  const showSkeleton = useDeferredLoading(loading && tools.length === 0);

  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));

  const [formOpen, setFormOpen] = useState(false);
  const [editTool, setEditTool] = useState<CustomToolData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomToolData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return tools;
    const q = search.toLowerCase();
    return tools.filter(
      (t: CustomToolData) =>
        t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [tools, search]);

  // Reset page when search reduces results below current page
  useEffect(() => {
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    if (page > totalPages) {
      setPage(1);
    }
  }, [filtered.length, page, pageSize, setPage]);

  const start = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => filtered.slice(start, start + pageSize),
    [filtered, start, pageSize]
  );
  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
    }),
    [page, pageSize, filtered.length]
  );

  const handleCreate = async (data: CustomToolInput) => {
    await createTool(data);
  };

  const handleEdit = async (data: CustomToolInput) => {
    if (!editTool) return;
    await updateTool(editTool.id, data);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTool(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Custom Tools"
        description="Manage custom shell-based tools for agents"
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setEditTool(null);
                setFormOpen(true);
              }}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Create Tool
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={spinning}
              className="gap-1"
            >
              <RefreshCw className={"h-3.5 w-3.5" + (spinning ? " animate-spin" : "")} /> Refresh
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tools..."
          className="max-w-sm"
        />
      </div>

      <div className="mt-4">
        {showSkeleton ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={search ? "No matching tools" : "No custom tools"}
            description={
              search
                ? "Try a different search term."
                : "Create your first custom tool to get started."
            }
          />
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Scope</th>
                  <th className="px-4 py-3 text-left font-medium">Enabled</th>
                  <th className="px-4 py-3 text-left font-medium">Timeout</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((tool) => (
                  <tr key={tool.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tool.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tool.description || "No description"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tool.agent_id ? "secondary" : "outline"}>
                        {tool.agent_id ? "Agent" : "Global"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tool.enabled ? "default" : "secondary"}>
                        {tool.enabled ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{tool.timeout_seconds}s</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditTool(tool);
                            setFormOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(tool)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      <CustomToolFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tool={editTool}
        onSubmit={editTool ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Custom Tool"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
