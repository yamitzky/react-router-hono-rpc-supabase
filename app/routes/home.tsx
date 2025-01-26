import { Link } from 'react-router'

export function meta() {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }]
}

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <Link to="/articles" className="text-blue-500 hover:underline">
        View Articles
      </Link>
    </div>
  )
}
