import MonthPicker from './MonthPicker'

export const revalidate = 0

export default function AdminHome() {
  return <MonthPicker types={['standup', 'zurka']} hrefBase="/admin/mesec" />
}
