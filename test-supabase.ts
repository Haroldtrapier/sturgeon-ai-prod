import { createClient } from '@supabase/supabase-js'

// Test Supabase connection
async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Testing Supabase Connection...\n')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseKey?.substring(0, 20)}...`)

  const supabase = createClient(supabaseUrl!, supabaseKey!)

  // Get all users (requires service role key)
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Error fetching users:', error.message)
      return
    }

    console.log(`\n✅ Connected to Supabase!`)
    console.log(`📊 Total users: ${users.users.length}\n`)

    if (users.users.length === 0) {
      console.log('⚠️  No users found in Supabase Auth!')
      console.log('➡️  Create a test user in Supabase Dashboard:')
      console.log('   1. Go to Authentication → Users')
      console.log('   2. Click "Add user"')
      console.log('   3. Set email and password')
      console.log('   4. Mark as email verified')
      return
    }

    console.log('👥 Users in Supabase Auth:\n')
    users.users.forEach((user, i) => {
      const verified = user.email_confirmed_at ? '✅' : '❌'
      console.log(`${i + 1}. Email: ${user.email} ${verified}`)
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`)
      console.log(`   Last sign in: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}\n`)
    })

  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
  }
}

testSupabaseConnection()
