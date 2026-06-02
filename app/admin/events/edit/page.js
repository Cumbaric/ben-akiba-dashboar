import { supabase } from '@/lib/supabase'
import EventForm from '../EventForm'
import styles from '../../admin.module.css'

export default async function EditEventPage({ searchParams }) {
  const { id } = await searchParams
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()

  if (!event) {
    return <div style={{ padding: 40, color: 'var(--red)' }}>Događaj nije pronađen.</div>
  }

  return (
    <div>
      <div className={styles.pageHeader} style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <h1 className={styles.pageTitle}>Uredi događaj</h1>
          <p className={styles.pageSubtitle}>{event.title}</p>
        </div>
      </div>
      <EventForm event={event} />
    </div>
  )
}
