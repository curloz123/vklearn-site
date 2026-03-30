---
title: Vulkan Instance
description: Initializing Vulkan by creating an instance and checking extension support
---

Now this chapter onwards, we will start Vulkan.

:::note
In Vulkan, we don't call Vulkan objects just "objects" — we call them **handles**. So whenever I say handle, I mean a Vulkan object.
:::

The very first thing we need to do is initialize Vulkan. And to do so, we need to create an **Instance**.

## Instance

An instance is the root — the foundation of any Vulkan application. It is the connection between our application and the Vulkan library.

Now let's start by creating the Vulkan instance. First add the Vulkan header:

```cpp
#include <vulkan/vulkan.h>
```


The first thing we do is create a `VkApplicationInfo` struct. This struct defines information about our application, and is defined like this - 
```c
typedef struct VkApplicationInfo {
    VkStructureType    sType;
    const void*        pNext;
    const char*        pApplicationName;
    uint32_t           applicationVersion;
    const char*        pEngineName;
    uint32_t           engineVersion;
    uint32_t           apiVersion;
} VkApplicationInfo;
```
The `.sType` member defines which structure is this. In this case since we are creating application info, we set it to `VK_STRUCTURE_TYPE_APPLICATION_INFO`.
Second variable is `pNext` which is a pointer extending this structure, not necessary right now, will teach this later.
Third, fourth and fifth variable defines the info about your engine. You can keep it anything as you want.
And at last is`apiVersion` where we define which API version we want to use. Since we want to use 1.3, we will set it to `VK_API_VERSION_1_3`.



