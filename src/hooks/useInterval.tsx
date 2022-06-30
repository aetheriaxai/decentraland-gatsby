// TODO(2fd): add Docs
import { DependencyList, useEffect, useState } from 'react'

export default function useInterval<T>(
  fun: () => T,
  interval: number,
  deps: DependencyList = []
): T {
  const [value, setValue] = useState(fun())

  useEffect(() => {
    const timer = setInterval(() => setValue(fun()), interval)
    return () => clearInterval(timer)
  }, [interval, ...deps])

  return value
}
