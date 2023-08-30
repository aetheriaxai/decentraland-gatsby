import React from 'react'

import { BrowserOptions } from '@sentry/browser'

import env from '../../utils/env'

type SentryProps = {
  src?: string
} & React.ScriptHTMLAttributes<HTMLScriptElement> &
  React.HTMLProps<HTMLScriptElement>

export default React.memo(function Sentry({ src, ...props }: SentryProps) {
  src = src || env('SENTRY_SRC', process.env.GATSBY_SENTRY_SRC || '')

  if (!src) {
    console.warn(
      `skipping Sentry init inject: src and GATSBY_SENTRY_SRC is missing'`
    )
    return null
  }

  const tags: Record<string, string | number> = {}

  const COMMIT_SHA = env('COMMIT_SHA')
  if (COMMIT_SHA !== undefined) {
    tags['commit.sha'] = COMMIT_SHA
  }

  const COMMIT_SHORT_SHA = env('COMMIT_SHORT_SHA')
  if (COMMIT_SHORT_SHA !== undefined) {
    tags['commit.short_sha'] = COMMIT_SHORT_SHA
  }

  const COMMIT_REF_NAME = env('COMMIT_REF_NAME')
  if (COMMIT_REF_NAME !== undefined) {
    tags['commit.ref_name'] = COMMIT_REF_NAME
  }

  const COMMIT_BRANCH = env('COMMIT_BRANCH')
  if (COMMIT_BRANCH !== undefined) {
    tags['commit.branch'] = COMMIT_BRANCH
  }

  const COMMIT_TAG = env('COMMIT_TAG')
  if (COMMIT_TAG !== undefined) {
    tags['commit.tag'] = COMMIT_TAG
  }

  const initialConfig: BrowserOptions = {
    environment: env('ENVIRONMENT', 'local'),
    // Performance Monitoring
    tracesSampleRate: 0.001,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  }

  return (
    <>
      <script {...props} src={src} crossOrigin="anonymous" />
      <script
        dangerouslySetInnerHTML={{
          __html: `Sentry.onLoad(function() {
            Sentry.init(${JSON.stringify(initialConfig)})
            Sentry.setTags(${JSON.stringify(tags)})
          })`,
        }}
      />
    </>
  )
})
