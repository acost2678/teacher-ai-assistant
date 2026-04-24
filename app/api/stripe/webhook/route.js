import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const email = session.customer_email || session.metadata?.email

        if (email) {
          const { data: users } = await supabase.auth.admin.listUsers()
          const user = users?.users?.find(u => u.email === email)

          if (user) {
            await supabase.from('user_plans').upsert({
              id: user.id,
              plan: 'paid',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            console.log(`User ${email} upgraded to paid plan`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        // Find user by stripe customer id
        const { data: planData } = await supabase
          .from('user_plans')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (planData) {
          await supabase.from('user_plans').update({
            plan: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          }).eq('id', planData.id)
          console.log(`User subscription cancelled, reverted to free plan`)
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: planData } = await supabase
          .from('user_plans')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (planData) {
          await supabase.from('user_plans').update({
            plan: 'paid',
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          }).eq('id', planData.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response('Webhook handler failed', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}