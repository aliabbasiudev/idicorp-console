import { useCallback, useEffect, useRef, useState } from 'react'

// Validates the first message of a service WebSocket: {"type":"ready"} or {"error":"..."}.
export function checkReadyMessage(raw, errorMessages = {}) {
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, message: 'Unexpected response from the service.' }
  }
  if (data?.type === 'ready') return { ok: true }
  if (data?.error) return { ok: false, message: errorMessages[data.error] ?? String(data.error) }
  return { ok: false, message: 'Unexpected response from the service.' }
}

function closeQuietly(ws) {
  if (!ws) return
  ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null
  try {
    ws.close(1000)
  } catch {
    /* already closed */
  }
}

/**
 * Generic WebSocket hook.
 * status: idle | connecting | open (handshake pending) | ready | closed | error
 * The first message after opening is passed to `checkHandshake`; later ones to `onMessage`.
 */
export function useSocket({ url, onOpen, checkHandshake, onMessage }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const readyRef = useRef(false)
  const handlersRef = useRef({})

  useEffect(() => {
    handlersRef.current = { onOpen, checkHandshake, onMessage }
  })

  const connect = useCallback(() => {
    closeQuietly(wsRef.current)
    wsRef.current = null
    readyRef.current = false
    setError(null)
    setStatus('connecting')

    let ws
    try {
      ws = new WebSocket(url)
    } catch {
      setError('Invalid WebSocket address.')
      setStatus('error')
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      if (wsRef.current !== ws) return
      setStatus('open')
      handlersRef.current.onOpen?.(ws)
    }

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return
      if (!readyRef.current) {
        const result = handlersRef.current.checkHandshake(event.data)
        if (result.ok) {
          readyRef.current = true
          setStatus('ready')
        } else {
          setError(result.message)
          setStatus('error')
          closeQuietly(ws)
          wsRef.current = null
        }
        return
      }
      handlersRef.current.onMessage?.(event.data)
    }

    ws.onerror = () => {
      if (wsRef.current !== ws) return
      setError((prev) => prev ?? 'Connection error. The service may be unreachable.')
      setStatus('error')
    }

    ws.onclose = (event) => {
      if (wsRef.current !== ws) return
      wsRef.current = null
      if (readyRef.current) {
        setStatus('closed')
      } else {
        setError(
          (prev) => prev ?? `The connection closed before it was ready (code ${event.code}).`,
        )
        setStatus('error')
      }
    }
  }, [url])

  const disconnect = useCallback(() => {
    closeQuietly(wsRef.current)
    wsRef.current = null
    readyRef.current = false
    setStatus('closed')
  }, [])

  const send = useCallback((data) => {
    const ws = wsRef.current
    if (!ws || !readyRef.current || ws.readyState !== WebSocket.OPEN) return false
    ws.send(data)
    return true
  }, [])

  useEffect(() => {
    // Opening the socket synchronises with an external system, so the state updates are intended.
    // oxlint-disable-next-line react/set-state-in-effect
    connect()
    return () => {
      closeQuietly(wsRef.current)
      wsRef.current = null
    }
  }, [connect])

  return { status, error, connect, disconnect, send }
}
