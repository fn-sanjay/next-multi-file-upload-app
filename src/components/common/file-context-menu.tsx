"use client";

import { useEffect, useState, ReactNode } from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "@/components/ui/context-menu"

import {
  Download,
  Pencil,
  Trash2,
  Star,
  FolderInput,
  Info,
  FolderOpen,
  RotateCcw
} from "lucide-react"
import { Copy } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FolderTree {
  id: string
  name: string
  children?: FolderTree[]
}

interface Props {

  children: ReactNode

  type?: "file" | "folder"
  id?: string
  name?: string

  // legacy props still used across existing views
  fileType?: string
  fileId?: string
  fileName?: string

  currentFolderId?: string | null

  onViewDetails?: () => void

  refresh?: () => void

  onRename?: () => void
  onDownload?: () => void
  onCopyLink?: () => void
  onShare?: () => void
  onAddToFavorites?: () => void | Promise<void>
  favoriteLabel?: string
  onMoveToArchive?: () => void
  onMoveToTrash?: () => void
  inTrash?: boolean
  onRestore?: () => void | Promise<void>
  onDeletePermanently?: () => void | Promise<void>

}

export function FileContextMenu({

  children,
  type,
  id,
  name,
  fileType,
  fileId,
  fileName,
  currentFolderId,
  onViewDetails,
  refresh,
  onRename,
  onDownload,
  onAddToFavorites,
  favoriteLabel,
  onMoveToTrash,
  inTrash,
  onRestore,
  onDeletePermanently

}: Props) {

  const asNonEmptyString = (value: unknown): string | null =>
    typeof value === "string" && value.length > 0 ? value : null

  const normalizedType: "file" | "folder" = (() => {
    if (type) return type
    const value = fileType?.toLowerCase()
    return value === "folder" ? "folder" : "file"
  })()

  const itemId =
    asNonEmptyString(id) ??
    asNonEmptyString(fileId) ??
    asNonEmptyString(currentFolderId) ??
    null
  const itemName = name ?? fileName ?? "Untitled"
  const typeLabel = normalizedType === "folder" ? "FOLDER" : "FILE"

  const [folders, setFolders] = useState<FolderTree[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(itemName)

  useEffect(() => {
    setRenameValue(itemName)
  }, [itemName])


  // --------------------------------
  // fetch folder tree
  // --------------------------------

  const fetchFolders = async () => {

    try {

      setLoadingFolders(true)

      const res = await fetch("/api/user/folders/tree")

      const data = await res.json()

      setFolders(data.folders || [])

    } catch (err) {

      console.error(err)

    } finally {

      setLoadingFolders(false)

    }

  }


  // --------------------------------
  // rename
  // --------------------------------

  const renameItem = async () => {
  try {

    if (!renameValue.trim()) return

    if (type === "file") {

      await fetch(`/api/user/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: renameValue
        })
      })

    } else {

      await fetch(`/api/user/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: renameValue
        })
      })

    }

    setRenameOpen(false)

    refresh?.()

  } catch (err) {

    console.error("rename failed", err)

  }
}


  // --------------------------------
  // move
  // --------------------------------

  const moveToFolder = async (folderId: string) => {

  if (folderId === currentFolderId) return

  try {

    if (type === "file") {

      await fetch("/api/user/files/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "move",
          destinationFolderId: folderId,
          files: [id]
        })
      })

    } else {

      await fetch(`/api/user/folders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          parentId: folderId
        })
      })

    }

    refresh?.()

  } catch (err) {

    console.error("move failed", err)

  }

}


  // --------------------------------
  // copy (files and folders)
  // --------------------------------

  const copyToFolder = async (folderId: string) => {

    if (!id) return

    try {
      await fetch("/api/user/files/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "copy",
          destinationFolderId: folderId,
          files: normalizedType === "file" ? [id] : [],
          folders: normalizedType === "folder" ? [id] : []
        })
      })

      refresh?.()
    } catch (err) {
      console.error("copy failed", err)
    }

  }


  // --------------------------------
  // trash
  // --------------------------------

  const moveToTrash = async () => {

    if (onMoveToTrash && !itemId) {
      onMoveToTrash()
      return
    }

    if (!itemId) return

    const url =
      normalizedType === "file"
        ? `/api/user/files/${itemId}/trash`
        : `/api/user/folders/${itemId}/trash`

    await fetch(url, { method: "POST" })

    refresh?.()

  }


  // --------------------------------
  // favorite
  // --------------------------------

  const favorite = async () => {

    if (onAddToFavorites) {
      await onAddToFavorites()
      return
    }

    if (!itemId) return

    const url =
      normalizedType === "file"
        ? `/api/user/files/${itemId}/favorite`
        : `/api/user/folders/${itemId}/favorite`

    await fetch(url, {
      method: "POST"
    })

    refresh?.()

  }


  // --------------------------------
  // restore
  // --------------------------------

  const restore = async () => {

    if (onRestore) {
      await onRestore()
      return
    }

    if (!itemId) return

    if (normalizedType === "file") {
      await fetch(`/api/user/files/${itemId}/trash`, { method: "DELETE" })
    } else {
      await fetch(`/api/user/folders/${itemId}/restore`, { method: "POST" })
    }

    refresh?.()

  }


  // --------------------------------
  // permanent delete
  // --------------------------------

  const deletePermanently = async () => {

    if (onDeletePermanently) {
      await onDeletePermanently()
      return
    }

    if (!itemId) return

    const url =
      normalizedType === "file"
        ? `/api/user/files/${itemId}`
        : `/api/user/folders/${itemId}`

    await fetch(url, { method: "DELETE" })

    refresh?.()

  }


  // --------------------------------
  // download (files only)
  // --------------------------------

  const download = () => {

    if (normalizedType !== "file") return

    if (onDownload && !itemId) {
      onDownload()
      return
    }

    if (!itemId) return

    window.open(`/api/user/files/${itemId}/download`, "_blank")

  }


  // --------------------------------
  // recursive folder render
  // --------------------------------

  const renderFolders = (
    list: FolderTree[],
    onSelect: (id: string) => void,
    level = 0
  ): ReactNode => {

    return list.map(folder => (

      <div key={folder.id}>

        <ContextMenuItem
          onClick={() => onSelect(folder.id)}
          className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5"
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >

          <FolderOpen className="w-4 h-4" />

          {folder.name}

        </ContextMenuItem>

        {folder.children?.length
          ? renderFolders(folder.children, onSelect, level + 1)
          : null}

      </div>

    ))

  }


  // --------------------------------
  // UI
  // --------------------------------

  return (

    <>

      <ContextMenu>

        <ContextMenuTrigger asChild>

          {children}

        </ContextMenuTrigger>


        <ContextMenuContent className="w-64 bg-card border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 font-sans">


          {/* header */}

          <div className="px-3 py-2 mb-1">

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic truncate">

              {typeLabel}

            </p>

            <p className="text-sm font-black text-white truncate">

              {itemName}

            </p>

          </div>


          <div className="h-px bg-white/5 mx-1 mb-1" />


          {/* view */}

          {onViewDetails && (
            <ContextMenuItem
              onClick={onViewDetails}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5"
            >

              <div className="p-1.5 rounded-lg bg-white/5">

                <Info className="w-3.5 h-3.5" />

              </div>

              View Details

            </ContextMenuItem>
          )}


          {/* rename */}

          {!inTrash && (
            <ContextMenuItem
              onClick={() => {
                if (!itemId && onRename) {
                  onRename()
                  return
                }
                setRenameOpen(true)
              }}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5"
            >

              <div className="p-1.5 rounded-lg bg-white/5">

                <Pencil className="w-3.5 h-3.5" />

              </div>

              Rename

            </ContextMenuItem>
          )}


          {/* download */}

          {normalizedType === "file" && (

            <ContextMenuItem
              onClick={download}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5"
            >

              <div className="p-1.5 rounded-lg bg-white/5">

                <Download className="w-3.5 h-3.5" />

              </div>

              Download

            </ContextMenuItem>

          )}


          {!inTrash && <div className="h-px bg-white/5 mx-1 my-1" />}


          {/* favorite */}

          {!inTrash && (
            <ContextMenuItem
              onClick={favorite}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5"
            >

              <div className="p-1.5 rounded-lg bg-white/5">

                <Star className="w-3.5 h-3.5" />

              </div>

              {favoriteLabel ?? "Add to Favorites"}

            </ContextMenuItem>
          )}


          {/* move */}

          {!inTrash && (
            <ContextMenuSub>

              <ContextMenuSubTrigger
                onMouseEnter={() => folders.length === 0 && fetchFolders()}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5"
              >

                <div className="p-1.5 rounded-lg bg-white/5">

                  <FolderInput className="w-3.5 h-3.5" />

                </div>

                Move to

              </ContextMenuSubTrigger>


              <ContextMenuSubContent className="w-52 bg-card border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-1.5 font-sans">

                {loadingFolders
                  ? <ContextMenuItem className="text-zinc-500">Loading...</ContextMenuItem>
                  : renderFolders(folders, moveToFolder)
                }

              </ContextMenuSubContent>

            </ContextMenuSub>
          )}

          {/* copy */}

          {!inTrash && (
            <ContextMenuSub>

              <ContextMenuSubTrigger
                onMouseEnter={() => folders.length === 0 && fetchFolders()}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5"
              >

                <div className="p-1.5 rounded-lg bg-white/5">

                  <Copy className="w-3.5 h-3.5" />

                </div>

                Copy to

              </ContextMenuSubTrigger>


              <ContextMenuSubContent className="w-52 bg-card border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-1.5 font-sans">

                {loadingFolders
                  ? <ContextMenuItem className="text-zinc-500">Loading...</ContextMenuItem>
                  : renderFolders(folders, copyToFolder)
                }

              </ContextMenuSubContent>

            </ContextMenuSub>
          )}


          <div className="h-px bg-white/5 mx-1 my-1" />


          {/* trash actions */}

          {inTrash ? (
            <>
              <ContextMenuItem
                onClick={restore}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
              >

                <div className="p-1.5 rounded-lg bg-emerald-500/5">

                  <RotateCcw className="w-3.5 h-3.5" />

                </div>

                Restore

              </ContextMenuItem>

              <ContextMenuItem
                onClick={deletePermanently}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-rose-500 hover:bg-rose-500/10"
              >

                <div className="p-1.5 rounded-lg bg-rose-500/5">

                  <Trash2 className="w-3.5 h-3.5" />

                </div>

                Delete Permanently

              </ContextMenuItem>
            </>
          ) : (
            <ContextMenuItem
              onClick={moveToTrash}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-rose-500 hover:bg-rose-500/10"
            >

              <div className="p-1.5 rounded-lg bg-rose-500/5">

                <Trash2 className="w-3.5 h-3.5" />

              </div>

              Move to Trash

            </ContextMenuItem>
          )}


        </ContextMenuContent>

      </ContextMenu>


      {/* rename modal */}

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>

        <DialogContent className="sm:max-w-100">

          <DialogHeader>

            <DialogTitle>Rename</DialogTitle>

          </DialogHeader>

          <div className="space-y-4">

            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />

            <Button onClick={renameItem} className="w-full">

              Rename

            </Button>

          </div>

        </DialogContent>

      </Dialog>

    </>

  )

}
