"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react"

type Props = {
  file: string
  title: string
}

export function TecxbookViewer({ file, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "relative h-screen w-screen bg-background"
          : "relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      }
    >
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in new tab"
          title="Open in new tab"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/90 backdrop-blur hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/90 backdrop-blur hover:bg-muted"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <iframe
        src={file}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-popups"
        allowFullScreen
        className={
          isFullscreen
            ? "block h-full w-full border-0"
            : "block h-[80vh] w-full border-0"
        }
      />
    </div>
  )
}
