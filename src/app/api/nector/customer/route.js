import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  // Convert the ID to GID format (e.g., 8846770733274 -> gid://shopify/Customer/8846770733274)
  const numericId = customerId.toString().replace('shopify-', '');
  const gid = `gid://shopify/Customer/${numericId}`;

  const query = `
    query getCustomerNectorData($id: ID!) {
      customer(id: $id) {
        # Fetching the exact keys found in your admin data
        referral_link: metafield(namespace: "nector", key: "nector_user_referral_link") { value }
        balance: metafield(namespace: "nector", key: "nector_user_available_balance") { value }
      }
    }
  `;

  try {
    const response = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables: { id: gid } }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error("Shopify API Error:", result.errors);
      return NextResponse.json({ error: result.errors[0].message }, { status: 500 });
    }

    const customer = result.data?.customer;

    return NextResponse.json({
      referralLink: customer?.referral_link?.value || "",
      balance: customer?.balance?.value || 0
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to connect to Shopify' }, { status: 500 });
  }
}