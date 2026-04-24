import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return Response.redirect(`${process.env.NEXTAUTH_URL}/pricing`)
    }

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid' || session.status === 'complete') {
      const email = session.customer_email || session.metadata?.email

      if (email) {
        // Find user by email in Supabase
        const { data: users } = await supabase.auth.admin.listUsers()
        const user = users?.users?.find(u => u.email === email)

        if (user) {
          // Upsert user plan as 'paid'
          await supabase.from('user_plans').upsert({
            id: user.id,
            plan: 'paid',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString(),
          })
        }
      }
    }

    // Redirect to login with success message
    return Response.redirect(`${process.env.NEXTAUTH_URL}/auth/login?payment=success`)
  } catch (error) {
    console.error('Stripe success error:', error)
    return Response.redirect(`${process.env.NEXTAUTH_URL}/pricing?error=true`)
  }
}