import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: '/game',
		},
		sitemap: 'https://mooncraft.game/sitemap.xml',
	}
}
