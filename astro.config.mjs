// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'vklearn',
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
						{ label: 'Hello Window', slug: 'getting_started/hello_window' },
						{ label: 'Instance', slug: 'getting_started/instance' },
						{ label: 'Validation Layers', slug: 'getting_started/validation_layers' },
						{ label: 'Window Surface', slug: 'getting_started/surface' },
						{ label: 'Physical Device', slug: 'getting_started/physical_device' },
						{ label: 'Logical Device', slug: 'getting_started/logical_device' },



					],
				},
			],
		}),
	],
});
