// app/unsubscribe/page.tsx
import { Suspense } from 'react'
import UnsubscribePage from '../../components/custom/UnsubscribePage' // move your client component here

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnsubscribePage />
    </Suspense>
  )
}
