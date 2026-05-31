import Link from 'next/link'
import AdminEventRow from './AdminEventRow'
import styles from './admin.module.css'

export default function EventTable({ rows }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Vreme</th>
            <th>Predstava</th>
            <th>Izvođač</th>
            <th>Cena</th>
            <th>Prodato</th>
            <th>Rezerv.</th>
            <th>Potvrđ.</th>
            <th>Čekanj.</th>
            <th>Slobod.</th>
            <th>Status</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={12} className={styles.emptyState}>
                Nema događaja. <Link href="/admin/events/new">Dodaj prvi.</Link>
              </td>
            </tr>
          ) : (
            rows.map(event => <AdminEventRow key={event.id} event={event} />)
          )}
        </tbody>
      </table>
    </div>
  )
}
