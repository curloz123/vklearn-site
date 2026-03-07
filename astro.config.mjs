// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'LearnVulkan',
			pagefind: true,
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/curloz123/vklearn' }],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Introduction', slug: 'introduction/introduction' },
						{ label: 'A Brief Introduction to Vulkan', link: 'introduction/vulkan' },
					],
				},
				{
					label: 'Getting Started',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Environment Setup', slug: 'getting_started/env_setup' },
						{ label: 'Window Setup', slug: 'getting_started/window_setup' },
					],
				},
			],
		}),
	],
});
