import { createAsyncStateState } from '../../hooks/useAsyncState'
import useAuthContext from './useAuthContext'
import { getDefaultChainId } from './utils'

const fakeState = createAsyncStateState<ReturnType<typeof getDefaultChainId>>()

/**
 *
 * @returns
 */
export default function useChainIdContext() {
  const [, { chainId }] = useAuthContext()
  return [chainId, fakeState] as const
}
