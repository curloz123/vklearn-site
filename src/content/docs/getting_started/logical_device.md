---
title: Logical Device
description: Creating a logical device to interface with our selected GPU
---

Now that we have selected the physical device, we now need a way to interact with it. Which is done via a Logical device or just a device if you wanna keep it simple. This is the actual driver on the GPU hardware, and the way we communicate with our selected GPU. Most of Vulkan commands outside of debug utils or initialization stuff need device. The process will feel similar as creating an instance.

Ofcourse like physical device, we can create multiple devices, but its out of scope of these tutorials T_T

## Initializing Logical Device

The device handle is stored as [VkDevice](https://docs.vulkan.org/refpages/latest/refpages/source/VkDevice.html) object. For now lets just null initialize the object -

```cpp
// hellovulkan.cpp
VkDevice device = VK_NULL_HANDLE;
```

Now we need to follow vulkan's "tell me everything before hand" legacy and specify the details in structs again.
First is `VkDeviceCreateInfo` struct, which specifies details of a logical device. It is defined in vulkan headers like this -

```cpp
typedef struct VkDeviceCreateInfo {
    VkStructureType                    sType;
    const void*                        pNext;
    VkDeviceCreateFlags                flags;
    uint32_t                           queueCreateInfoCount;
    const VkDeviceQueueCreateInfo*     pQueueCreateInfos;
    uint32_t                           enabledExtensionCount;
    const char* const*                 ppEnabledExtensionNames;
    const VkPhysicalDeviceFeatures*    pEnabledFeatures;
} VkDeviceCreateInfo;
```

First is of course which struct it is.

The most interesting parameter is the second one, `pNext`. We will be using this shortly when we send info to enable dynamic rendering.

4th (`queueCreateInfoCount`) and 5th (`pQueueCreateInfos`) ask about queues to enable — I will explain this a little better shortly.

6th (`enabledExtensionCount`) and 7th (`ppEnabledExtensionNames`) define the device specific extensions we need. We only need to enable the "Swapchain" extension from the device. Don't worry if the name is too heavy for you. We'll learn about swapchain in an upcoming chapter.

Last is what features of physical device we need to enable. We don't really need to enable any features so we'll just initialize it to NULL.

Lets start now -

```cpp
// hellovulkan.cpp
VkDeviceCreateInfo deviceInfo = {};
deviceInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
```

Now lets tackle those parameters one by one.

## The pNext Chaining (2nd parameter)

Ok now we are going to learn a widely used trick in vulkan and the story behind it is pretty interesting. When vulkan 1.0 was released, it had many structs!! and every struct performed different operation. But that was long before. Now with advancements, new things are to be added. But adding new fields to an existing struct would mess things up badly as applications using previous version would be compiled expecting a different struct size. Say a game was made with vulkan 1.0 which used a struct that had 10 bytes of memory, but 1.1 changed that to 12 bytes by adding a field and the user's GPU had drivers compiled with vulkan 1.1 api. The game would instantly crash and thus break backwards compatibility. Soooo... to tackle this, we use `pNext`, a void pointer that can point to any struct. Kind of imagine it like person A wants to send info to person B via a paper, but paper has less size and A wants to send more. So he ties another paper to the paper, thus extending the paper. Same is the case with vulkan. This method secures backward compatibility while also keeping space for new features.

This is kind of similar to how [linked lists](https://www.geeksforgeeks.org/dsa/linked-list-data-structure/) work.

:::note
Since `pNext` points to another struct as a raw pointer, it has no idea what that other struct is. This is exactly why each struct has a `.sType` field which explicitly states which struct it is. When Vulkan walks the `pNext` chain, it reads `sType` first to identify what struct it's looking at before reading its fields.
:::

Now first, lets tell the device that we want to enable dynamic rendering -

```cpp
// hellovulkan.cpp
VkPhysicalDeviceVulkan13Features features13 = {};
features13.sType = VK_STRUCTURE_TYPE_PHYSICAL_DEVICE_VULKAN_1_3_FEATURES;
features13.dynamicRendering = VK_TRUE;
features13.pNext = nullptr;
```

Since dynamic rendering is a 1.3 feature, we create a `VkPhysicalDeviceVulkan13Features` which is a struct describing the Vulkan 1.3 features. There are many that we can enable and you can see em [here](https://docs.vulkan.org/refpages/latest/refpages/source/VkPhysicalDeviceVulkan13Features.html) but we are only concerning ourselves with `dynamicRendering` so we enable that only by setting `.dynamicRendering` to true.

Now lets finally chain it -

```cpp
// chain the struct to main device creation struct
deviceInfo.pNext = &features13;
```

## Specifying Queues to be Used (4th and 5th parameter)

Now we need to specify what queues we need. Right now, there are only two — Graphics and present queue.

First let us just retrieve the indices to both of them that I missed to do in previous chapter :(

Queue families are stored as plain `uint32_t`, so we need to make two of them -

```cpp
// hellovulkan.cpp
// Queue family indices
uint32_t graphicsFamily = 0;
uint32_t presentFamily = 0;
```

Then create a function that retrieves those indices for us:

```cpp
// boilerplate.hpp
#pragma once
#include <vulkan/vulkan.h>
#include <vector>
#include <cstdio>

void retrieveQueueFamilies(VkPhysicalDevice physicalDevice, VkSurfaceKHR surface, uint32_t *pGraphicsFamily, uint32_t *pPresentFamily)
{
    // Retrieve all queue families
    uint32_t queueFamilyCount = 0;
    vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, nullptr);
    std::vector<VkQueueFamilyProperties> queueFamilies(queueFamilyCount);
    vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, queueFamilies.data());

    bool graphicsFamilyFound = false;
    VkBool32 presentFamilyFound = false;

    for (int i = 0; i < queueFamilies.size(); ++i)
    {
        // Graphics Support
        if (queueFamilies[i].queueFlags & VK_QUEUE_GRAPHICS_BIT)
        {
            *pGraphicsFamily = i;
            graphicsFamilyFound = true;
        }

        // Present Support
        vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, i, surface, &presentFamilyFound);
        if (presentFamilyFound)
            *pPresentFamily = i;

        if (graphicsFamilyFound && presentFamilyFound)
            break;
    }
}
```

Code is pretty similar to how we checked for graphics and presentation support in the previous chapter. And it is recommended to retrieve handles then and there rather than re-running the loop again for obvious reasons. I did this for clarity purposes but you are free to do it however you want.

### Specifying which queues we want to use

Let us finally tell the device about what queues we are going to use.
For each different queue, we need to create a `VkDeviceQueueCreateInfo`, which we pass later to the logical device creation struct which tells it blah blah blah…..

here -

```cpp
// hellovulkan.cpp
// First the queues
float queuePriority = 1.0f;
VkDeviceQueueCreateInfo graphicsQueueInfo = {};
graphicsQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
graphicsQueueInfo.queueFamilyIndex = graphicsFamilyIndex;
graphicsQueueInfo.queueCount = 1;
graphicsQueueInfo.pQueuePriorities = &queuePriority;

VkDeviceQueueCreateInfo presentQueueInfo = {};
presentQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
presentQueueInfo.queueFamilyIndex = presentFamilyIndex;
presentQueueInfo.queueCount = 1;
presentQueueInfo.pQueuePriorities = &queuePriority;
```

A thing to note here is, queue priority. Say you have multiple queues enabled from a family. Queue priority tells the GPU to give more time to queues with higher priority compared to other queues. With 1.0 being highest priority and 0.0 being lowest.
Right now we only have one queue enabled from each family so it doesn't really matter what their priority is.

Now theres a problem. Remember in the last chapter I said "its possible that a queue can perform multiple operations". What if the present family and the graphics family are the same family?? If this happens, validation layers would scream at you, and on some computers the program might even crash.

:::tip
I encourage you to try this yourselves — intentionally use two separate structs with the same family index and see what validation layers say. Best way to learn!
:::

This is how I have done this -

```cpp
// hellovulkan.cpp
// vector holding all the queue infos
std::vector<VkDeviceQueueCreateInfo> queueInfos;

float queuePriority = 1.0f;
if (graphicsFamilyIndex == presentFamilyIndex)
{
    VkDeviceQueueCreateInfo queueInfo = {};
    queueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    queueInfo.queueFamilyIndex = graphicsFamilyIndex;
    queueInfo.queueCount = 1;
    queueInfo.pQueuePriorities = &queuePriority;
    queueInfos.push_back(queueInfo);
}
else
{
    VkDeviceQueueCreateInfo graphicsQueueInfo = {};
    graphicsQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    graphicsQueueInfo.queueFamilyIndex = graphicsFamilyIndex;
    graphicsQueueInfo.queueCount = 1;
    graphicsQueueInfo.pQueuePriorities = &queuePriority;

    VkDeviceQueueCreateInfo presentQueueInfo = {};
    presentQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    presentQueueInfo.queueFamilyIndex = presentFamilyIndex;
    presentQueueInfo.queueCount = 1;
    presentQueueInfo.pQueuePriorities = &queuePriority;

    queueInfos.push_back(graphicsQueueInfo);
    queueInfos.push_back(presentQueueInfo);
}
```

:::danger
Make sure `queuePriority` is declared outside the if/else block. Since `pQueuePriorities` is a pointer, if `queuePriority` goes out of scope before Vulkan reads it, the pointer becomes dangling and you'll get garbage values or a crash.
:::

And finally, lets tell the device creation struct about them -

```cpp
// tell the device creation struct
deviceInfo.queueCreateInfoCount = static_cast<uint32_t>(queueInfos.size());
deviceInfo.pQueueCreateInfos = queueInfos.data();
```

## Enabling Extensions (6th and 7th parameter)

Ofcourse, there are extensions to device features too. The only extension we need is the swapchain support. Don't get overwhelmed by the name, we will learn about swapchain in the next chapter. Just know that we need to enable this extension. Extension name is `VK_KHR_swapchain` and the macro for it is `VK_KHR_SWAPCHAIN_EXTENSION_NAME`.

So lets start -

```cpp
// hellovulkan.cpp
// enabling swapchain extension
const std::vector<const char*> requiredDeviceExtensions = {
    VK_KHR_SWAPCHAIN_EXTENSION_NAME
};
```

Ofcourse since its an extension, we should check if its available or not -

```cpp
// hellovulkan.cpp
uint32_t deviceExtensionCount = 0;
vkEnumerateDeviceExtensionProperties(physicalDevice, nullptr, &deviceExtensionCount, nullptr);

std::vector<VkExtensionProperties> availableDeviceExtensions(deviceExtensionCount);
vkEnumerateDeviceExtensionProperties(physicalDevice, nullptr, &deviceExtensionCount, availableDeviceExtensions.data());

for (int i = 0; i < requiredDeviceExtensions.size(); ++i)
{
    bool extensionFound = false;
    for (int j = 0; j < availableDeviceExtensions.size(); ++j)
    {
        if (std::strcmp(availableDeviceExtensions[j].extensionName, requiredDeviceExtensions[i]) == 0)
        {
            extensionFound = true;
            break;
        }
    }
    if (!extensionFound)
    {
        printf("Extension: %s not available in your GPU, exiting...\n", requiredDeviceExtensions[i]);
        return 1;
    }
}
```

Nothing new here, we query all extensions via `vkEnumerateDeviceExtensionProperties` and just follow the same thing we did before while checking for extensions.

Now lets just tell the struct to enable that extension -

```cpp
deviceInfo.enabledExtensionCount = static_cast<uint32_t>(requiredDeviceExtensions.size());
deviceInfo.ppEnabledExtensionNames = requiredDeviceExtensions.data();
```

Now theres that last `pEnabledFeatures` field. This specifies about what device features (not properties, they are different) we need to enable. Right now, we don't need any as we aren't doing much but will surely enable them later on :)

```cpp
// Disabling device features for now, optional to do since {} initializes it to nullptr anyways
deviceInfo.pEnabledFeatures = nullptr;
```

## Creating the Device

And…… thats pretty much it, now lets just create the device -

```cpp
// hellovulkan.cpp
if (vkCreateDevice(physicalDevice, &deviceInfo, nullptr, &device) != VK_SUCCESS)
{
    printf("failed to create logical device. exiting...\n");
    return 1;
}
printf("Created logical device\n");
```

## Retrieving Queue Handles

Ok one more thing, we need to retrieve handles to the queues as there's gonna be use of them later.

```cpp
// hellovulkan.cpp
VkQueue graphicsQueue;
vkGetDeviceQueue(device, graphicsFamilyIndex, 0, &graphicsQueue);

VkQueue presentQueue;
vkGetDeviceQueue(device, presentFamilyIndex, 0, &presentQueue);
```

We retrieve the queue via `vkGetDeviceQueue`, which takes in device handle, queue family index, queue index and address of the handle as parameters.
We set queue index to 0 because we specified before that we need only 1 queue while creating queue infos.

:::note
Since its a handle that we retrieved not created explicitly, no need to destroy it. Queue handles are automatically cleaned up when the device is destroyed.
:::

## Cleanup

Last thing left to do is destroy the device. Make sure to destroy it before destroying instance.

```cpp
// hellovulkan.hpp
// cleanup
vkDestroyDevice(device, nullptr);
printf("Destroyed Device\n");
vkDestroySurfaceKHR(instance, surface, nullptr);
printf("Destroyed Surface\n");
destroyDebugMessenger(instance, debugMessenger);
printf("Destroyed Debug messenger\n");
vkDestroyInstance(instance, nullptr);
printf("Destroyed Instance\n");
```

## Creating a Function

Ok that was a huge chapter, we did a lot. Now lets create a function or functions to be precise.
We already created a function before for retrieving queue family indices.
Next is going to be device creation -

```cpp
// boilerplate.hpp

bool createDevice(VkPhysicalDevice physicalDevice, const uint32_t graphicsFamilyIndex, const uint32_t presentFamilyIndex, VkDevice *pDevice)
{
    VkDeviceCreateInfo deviceInfo = {};
    deviceInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;

    // vector holding all the queue infos
    std::vector<VkDeviceQueueCreateInfo> queueInfos;

    float queuePriority = 1.0f;
    if (graphicsFamilyIndex == presentFamilyIndex)
    {
        VkDeviceQueueCreateInfo queueInfo = {};
        queueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queueInfo.queueFamilyIndex = graphicsFamilyIndex;
        queueInfo.queueCount = 1;
        queueInfo.pQueuePriorities = &queuePriority;
        queueInfos.push_back(queueInfo);
    }
    else
    {
        VkDeviceQueueCreateInfo graphicsQueueInfo = {};
        graphicsQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        graphicsQueueInfo.queueFamilyIndex = graphicsFamilyIndex;
        graphicsQueueInfo.queueCount = 1;
        graphicsQueueInfo.pQueuePriorities = &queuePriority;

        VkDeviceQueueCreateInfo presentQueueInfo = {};
        presentQueueInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        presentQueueInfo.queueFamilyIndex = presentFamilyIndex;
        presentQueueInfo.queueCount = 1;
        presentQueueInfo.pQueuePriorities = &queuePriority;

        queueInfos.push_back(graphicsQueueInfo);
        queueInfos.push_back(presentQueueInfo);
    }

    deviceInfo.queueCreateInfoCount = static_cast<uint32_t>(queueInfos.size());
    deviceInfo.pQueueCreateInfos = queueInfos.data();

    // Device Features — enable dynamic rendering
    VkPhysicalDeviceVulkan13Features features13 = {};
    features13.sType = VK_STRUCTURE_TYPE_PHYSICAL_DEVICE_VULKAN_1_3_FEATURES;
    features13.dynamicRendering = VK_TRUE;
    features13.pNext = nullptr;

    deviceInfo.pNext = &features13;

    // enable swapchain extension
    const std::vector<const char*> requiredDeviceExtensions = {
        VK_KHR_SWAPCHAIN_EXTENSION_NAME
    };

    uint32_t deviceExtensionCount = 0;
    vkEnumerateDeviceExtensionProperties(physicalDevice, nullptr, &deviceExtensionCount, nullptr);
    std::vector<VkExtensionProperties> availableDeviceExtensions(deviceExtensionCount);
    vkEnumerateDeviceExtensionProperties(physicalDevice, nullptr, &deviceExtensionCount, availableDeviceExtensions.data());

    for (int i = 0; i < requiredDeviceExtensions.size(); ++i)
    {
        bool extensionFound = false;
        for (int j = 0; j < availableDeviceExtensions.size(); ++j)
        {
            if (std::strcmp(availableDeviceExtensions[j].extensionName, requiredDeviceExtensions[i]) == 0)
            {
                extensionFound = true;
                break;
            }
        }
        if (!extensionFound)
        {
            printf("Extension: %s not available in your GPU, exiting...\n", requiredDeviceExtensions[i]);
            return false;
        }
    }

    deviceInfo.enabledExtensionCount = static_cast<uint32_t>(requiredDeviceExtensions.size());
    deviceInfo.ppEnabledExtensionNames = requiredDeviceExtensions.data();

    deviceInfo.pEnabledFeatures = nullptr;

    if (vkCreateDevice(physicalDevice, &deviceInfo, nullptr, pDevice) != VK_SUCCESS)
    {
        printf("failed to create logical device. exiting...\n");
        return false;
    }
    printf("Created logical device\n");
    return true;
}
```

Replace all device creation code with this -

```cpp
// hellovulkan.cpp

// Logical Device
VkDevice device = VK_NULL_HANDLE;
if (!createDevice(physicalDevice, graphicsFamilyIndex, presentFamilyIndex, &device))
    return 1;
```

And at last, retrieving queue handles -

```cpp
// boilerplate.hpp

void retrieveQueueHandles(VkDevice device, const uint32_t graphicsFamilyIndex, const uint32_t presentFamilyIndex, VkQueue *pGraphicsQueue, VkQueue *pPresentQueue)
{
    vkGetDeviceQueue(device, graphicsFamilyIndex, 0, pGraphicsQueue);
    vkGetDeviceQueue(device, presentFamilyIndex, 0, pPresentQueue);
}
```

Replace main code with just this -

```cpp
// hellovulkan.cpp
// Retrieve queue handles
VkQueue graphicsQueue;
VkQueue presentQueue;
retrieveQueueHandles(device, graphicsFamilyIndex, presentFamilyIndex, &graphicsQueue, &presentQueue);
```

Compile and see if everything is fine. 