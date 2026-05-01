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

        if (!email) {
          console.error('No email found on checkout session', session.id)
          break
        }

        // Step 1: Check if user already exists in Supabase Auth
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        let user = existingUsers?.users?.find(u => u.email === email)

        // Step 2: If user doesn't exist, create them
        if (!user) {
          console.log(`Creating new Supabase user for ${email}`)
          const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            email_confirm: true, // Mark email as confirmed since they paid
          })

          if (createError) {
            console.error('Failed to create Supabase user:', createError.message)
            break
          }

          user = newUserData.user
          console.log(`Created Supabase user ${user.id} for ${email}`)

          // Step 3: Send them a magic link so they can log in and set a password
          const { error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
              redirectTo: `${process.env.NEXTAUTH_URL}/auth/login`,
            },
          })

          if (linkError) {
            console.error('Failed to send magic link:', linkError.message)
          } else {
            console.log(`Magic link sent to ${email}`)
          }
        }

        // Step 4: Upsert the user's plan as 'paid'
        const { error: planError } = await supabase.from('user_plans').upsert({
          id: user.id,
          plan: 'paid',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString(),
        })

        if (planError) {
          console.error('Failed to update user_plans:', planError.message)
        } else {
          console.log(`User ${email} upgraded to paid plan`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

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