You can read more about this struct here — [VkApplicationInfo](https://docs.vulkan.org/refpages/latest/refpages/source/VkApplicationInfo.html)

For now lets just write this much - 
```cpp
int main()
{
    // Window creation above

    // fill in data about our application
    VkApplicationInfo appInfo = {};

    // define which type of struct this is
    appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    // name of our application
    appInfo.pApplicationName = "Hello Vulkan";
    // our application's version
    appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    // our engine's name
    appInfo.pEngineName = "Any name you want";
    // which API version we want to use
    appInfo.apiVersion = VK_API_VERSION_1_3;

    // game loop below
}
```

:::note
In Vulkan, a lot of information is passed using structs like the one above. Although this may seem lengthy, the benefit is we can clearly state exactly what we want.
:::

:::tip
Always default initialize your structs with `{}` when creating any Vulkan struct. This makes the compiler initialize the entire struct to 0, which is much safer than leaving fields uninitialized.
:::

Next, we define instance creation information.
For this we create a `VkInstanceCreateInfo` struct which is defined like this - 
```c
typedef struct VkInstanceCreateInfo {
    VkStructureType             sType;
    const void*                 pNext;
    VkInstanceCreateFlags       flags;
    const VkApplicationInfo*    pApplicationInfo;
    uint32_t                    enabledLayerCount;
    const char* const*          ppEnabledLayerNames;
    uint32_t                    enabledExtensionCount;
    const char* const*          ppEnabledExtensionNames;
} VkInstanceCreateInfo;
```
The `flags` variable define what flags to enable. Flags indicate the behaviour of struct. Not necessasry right now, will teach this properly later when used.
`pApplicationInfo` takes pointer to `VkApplicationInfo` object. We will pass the one we just created.
The next two are for layers, we will disable this right now, but we will return to them in the next chapter.
The next two defines the extensions, these are important and i will teach them now.

For now just write this much
```cpp
// instance info
VkInstanceCreateInfo instanceInfo = {};
// struct type
instanceInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
// our application's info
instanceInfo.pApplicationInfo = &appInfo;
```


You can read more about this struct here — [VkInstanceCreateInfo](https://docs.vulkan.org/refpages/latest/refpages/source/VkInstanceCreateInfo.html)

## Extensions

Vulkan is pretty barebones by itself — right now it doesn't even know that we want to show something on screen. To handle this we pass **extensions** to it. In simple terms, extensions add functionality to Vulkan.

Right now the only extension we need is for Vulkan to interact with the window. GLFW has a built in function that returns all the extensions Vulkan needs:

```cpp
uint32_t glfwExtensionCount = 0;
const char** glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);
// pass extensions to instance creation info
instanceInfo.enabledExtensionCount = glfwExtensionCount;
instanceInfo.ppEnabledExtensionNames = glfwExtensions;
```
Pass the number of required extensions to `enabledExtensionCount` and all extensions to `ppEnabledExtensionNames`

:::tip
Whenever you pass any integer to Vulkan, make sure you check what type it accepts — most of the time it expects a `uint32_t`.
:::

We also need to tell Vulkan not to enable any layers right now — we will talk about these in the next chapter:

```cpp
instanceInfo.enabledLayerCount = 0;
```

Now that we have done all this, we can finally create our instance:

```cpp
VkInstance instance;
VkResult result = vkCreateInstance(&instanceInfo, nullptr, &instance);
```

We create an instance handle of type `VkInstance` and call [vkCreateInstance](https://docs.vulkan.org/refpages/latest/refpages/source/vkCreateInstance.html), which takes three parameters:

- **First** — pointer to our `VkInstanceCreateInfo`
- **Second** — custom memory allocator callback, we pass `nullptr` to use Vulkan's default allocator
- **Third** — pointer to our `VkInstance` handle

The function returns a `VkResult` enum. If successful it returns `VK_SUCCESS`:

```cpp
if (result != VK_SUCCESS)
{
    printf("Could not create instance, exiting....\n");
    return 1;
}
printf("Created instance\n");
```
You can read about all `VkResult` enums [here](https://docs.vulkan.org/refpages/latest/refpages/source/VkResult.html)

## Cleaning Up

In Vulkan, whatever objects we create manually, we need to destroy them ourselves too. Since we created an instance, we destroy it like this:

```cpp
vkDestroyInstance(instance, nullptr);
```

## Compiling

Now we need to compile our program — this time we also link the Vulkan library:

```bash
# Linux
g++ hellovulkan.cpp -o hellovulkan -L./lib -lglfw3 -ldl -lvulkan

# Windows
g++ hellovulkan.cpp -o hellovulkan -L./lib -lglfw3 -lgdi32 -luser32 -lkernel32 -lvulkan-1
```

Run the program and if everything went correctly you should see `Created instance` printed. Congratulations — you created your first Vulkan instance! 

## Checking for Extension Support

Remember that every hardware is different. A brand new graphics card like AMD's RX 9070 XT supports the latest versions of Vulkan, but older cards like NVIDIA's GT 740 only support up to Vulkan 1.2. Similarly there are numerous extensions available for Vulkan, but not every GPU supports them. So it's a good idea to check if the extensions we're enabling are actually supported.

We are also going to be enabling more extensions later, so it's better to store them in a separate vector:

```cpp
uint32_t glfwExtensionCount = 0;
const char** glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

// This time we will store all extensions in a vector, because later on we will add more extensions later and might not know the size then :(
std::vector<const char*> requiredExtensions;
for (int i = 0; i < glfwExtensionCount; ++i)
{
    requiredExtensions.emplace_back(glfwExtensions[i]);
}
```

Now query all available extensions:

```cpp
// query number of available extensions
uint32_t availableExtensionCount = 0;
vkEnumerateInstanceExtensionProperties(nullptr, &availableExtensionCount, nullptr);
std::vector<VkExtensionProperties> availableExtensions(availableExtensionCount);
vkEnumerateInstanceExtensionProperties(nullptr, &availableExtensionCount, availableExtensions.data());
```

We query available extensions via [vkEnumerateInstanceExtensionProperties](https://docs.vulkan.org/refpages/latest/refpages/source/vkEnumerateInstanceExtensionProperties.html):

- **First parameter** — name of the layer to retrieve extensions from. Usually `nullptr`, which returns extensions provided by the Vulkan implementation
- **Second parameter (`pPropertyCount`)** — pointer to a `uint32_t` that will receive the count
- **Third parameter (`pProperties`)** — array of `VkExtensionProperties` structures

If `pProperties` is `nullptr`, the available extension count is stored in `pPropertyCount`. If `pPropertyCount` is less than the total number of available extensions, only that many extensions are returned in `pProperties` and the function returns `VK_INCOMPLETE` instead of `VK_SUCCESS`. Otherwise all available extensions are returned in `pProperties`.

:::tip
This two-call pattern — first call to get the count, second call to get the actual data — is extremely common in Vulkan. You'll see it used for almost everything. Get used to it!
:::

Now let's check that all our required extensions are available:

```cpp
for (int i = 0; i < requiredExtensions.size(); ++i)
{
    bool found = false;
    for (int j = 0; j < availableExtensions.size(); ++j)
    {
        if (std::strcmp(requiredExtensions[i], availableExtensions[j].extensionName) == 0)
        {
            found = true;
            break;
        }
    }
    if (!found)
    {
        printf("Extension: %s not available, exiting....\n", requiredExtensions[i]);
        return 1;
    }
}
printf("All required extensions present\n");
```

Pass the extensions to the instance creation info:

```cpp
instanceInfo.enabledExtensionCount = static_cast<uint32_t>(requiredExtensions.size());
instanceInfo.ppEnabledExtensionNames = requiredExtensions.data();
```

## Creating a Function

As you can see, creating something as simple as an instance already takes a decent amount of lines. Later there are going to be things that take even more. So it's better to create a function for this.

Create a file named `boilerplate.hpp`:

```cpp
#pragma once


#include <vulkan/vulkan.h>
#include <vector>
#include <cstdio>
#include <cstring>

bool createInstance(VkInstance* pInstance, const std::vector<const char*>& requiredExtensions)
{
    // application info
    VkApplicationInfo appInfo = {};
    appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    appInfo.pApplicationName = "Hello Vulkan";
    appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.pEngineName = "Any name you want";
    appInfo.apiVersion = VK_API_VERSION_1_3;

    // instance info
    VkInstanceCreateInfo instanceInfo = {};
    instanceInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    instanceInfo.pApplicationInfo = &appInfo;

    // query available extensions
    uint32_t availableExtensionCount = 0;
    vkEnumerateInstanceExtensionProperties(nullptr, &availableExtensionCount, nullptr);
    std::vector<VkExtensionProperties> availableExtensions(availableExtensionCount);
    vkEnumerateInstanceExtensionProperties(nullptr, &availableExtensionCount, availableExtensions.data());

    // check all required extensions are available
    for (int i = 0; i < requiredExtensions.size(); ++i)
    {
        bool found = false;
        for (int j = 0; j < availableExtensions.size(); ++j)
        {
            if (std::strcmp(requiredExtensions[i], availableExtensions[j].extensionName) == 0)
                found = true;
        }
        if (!found)
        {
            printf("Extension: %s not available, exiting....\n", requiredExtensions[i]);
            return false;
        }
    }
    printf("All required extensions present\n");

    // pass extensions
    instanceInfo.enabledExtensionCount = static_cast<uint32_t>(requiredExtensions.size());
    instanceInfo.ppEnabledExtensionNames = requiredExtensions.data();

    // disable layers for now
    instanceInfo.enabledLayerCount = 0;

    VkResult result = vkCreateInstance(&instanceInfo, nullptr, pInstance);
    if (result != VK_SUCCESS)
    {
        printf("Could not create instance, exiting....\n");
        return false;
    }
    printf("Created instance\n");
    return true;
}
```

Remove all the instance creation code from `hellovulkan.cpp` and replace it with:

```cpp
#include "boilerplate.hpp"

int main()
{
    // Window creation code above

    uint32_t glfwExtensionCount = 0;
    const char** glfwExtensions = glfwGetRequiredInstanceExtensions(&      glfwExtensionCount);

    std::vector<const char*> requiredExtensions;
    for (int i = 0; i < glfwExtensionCount; ++i)
    {
        requiredExtensions.emplace_back(glfwExtensions[i]);
    }

    kInstance instance;
    if (!createInstance(&instance, requiredExtensions))
        return 1;

    // game loop below
}
```

:::note
Defining functions in a header file is not good C++ practice. Every tutorial is made for readability and learning, and might not follow best C++ practices. Once you are comfortable with Vulkan, I'd recommend looking into proper C++ project organization. One of the methods to avoid this violation is to make the function inline, read more about them [here](https://www.learncpp.com/cpp-tutorial/inline-functions-and-variables/)
:::

Compile and see if everything is working fine. 

**[Source Code is available here](https://codeberg.org/curl0z/vklearn/src/branch/master/Getting%20Started/Instance)**
## Extra Resources

| Resource | Description |
|---|---|
| [Vulkan-tutorial — Instance](https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Instance) | Vulkan-tutorial's equivalent chapter, good reference |   
