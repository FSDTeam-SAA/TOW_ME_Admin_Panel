import React from 'react'
import { initialsOf } from '../../utils/format'

export default function Avatar({ text = 'AK', color = '#163b60', large = false }) {
  const name = String(text || '').trim()
  const initials = Array.from(name).length > 2 ? initialsOf(name) : name || '??'
  return <span className={`avatar ${large ? 'avatar--large' : ''}`} style={{ background: color }} title={name} translate="no">{initials}</span>
}
