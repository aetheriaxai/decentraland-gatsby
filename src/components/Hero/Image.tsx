import React from 'react'

import { MotionProps, motion } from 'framer-motion'

import TokenList from '../../utils/dom/TokenList'

import './Image.css'

export type ImageProps = MotionProps & {
  className?: string
  src?: string
  background?: boolean
  backgroundSize?: number | string
  width?: number | string
  height?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
}

export default function Image({
  src,
  className,
  background,
  backgroundSize,
  ...props
}: ImageProps) {
  return (
    <motion.div
      {...props}
      className={TokenList.join([
        background ? 'HeroBackground' : 'HeroImage',
        className,
      ])}
      style={{
        ...props.style,
        backgroundImage: `url("${src}")`,
        backgroundSize: backgroundSize,
      }}
    />
  )
}
