import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div>
      <h2>Nie znaleziono strony</h2>
      <p>Przepraszamy, ale strona, której szukasz, nie istnieje.</p>
      <Link href="/">Wróć do strony głównej</Link>
    </div>
  )
}
