const AVATAR_COLORS = [
  '#758178', '#29231f', '#6a6c4f', '#f16522',
  '#416f7b', '#28241e', '#707a73', '#258ca8',
]

export const initialsOf = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

/** Stable per-record colour so a driver keeps the same avatar between loads. */
export const avatarColor = (id) => {
  const key = String(id || '')
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export const formatIls = (value, compact = false) => {
  const amount = Number(value) || 0
  if (compact) {
    if (amount >= 1000) return `₪${Math.round(amount / 100) / 10}k`
    return `₪${Math.round(amount)}`
  }
  return `₪${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB')
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export const driverName = (driver) => {
  if (!driver) return '—'
  const name = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
  return name || driver.userId?.name || '—'
}

const TRIP_STATUS_HE = {
  pending: 'ממתין',
  accepted: 'שובץ נהג',
  arrived: 'הנהג הגיע',
  in_progress: 'בביצוע',
  completed: 'הושלם',
  cancelled: 'בוטל',
}

const TRIP_STATUS_EN = {
  pending: 'Pending',
  accepted: 'Driver assigned',
  arrived: 'Driver arrived',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const statusLabel = (status, t) =>
  (t?.dir === 'rtl' ? TRIP_STATUS_HE : TRIP_STATUS_EN)[status] || status || '—'

export const TRIP_STATUSES = [
  'pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled',
]

/** Maps a trip status onto the CSS status classes the stylesheet already has. */
export const statusClass = (status) => {
  if (status === 'completed') return 'live'
  if (status === 'cancelled') return 'off'
  if (status === 'in_progress' || status === 'arrived') return 'towing'
  return ''
}

export const downloadCsv = (filename, rows) => {
  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n')
  // Leading BOM so Excel reads the Hebrew columns as UTF-8.
  const bom = String.fromCharCode(0xfeff)
  const url = URL.createObjectURL(
    new Blob([bom + csv], { type: 'text/csv;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
