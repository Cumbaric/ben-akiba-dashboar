import EventForm from '../EventForm'
import styles from '../../admin.module.css'

export default function NewEventPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Novi događaj</h1>
          <p className={styles.pageSubtitle}>Popuni podatke za novi stand-up događaj</p>
        </div>
      </div>
      <EventForm />
    </div>
  )
}
