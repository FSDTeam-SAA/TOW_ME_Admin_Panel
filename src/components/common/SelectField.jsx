import { ChevronDown } from 'lucide-react'

export default function SelectField({ children, ...props }) {
  return <span className="admin-select">
    <select {...props}>{children}</select>
    <ChevronDown size={18} aria-hidden="true" />
  </span>
}
