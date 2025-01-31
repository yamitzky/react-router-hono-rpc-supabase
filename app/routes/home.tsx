import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useSupabase } from '~/root'

export function meta() {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }]
}

export default function Home() {
  const supabase = useSupabase()
  const [session, setSession] = useState<Session | null>()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <p></p>
      <ul>
        <li>
          <Link to="/articles" className="text-blue-500 hover:underline">
            View Articles
          </Link>
        </li>
        {session === undefined ? (
          <li></li>
        ) : session ? (
          <li>
            You are {session.user.email}.
            <button onClick={() => supabase.auth.signOut()} className="text-blue-500 hover:underline">
              Sign out
            </button>
          </li>
        ) : (
          <li>
            You are not signed in.
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </li>
        )}
      </ul>
    </div>
  )
}
