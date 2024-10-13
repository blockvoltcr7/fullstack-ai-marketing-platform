🔧 **Setting Up Stripe Webhooks for Test Environment** 🔧

To create a 🌐 webhook endpoint for the **test environment** in Stripe, follow these steps:

### **1️⃣. Install the Stripe CLI**
- If you haven't already, 📥 download and install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
- The CLI is an essential 🛠️ tool for local 🧪 testing, as it can simulate Stripe events 📤 and forward them to your local webhook endpoint.

### **2️⃣. Set Up Your Local Webhook Endpoint**
- Create a webhook handler in your local server 💻. This is an API route that listens 👂 for incoming Stripe events.
- For example, in Next.js, add a new 📄 file in your API routes (`pages/api/webhook.ts`):

  ```typescript
  import { NextApiRequest, NextApiResponse } from 'next';
  import Stripe from 'stripe';
  import { buffer } from 'micro';

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2022-11-15',
  });

  export const config = {
    api: {
      bodyParser: false,
    },
  };

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      const buf = await buffer(req);
      event = stripe.webhooks.constructEvent(buf, sig as string, endpointSecret as string);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed: ${(err as Error).message}`);
      return res.status(400).send(`❌ Webhook Error: ${(err as Error).message}`);
    }

    // 🔄 Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('💸 Payment successful:', paymentIntent);
        break;
      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
  ```

### **3️⃣. Use Stripe CLI to Get the Webhook Secret**
- Run the following command to listen 👂 to incoming Stripe events 📥 and forward them to your local webhook handler:

  ```sh
  stripe listen --forward-to localhost:3000/api/webhook
  ```

- This command will output a **Webhook Signing Secret** that looks like:
  ```
  > Ready! Your webhook signing secret is 🔑 whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX
  ```
- **Copy** the `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX`. This is the **Webhook Signing Secret** for verifying incoming events.

### **4️⃣. Set Environment Variables**
- Create or update your `.env.local` 📄 file to add the following environment variables:

  ```
  STRIPE_SECRET_KEY=🔑 sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXX
  STRIPE_WEBHOOK_SECRET=🔑 whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX
  ```

- Make sure the **Stripe Secret Key** (`sk_test_...`) and **Webhook Signing Secret** (`whsec_...`) are set correctly to authenticate your interactions with Stripe.

### **5️⃣. Test Webhook Events Locally**
- Use the Stripe CLI to trigger 🔄 various events for testing:

  ```sh
  stripe trigger payment_intent.succeeded
  ```

- The CLI will simulate a successful payment event 💸 and send it to your local endpoint. You should see the logs 📜 in your console, confirming that the event was received and processed.

### **6️⃣. Debugging 🐞**
- If you encounter issues, check for the following:
  - **Correct Signing Secret**: Ensure that the signing secret (`whsec_...`) matches the one output by the `stripe listen` command.
  - **Raw Body Parsing**: Ensure the body parser is disabled (use `bodyParser: false`) so the raw request body can be verified by Stripe.
  - **Event Handling**: Make sure your code properly handles 🔄 and logs 📝 the event types you're interested in.

### **Summary 📋**
- Install the Stripe CLI.
- Set up a local webhook handler.
- Use the Stripe CLI to listen 👂 and forward events.
- Set environment variables for 🔑 authentication.
- Test locally by simulating events 🔄.

This setup will help you ensure that your webhook integration is working properly in a test environment before moving to 🏭 production.
