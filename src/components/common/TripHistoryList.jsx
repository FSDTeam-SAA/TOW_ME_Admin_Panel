import { formatDateTime, formatIls, statusLabel } from '../../utils/format'

const Field = ({ label, value }) => <div><small>{label}</small><b>{value ?? '—'}</b></div>

const coordinates = (location) => {
  const point = location?.coordinates?.coordinates
  return Array.isArray(point) && point.length === 2 && point.some(Number)
    ? `${point[1]}, ${point[0]}` : null
}

export default function TripHistoryList({ trips, t, language }) {
  const labels = language === 'he' ? {
    pickup: 'מיקום איסוף', destination: 'יעד', coordinates: 'קואורדינטות',
    vehicle: 'רכב', plate: 'מספר רכב', customer: 'לקוח', driver: 'נהג',
    contactPhone: 'טלפון איש קשר', price: 'מחיר', created: 'נוצר בתאריך',
    cancelledBy: 'בוטל על ידי', feeReason: 'סיבת דמי ביטול',
    priceDetails: 'פירוט מחיר', report: 'דוח סיום',
  } : {
    pickup: 'Pickup', destination: 'Destination', coordinates: 'Coordinates',
    vehicle: 'Vehicle', plate: 'License plate', customer: 'Customer', driver: 'Driver',
    contactPhone: 'Contact phone', price: 'Price', created: 'Created at',
    cancelledBy: 'Cancelled by', feeReason: 'Cancellation fee reason',
    priceDetails: 'Price breakdown', report: 'Completion report',
  }

  if (!trips?.length) return <p>{t.noResults}</p>

  return trips.map((trip) => {
    const vehicle = trip.vehicleInfo || {}
    const report = trip.completionReport || {}
    const driver = trip.driverId || {}
    const breakdown = Object.entries(trip.priceBreakdown || {})
      .filter(([key, value]) => key !== '_id' && value !== '' && value !== null && value !== undefined)
    const reportItems = Object.entries(report)
      .filter(([key, value]) => key !== '_id' && value !== '' && value !== null && value !== undefined)
    return <details key={trip._id} className="driver-trip-item trip-history-entry">
      <summary>
        <b>#{trip.tripNumber} · {statusLabel(trip.status, t)}</b>
        <span>{trip.pickupLocation?.address || '—'} → {trip.dropoffLocation?.address || '—'}</span>
        <span>{formatIls(trip.price)} · {formatDateTime(trip.createdAt)}</span>
      </summary>
      <div className="detail-grid trip-history-fields">
        <Field label={labels.customer} value={trip.customerId?.name} />
        <Field label={labels.driver} value={[driver.firstName, driver.lastName].filter(Boolean).join(' ') || null} />
        <Field label={t.towDetail.contactName} value={trip.contactInfo?.name} />
        <Field label={labels.contactPhone} value={trip.contactInfo?.phoneNumber || trip.customerId?.phoneNumber} />
        <Field label={labels.pickup} value={trip.pickupLocation?.address} />
        <Field label={`${labels.pickup} · ${labels.coordinates}`} value={coordinates(trip.pickupLocation)} />
        <Field label={labels.destination} value={trip.dropoffLocation?.address} />
        <Field label={`${labels.destination} · ${labels.coordinates}`} value={coordinates(trip.dropoffLocation)} />
        <Field label={labels.vehicle} value={[vehicle.make, vehicle.model].filter(Boolean).join(' ') || null} />
        <Field label={labels.plate} value={vehicle.licensePlate} />
        <Field label={t.towDetail.vehicleType} value={vehicle.type} />
        <Field label={t.towDetail.vehicleColor} value={vehicle.color} />
        <Field label={t.towDetail.vehicleYear} value={vehicle.year} />
        <Field label={labels.price} value={formatIls(trip.price)} />
        <Field label={t.towDetail.paymentMethod} value={trip.paymentMethod} />
        <Field label={t.towDetail.paymentStatus} value={trip.paymentStatus} />
        <Field label={t.towDetail.bookingSource} value={trip.bookingSource} />
        <Field label={t.towDetail.distance} value={trip.estimatedDistance ? `${trip.estimatedDistance} ${t.towDetail.kilometers}` : null} />
        <Field label={t.towDetail.duration} value={trip.estimatedDuration ? `${trip.estimatedDuration} ${t.towDetail.minutes}` : null} />
        <Field label={labels.created} value={formatDateTime(trip.createdAt)} />
        {['acceptedAt', 'arrivedAt', 'startedAt', 'completedAt', 'cancelledAt'].map((key) =>
          <Field key={key} label={t.towDetail[key]} value={trip[key] ? formatDateTime(trip[key]) : null} />)}
        <Field label={labels.cancelledBy} value={trip.cancelledBy} />
        <Field label={t.towDetail.cancellationReason} value={trip.cancellationReason} />
        <Field label={t.towDetail.cancellationFee} value={formatIls(trip.cancellationFee || 0)} />
        <Field label={labels.feeReason} value={trip.cancellationFeeReason} />
        <Field label={t.towDetail.notes} value={trip.notes} />
      </div>
      {breakdown.length > 0 && <div className="trip-history-extra"><h4>{labels.priceDetails}</h4>
        <div className="detail-grid">{breakdown.map(([key, value]) =>
          <Field key={key} label={key} value={typeof value === 'boolean' ? String(value) : value} />)}</div>
      </div>}
      {reportItems.length > 0 && <div className="trip-history-extra"><h4>{labels.report}</h4>
        <div className="detail-grid">{reportItems.map(([key, value]) =>
          <Field key={key} label={key} value={typeof value === 'boolean' ? String(value) : value} />)}</div>
      </div>}
      {trip.destinationHistory?.length > 0 && <div className="trip-history-extra"><h4>{t.towDetail.destinationHistory}</h4>
        {trip.destinationHistory.map((item, index) => <p key={`${item.changedAt || ''}-${index}`}>
          {item.address || '—'} · {formatIls(item.price || 0)} · {item.changedAt ? formatDateTime(item.changedAt) : '—'}
        </p>)}
      </div>}
    </details>
  })
}
