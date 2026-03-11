---
title: A Brief Introduction to Vulkan
description: What Vulkan actually is, how it differs from OpenGL, and why that comparison is misleading
---

I'm pretty sure most of you have only heard that Vulkan is hard and renders cool stuff on screen with high performance. You're not wrong, but half knowledge is always dangerous — so let me brief you a little on it.

## What is Vulkan?

Vulkan is a **GPU API**. It basically allows you to talk to your GPU and perform commands that help you show something on the screen. It was developed by the Khronos Group — the same group that made OpenGL!

It is cross-platform by nature, meaning code written in Vulkan can be compiled and run across multiple operating systems. It was primarily built to address the shortcomings of OpenGL, but turned out to be a different beast entirely.

OpenGL is more of a **graphics API** — whatever operation you perform using it is just meant for graphics purposes. Vulkan on the other hand allows you to talk directly to the GPU and command it to perform compute or graphics operations. It's basically like:

- In **OpenGL** — you request the GPU to *please do this*
- In **Vulkan** — you send it multiple papers stating all the work that needs to be done.

That's why in the last chapter I said comparing OpenGL to Vulkan is kinda vague. They're solving different problems at different levels — it's apples to oranges.

Of course, directly talking to the GPU is powerful sorcery — but *"with great power, comes great responsibility."* You need to handle a lot of things yourself, so be ready for it.

## How is Vulkan installed?

Unlike the libraries we're going to use later, there's no separate library to install for Vulkan. It is already inside your GPU. The drivers you install for your GPU already have the Vulkan implementation baked in. In simple terms, all the functions you're gonna call are already present in your GPU drivers. You just have to install the **Vulkan SDK** separately for the development tools.

:::tip
If you encounter a bug, just make sure to update your drivers to the latest version — 99% chance it will be fixed :)
:::

## Compatibility

Till date, there have been five major releases of Vulkan — 1.0, 1.1, 1.2, 1.3, and 1.4, with 1.4 being the latest. For compatibility and ease we're going to be developing in **1.3**, and there's a pretty good reason for it:

**Dynamic Rendering** — I cannot stress enough how good this feature is. It's going to save you at least 500 lines of code. Without it, you're stuck with traditional render passes, and let me tell you, render passes were a nightmare to understand and work with. It's an optimization for tile-based GPUs (mobile GPUs mainly benefit from this). For PCs there's no difference — it just removes a ton of extra boilerplate.

Before starting, just as a heads up — check if your GPU actually supports Vulkan 1.3 here: **[vulkan.gpuinfo.org](https://vulkan.gpuinfo.org/)**

Look for **Max. API version** — it should be at least `1.3.xxx`.

:::note
The database may show outdated info for your GPU, especially on Linux. Always verify with `vulkaninfo` on your own system, which we will do in the next chapter.
:::

## Let's get started

Beginning next chapter, we will start setting up our environment and writing our first lines of Vulkan code — so fire up your code editors, because it's coding time! 🚀
