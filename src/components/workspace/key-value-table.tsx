"use client"

import { useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import type { KeyValuePair } from "@/lib/store/request-store"

interface KeyValueTableProps {
  items: KeyValuePair[]
  onAdd: () => void
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void
  onRemove: (id: string) => void
}

export function KeyValueTable({ items, onAdd, onUpdate, onRemove }: KeyValueTableProps) {
  
  // Auto-add an empty row if the last one is not empty
  useEffect(() => {
    const last = items[items.length - 1]
    if (!last || last.key !== "" || last.value !== "") {
      onAdd()
    }
  }, [items, onAdd])

  return (
    <div className="w-full">
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] border-b text-sm font-medium text-muted-foreground bg-muted/50">
        <div className="p-2 flex items-center justify-center"></div>
        <div className="p-2 border-l">Key</div>
        <div className="p-2 border-l">Value</div>
        <div className="p-2 border-l">Description</div>
        <div className="p-2 border-l"></div>
      </div>
      
      {items.map((item, i) => (
        <div key={item.id} className="grid grid-cols-[40px_1fr_1fr_1fr_40px] border-b text-sm group hover:bg-muted/20">
          <div className="p-2 flex items-center justify-center">
            <Checkbox 
              checked={item.enabled}
              onCheckedChange={(c) => onUpdate(item.id, "enabled", !!c)}
            />
          </div>
          <div className="border-l">
            <input
              className="w-full h-full p-2 bg-transparent outline-none font-mono"
              placeholder="Key"
              value={item.key}
              onChange={(e) => onUpdate(item.id, "key", e.target.value)}
            />
          </div>
          <div className="border-l">
            <input
              className="w-full h-full p-2 bg-transparent outline-none font-mono"
              placeholder="Value"
              value={item.value}
              onChange={(e) => onUpdate(item.id, "value", e.target.value)}
            />
          </div>
          <div className="border-l">
            <input
              className="w-full h-full p-2 bg-transparent outline-none"
              placeholder="Description"
              value={item.description || ""}
              onChange={(e) => onUpdate(item.id, "description", e.target.value)}
            />
          </div>
          <div className="border-l flex items-center justify-center">
            {i !== items.length - 1 && (
              <button 
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
