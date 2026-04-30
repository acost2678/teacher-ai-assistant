import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { email } = await request.json()

    const baseUrl = process.env.NEXTAUTH_URL
    
    // DEBUG: log everything we need to diagnose
    console.log('=== CHECKOUT DEBUG ===')
    console.log('baseUrl raw:', JSON.stringify(baseUrl))
    console.log('baseUrl type:', typeof baseUrl)
    console.log('baseUrl length:', baseUrl?.length)
    console.log('success_url will be:', `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`)
    console.log('cancel_url will be:', `${baseUrl}/pricing`)
    console.log('STRIPE_PRICE_ID:', JSON.stringify(process.env.STRIPE_PRICE_ID))
    console.log('======================')
    
    if (!baseUrl) {
      throw new Error('NEXTAUTH_URL is not set')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        email: email,
      },
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}