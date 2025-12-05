import { NextApiRequest, NextApiResponse } from 'next'
import { searchSam } from '../../../lib/marketplaces/sam'
import { searchGovwin } from '../../../lib/marketplaces/govwin'
import { searchGovspend } from '../../../lib/marketplaces/govspend'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { marketplace } = req.query
  const query = (req.query.q as string) ?? ''
  const naics = (req.query.naics as string) ?? undefined

  if (!marketplace || typeof marketplace !== 'string') {
    return res.status(400).json({ error: 'Invalid marketplace parameter' })
  }

  try {
    let results

    switch (marketplace.toLowerCase()) {
      case 'sam':
        results = await searchSam({ query, naics })
        break
      case 'govwin':
        results = await searchGovwin({ query, naics })
        break
      case 'govspend':
        results = await searchGovspend({ query, naics })
        break
      default:
        return res.status(400).json({
          error: `Unknown marketplace: ${marketplace}`
        })
    }

    return res.status(200).json({ data: results })
  } catch (err: any) {
    console.error(`[marketplaces/${marketplace}]`, err)
    return res.status(500).json({
      error: 'Marketplace search failed'
    })
  }
}
