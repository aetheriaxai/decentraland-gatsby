import { useCallback, useEffect, useMemo, useState } from 'react'

import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { connection } from 'decentraland-connect/dist/ConnectionManager'

import logger from '../entities/Development/logger'
import { clearIdentity, setCurrentIdentity } from '../utils/auth/storage'
import rollbar from '../utils/development/rollbar'
import segment from '../utils/development/segment'
import sentry from '../utils/development/sentry'
import useAsyncTask from './useAsyncTask'
import {
  AuthEvent,
  AuthState,
  AuthStatus,
  createConnection,
  initialState,
  isLoading,
  restoreConnection,
  switchToChainId,
} from './useAuth.utils'

import type { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

export { initialState }

let CONNECTION_PROMISE: Promise<AuthState> | null = null

export default function useAuth() {
  const [state, setState] = useState<AuthState>({ ...initialState })

  const select = useCallback(
    (selecting = true) => {
      if (isLoading(state.status)) {
        return
      }

      if (selecting === state.selecting) {
        return
      }

      setState((current) => ({ ...current, selecting }))
    },
    [state]
  )

  const connect = useCallback(
    (providerType: ProviderType, chainId: ChainId) => {
      if (isLoading(state.status)) {
        return
      }

      if (state.account) {
        console.warn(`Already connected as "${state.account}"`)
        return
      }

      const conn = { providerType: providerType, chainId: chainId }
      if (!providerType || !chainId) {
        const message = `Invalid connection params: ${JSON.stringify(conn)}`
        console.error(message)
        rollbar((rollbar) => rollbar.error(message))
        sentry((sentry) => sentry.captureMessage(message, 'error'))
        segment((analytics) =>
          analytics.track('error', {
            message,
            conn,
          })
        )
        return
      }

      segment((analytics, context) =>
        analytics.track(AuthEvent.Connect, { ...context, ...conn })
      )

      setState({
        account: null,
        identity: null,
        provider: null,
        error: null,
        selecting: state.selecting,
        status: AuthStatus.Connecting,
        providerType,
        chainId,
      })
    },
    [state]
  )

  const disconnect = useCallback(
    (signOut?: boolean) => {
      if (isLoading(state.status)) {
        return
      }

      if (!state.account) {
        return
      }

      if (signOut) {
        clearIdentity()
      }

      setState({
        status: AuthStatus.Disconnecting,
        account: null,
        identity: null,
        provider: null,
        error: null,
        selecting: false,
        providerType: null,
        chainId: null,
      })
    },
    [state]
  )

  const disconnectAndSignOut = useCallback(() => disconnect(true), [disconnect])

  const [switching, switchTo] = useAsyncTask(
    async (chainId: ChainId) => {
      if (state.providerType === ProviderType.INJECTED) {
        try {
          await switchToChainId(state.provider, chainId)
        } catch (err) {
          setState({ ...state, error: err.message })
        }
      }
    },
    [state]
  )

  // connect or disconnect
  useEffect(() => {
    let cancelled = false

    if (state.status === AuthStatus.Restoring) {
      if (!CONNECTION_PROMISE) {
        CONNECTION_PROMISE = restoreConnection()
      }

      Promise.resolve(CONNECTION_PROMISE)
        .then((result) => {
          if (!cancelled) {
            setState(result)
          }

          CONNECTION_PROMISE = null
        })
        .catch((err) => {
          logger.error('Error restoring session', err)
          CONNECTION_PROMISE = null
        })
    }

    // connect
    if (
      state.status === AuthStatus.Connecting &&
      state.providerType &&
      state.chainId
    ) {
      if (!CONNECTION_PROMISE) {
        CONNECTION_PROMISE = createConnection(state.providerType, state.chainId)
      }

      Promise.resolve(CONNECTION_PROMISE)
        .then((result) => {
          if (!cancelled) {
            if (result.status === AuthStatus.Connected) {
              const conn = {
                account: result.account,
                ethAddress: result.account,
                providerType: state.providerType,
                chainId: state.chainId,
              }

              segment((analytics, context) => {
                analytics.identify(conn)
                analytics.track(AuthEvent.Connected, { ...context, ...conn })
              })

              rollbar((rollbar) => {
                rollbar.configure({
                  payload: {
                    person: {
                      id: conn.account!,
                    },
                  },
                })
              })
              sentry((sentry) => {
                sentry.setUser({
                  id: conn.account!,
                })
              })
            } else {
              result.selecting = state.selecting
            }

            setState(result)
          }

          CONNECTION_PROMISE = null
        })
        .catch((err) => {
          CONNECTION_PROMISE = null
          logger.error('Error creating session', err)
        })
    }

    // disconnect
    if (
      state.status === AuthStatus.Disconnecting &&
      state.providerType === null &&
      state.chainId === null
    ) {
      connection
        .disconnect()
        .then(() => setCurrentIdentity(null))
        .catch((err) => {
          console.error(err)
          rollbar((rollbar) => rollbar.error(err))
          sentry((sentry) => sentry.captureException(err))
          segment((analytics) =>
            analytics.track('error', {
              ...err,
              message: err.message,
              stack: err.stack,
            })
          )
        })
      segment((analytics, context) =>
        analytics.track(AuthEvent.Disconnected, context)
      )
      rollbar((rollbar) =>
        rollbar.configure({ payload: { person: { id: null } } })
      )
      sentry((sentry) => sentry.setUser({ id: undefined }))
      setState({
        ...initialState,
        status: AuthStatus.Disconnected,
      })
    }

    return () => {
      cancelled = true
    }
  }, [state])

  useEffect(() => {
    const provider = state.provider
    const onDisconnect = () => disconnect()
    const onChainChanged = (chainId: ChainId) =>
      setState({ ...state, chainId: Number(chainId) })

    if (provider && !provider.isFortmatic) {
      if (provider.on) {
        provider.on('chainChanged', onChainChanged)
        provider.on('accountsChanged', onDisconnect)
        provider.on('disconnect', onDisconnect)
      } else if (provider.addListener) {
        provider.addListener('chainChanged', onChainChanged)
        provider.addListener('accountsChanged', onDisconnect)
        provider.addListener('disconnect', onDisconnect)
      }
    }

    return () => {
      if (provider && !provider.isFortmatic) {
        if (provider.off) {
          provider.off('chainChanged', onChainChanged)
          provider.off('accountsChanged', onDisconnect)
          provider.off('disconnect', onDisconnect)
        } else if (provider.removeListener) {
          provider.removeListener('chainChanged', onChainChanged)
          provider.removeListener('accountsChanged', onDisconnect)
          provider.removeListener('disconnect', onDisconnect)
        }
      }
    }
  }, [state])

  const loading = isLoading(state.status) || switching

  const actions = useMemo(
    () => ({
      connect,
      disconnect: disconnectAndSignOut,
      switchTo,
      select,
      loading,
      error: state.error,
      selecting: state.selecting,
      provider: !loading ? state.provider : null,
      providerType: !loading ? state.providerType : null,
      chainId: !loading ? state.chainId : null,
    }),
    [connect, disconnect, switchTo, select, loading, state]
  )

  return [state.account, actions] as const
}
