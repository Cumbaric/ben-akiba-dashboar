import AdminTabs from '../AdminTabs'
import MonthPicker from '../MonthPicker'
import styles from '../admin.module.css'

export const revalidate = 0

export default function StandupMonths() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎤 Stand Up</h1>
          <p className={styles.pageSubtitle}>Izaberi mesec</p>
        </div>
      </div>

      <AdminTabs active="standup" />

      <MonthPicker types={['standup']} hrefBase="/admin/standup" />
    </div>
  )
}
