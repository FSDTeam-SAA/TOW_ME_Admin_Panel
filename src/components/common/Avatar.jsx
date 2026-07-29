import React from 'react'

export default function Avatar({ text = 'AK', color = '#163b60', large = false }) {
  return <span className={`avatar ${large ? 'avatar--large' : ''}`} style={{ background: color }}>{text}</span>
}
