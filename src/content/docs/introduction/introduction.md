---
title: Introduction
description: Welcome to LearnVulkan — a practical Vulkan tutorial for developers
---

Welcome to VkLearn. You probably came here because you wanna learn computer graphics and show cool stuff on your display and show off to other guys (you're not partially wrong). Doing things from scratch is a respectable choice. Of course you're going to learn Vulkan, and I appreciate you for choosing it — even though I'm 99% sure you must've heard how OpenGL vs Vulkan is basically Python vs assembly. That phrase is kinda vague (you'll know why later), but that pretty much is the gist of how hard Vulkan is going to be.

## Prerequisites

Now, there's a few things you've gotta know before you can start programming:

**1. C++**
Since Vulkan is an API (Application Program Interface) for the GPU, you need a language to operate it. And as we all know it's gotta be either C or C++. I don't expect you to be a master at it, but you should be more comfortable to it than just printing hello world. I won't be using fancy C++, keeping the standard to C++17 for simplicity.

**2. Mathematics**
There's gonna be maths — a whole lot of it. I've decided not to use GLM (OpenGL Mathematics), because I want you to understand all the theoretical knowledge behind it. But if you're not interested, don't worry — there will be an option to skip it. I'll tell you in later chapters.

**3. Structure**

Throughout this site you'll encounter:

**Boxes** — extra notes for help and bits of knowledge

:::tip
This is a tip box — for helpful extra info
:::

:::danger
This is a danger box — for "don't do this" moments
:::

**Code** — code references and examples
```cpp
// code will look like this
VkInstance instance;
```

**Vulkan Function references** — pinned to the actual Vulkan documentation

[vkCreateInstance](https://registry.khronos.org/vulkan/specs/latest/man/html/vkCreateInstance.html) — creates a Vulkan instance

## Conclusion

My main aim in writing this site is to help people learn Vulkan easily. There are a lot of wonderful resources out there, and I've pinned them below. But there were many things I found lacking in them. I'm sure I myself am going to make many mistakes, but I'll try my best to teach you as well as I can. And yes, this site is inspired from the very site you guys already thought of — [learnopengl.com](https://learnopengl.com) :)

## Extra Resources

| Resource | Description |
|---|---|
| [vulkan-tutorial.com](https://vulkan-tutorial.com/) | The most well known Vulkan tutorial, but outdated in places, but every concept is taught well |
| [vk-guide.dev](https://vkguide.dev/) | Great reference and has excellent programming practices |
| [Official Khronos Docs](https://docs.vulkan.org/tutorial/latest/00_Introduction.html) | The official documentation, dense but authoritative |
| [Sascha Willems](https://github.com/SaschaWillems/Vulkan) | Excellent code examples for Vulkan, almost every feature you would've heard of, has been implemented there |
