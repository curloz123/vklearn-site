---
title: Surface
description: Creating a Vulkan window surface with GLFW
---

Now we need to establish a connection between vulkan and our window system, because how is vulkan supposed to know that where do we need to show our stuff on??

As many of you mustve guessed, we need another extension. That extension is `VK_KHR_surface`.

But don't worry, we don't need to enable this explicitly again. When we queried glfw with `glfwGetRequiredInstanceExtensions` about required extensions, this extension is in that list too.

The window surface handle is stored as a `VkSurfaceKHR` object. The process of creating window surface is different on different operating systems. On X11 you'd use `vkCreateXlibSurfaceKHR`, on Wayland `vkCreateWaylandSurfaceKHR`, on Windows `vkCreateWin32SurfaceKHR`, and making one for each is totally out of scope of this tutorial and I don't know how to do that either :( 

We'll just ask glfw to create that for us (glfw to the rescue again XD).

:::note
Notice how there is "KHR" at the end — `VkSurfaceKHR`. Whenever you encounter any data that has this suffix, this means that this is actually a Khronos certified extension. Yup you heard it right, "extension". Showing stuff on vulkan is actually optional.

You'll encounter many suffixes on your journey. Nvidia specific extensions are suffixed with `NV`, AMD's are with `AMD`. `EXT` means that they are not officially ratified but majority of vendors support them, and `KHR` are at the top of the hierarchy — officially supported extensions by Khronos.
:::

Now that the boring part is out of the way, lets start coding…

## Code

First lets declare a window surface handle.

```cpp
// hellovulkan.cpp
// Instance creation above

// Surface
VkSurfaceKHR surface = VK_NULL_HANDLE;
// VK_NULL_HANDLE is vulkan's equivalent of nullptr. The reason to do this is so that we can check later if its creation was successful or not by just comparing the handle with it.
```

Now, we can just create the surface with GLFW's inbuilt `glfwCreateWindowSurface` function.

```cpp
// hellovulkan.cpp
// Surface
VkSurfaceKHR surface = VK_NULL_HANDLE;
if (glfwCreateWindowSurface(instance, window, nullptr, &surface) != VK_SUCCESS)
{
    printf("Could not create window surface, exiting...\n");
    return 1;
}
printf("Created surface successfully\n");
```

The function takes in the instance, pointer to our window, and the surface to create (the third is allocator, not necessary).

Well, like other handles, we must destroy it too. Make sure you destroy it before destroying the instance.

```cpp
// hellovulkan.cpp
// cleanup
vkDestroySurfaceKHR(instance, surface, nullptr);
destroyDebugMessenger(instance, debugMessenger);
vkDestroyInstance(instance, nullptr);
```

And well, thats it. We've created the surface. Pretty easy huhhhh……

Source Code is available **[here](https://github.com/curloz123/vklearn/tree/master/Getting%20Started/Surface)**
## Extra Resources

| Resource | Description |
|---|---|
| [Vulkan-tutorial — Window Surface](https://vulkan-tutorial.com/Drawing_a_triangle/Presentation/Window_surface) | Vulkan-tutorial's equivalent chapter, good reference |   