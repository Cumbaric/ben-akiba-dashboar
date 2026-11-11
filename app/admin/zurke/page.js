import AdminTabs from '../AdminTabs'
import MonthPicker from '../MonthPicker'
import styles from '../admin.module.css'

export const revalidate = 0

export default function ZurkeMonths() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎉 Žurke</h1>
          <p className={styles.pageSubtitle}>Izaberi mesec</p>
        </div>
      </div>

      <AdminTabs active="zurke" />

      <MonthPicker types={['zurka']} hrefBase="/admin/zurke" />
    </div>
  )
}
