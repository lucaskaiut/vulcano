import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useLocation } from 'react-router-dom'

export const MOBILE_NAV_SHEET_ANIMATION_MS = 320
const SNAP_RATIO = 0.35
const DRAG_COMMIT_PX = 10

type DragMode = 'open' | 'close'

type DragState = {
  pointerId: number
  startY: number
  startTranslateY: number
  mode: DragMode
  committed: boolean
}

export function useMobileNavSheet() {
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const sheetHeightRef = useRef(0)
  const translateYRef = useRef(0)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathnameRef = useRef(pathname)

  translateYRef.current = translateY

  const measureSheet = useCallback(() => {
    if (sheetRef.current) {
      sheetHeightRef.current = sheetRef.current.offsetHeight
    }
  }, [])

  const getSheetHeight = useCallback(() => {
    if (sheetHeightRef.current > 0) {
      return sheetHeightRef.current
    }

    return window.innerHeight * 0.85
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const animateTo = useCallback((targetY: number, onComplete?: () => void) => {
    setIsDragging(false)
    setTranslateY(targetY)

    if (!onComplete) {
      return
    }

    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      onComplete()
    }, MOBILE_NAV_SHEET_ANIMATION_MS)
  }, [clearCloseTimer])

  const open = useCallback(() => {
    clearCloseTimer()
    setIsOpen(true)
    setIsVisible(true)

    const height = getSheetHeight()
    setTranslateY(height)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measureSheet()
        setTranslateY(0)
      })
    })
  }, [clearCloseTimer, getSheetHeight, measureSheet])

  const close = useCallback(() => {
    setIsOpen(false)
    animateTo(getSheetHeight(), () => {
      setIsVisible(false)
      setTranslateY(0)
    })
  }, [animateTo, getSheetHeight])

  const closeImmediately = useCallback(() => {
    clearCloseTimer()
    setIsOpen(false)
    setIsVisible(false)
    setTranslateY(0)
    setIsDragging(false)
    suppressClickRef.current = false
    dragRef.current = null
  }, [clearCloseTimer])

  useLayoutEffect(() => {
    if (!isVisible) {
      return
    }

    measureSheet()
  }, [isVisible, measureSheet])

  useEffect(() => {
    return () => clearCloseTimer()
  }, [clearCloseTimer])

  useEffect(() => {
    if (pathnameRef.current === pathname) {
      return
    }

    pathnameRef.current = pathname
    suppressClickRef.current = false
    closeImmediately()
  }, [pathname, closeImmediately])

  const finishOpenDrag = useCallback(
    (target: EventTarget & Element, pointerId: number) => {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId)
      }

      setIsDragging(false)

      const height = getSheetHeight()
      const shouldOpen = translateYRef.current < height * (1 - SNAP_RATIO)

      if (shouldOpen) {
        setIsOpen(true)
        animateTo(0)
      } else {
        animateTo(height, () => {
          setIsVisible(false)
          setTranslateY(0)
        })
      }

      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    },
    [animateTo, getSheetHeight],
  )

  const finishCloseDrag = useCallback(
    (target: EventTarget & Element, pointerId: number) => {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId)
      }

      setIsDragging(false)

      const height = getSheetHeight()
      const shouldClose = translateYRef.current > height * SNAP_RATIO

      if (shouldClose) {
        setIsOpen(false)
        animateTo(height, () => {
          setIsVisible(false)
          setTranslateY(0)
        })
      } else {
        animateTo(0)
      }
    },
    [animateTo, getSheetHeight],
  )

  const onOpenPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (isOpen) {
        return
      }

      dragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startTranslateY: getSheetHeight(),
        mode: 'open',
        committed: false,
      }
    },
    [getSheetHeight, isOpen],
  )

  const onOpenPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current

      if (!drag || drag.mode !== 'open') {
        return
      }

      const deltaY = event.clientY - drag.startY

      if (!drag.committed) {
        if (deltaY >= -DRAG_COMMIT_PX) {
          return
        }

        drag.committed = true
        setIsDragging(true)
        setIsVisible(true)
        suppressClickRef.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        measureSheet()
        drag.startTranslateY = getSheetHeight()
        drag.startY = event.clientY
      }

      const nextY = Math.max(0, Math.min(drag.startTranslateY + (event.clientY - drag.startY), getSheetHeight()))
      setTranslateY(nextY)
    },
    [getSheetHeight, measureSheet],
  )

  const onOpenPointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current

      if (!drag || drag.mode !== 'open') {
        return
      }

      dragRef.current = null

      if (!drag.committed) {
        return
      }

      finishOpenDrag(event.currentTarget, event.pointerId)
    },
    [finishOpenDrag],
  )

  const onOpenPointerCancel = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current

      if (!drag || drag.mode !== 'open' || !drag.committed) {
        dragRef.current = null
        return
      }

      dragRef.current = null
      finishOpenDrag(event.currentTarget, event.pointerId)
    },
    [finishOpenDrag],
  )

  const onClosePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (!isOpen) {
        return
      }

      dragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startTranslateY: translateYRef.current,
        mode: 'close',
        committed: false,
      }
    },
    [isOpen],
  )

  const onClosePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current

      if (!drag || drag.mode !== 'close') {
        return
      }

      const deltaY = event.clientY - drag.startY

      if (!drag.committed) {
        if (deltaY <= DRAG_COMMIT_PX) {
          return
        }

        drag.committed = true
        setIsDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
        measureSheet()
        drag.startTranslateY = translateYRef.current
        drag.startY = event.clientY
      }

      const height = getSheetHeight()
      const nextY = Math.max(0, Math.min(drag.startTranslateY + (event.clientY - drag.startY), height))
      setTranslateY(nextY)
    },
    [getSheetHeight, measureSheet],
  )

  const onClosePointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current

      if (!drag || drag.mode !== 'close') {
        return
      }

      dragRef.current = null

      if (!drag.committed) {
        return
      }

      finishCloseDrag(event.currentTarget, event.pointerId)
    },
    [finishCloseDrag],
  )

  const onClosePointerCancel = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current

      if (!drag || drag.mode !== 'close' || !drag.committed) {
        dragRef.current = null
        return
      }

      dragRef.current = null
      finishCloseDrag(event.currentTarget, event.pointerId)
    },
    [finishCloseDrag],
  )

  const onNavClickCapture = useCallback((event: React.MouseEvent) => {
    if (!suppressClickRef.current) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
  }, [])

  const sheetHeight = getSheetHeight()
  const openProgress = sheetHeight > 0 ? 1 - translateY / sheetHeight : isOpen ? 1 : 0

  return {
    isOpen,
    isVisible,
    translateY,
    isDragging,
    openProgress,
    sheetRef,
    open,
    close,
    closeImmediately,
    openDragHandlers: {
      onPointerDown: onOpenPointerDown,
      onPointerMove: onOpenPointerMove,
      onPointerUp: onOpenPointerUp,
      onPointerCancel: onOpenPointerCancel,
      onClickCapture: onNavClickCapture,
    },
    closeDragHandlers: {
      onPointerDown: onClosePointerDown,
      onPointerMove: onClosePointerMove,
      onPointerUp: onClosePointerUp,
      onPointerCancel: onClosePointerCancel,
    },
  }
}
