import ZurkaForm from '../../ZurkaForm'
import styles from '../../admin.module.css'

export default function NewZurkaPage() {
  return (
    <div>
      <div className={styles.pageHeader} style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <h1 className={styles.pageTitle}>Nova žurka</h1>
          <p className={styles.pageSubtitle}>Dodaj jedan ili više spratova za istu večer</p>
        </div>
      </div>
      <ZurkaForm />
    </div>
  )
}
