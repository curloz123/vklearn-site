---
title: Validation Layers
description: Setting up Vulkan validation layers and a custom debug messenger
---

So vulkan is minimalistic, barebones bla bla, we all know that. We also know that it gives programmers a lot of control. Now problem if we humans are going to handle so much, its natural we are going to make mistakes. Now thing is vulkan being minimalistic has very limited checking in their API by default. Remember how we used to set the `.sType` of each struct manually. Say we set .sType of VkInstanceCreateInfo to `VK_STRUCTURE_TYPE_APPLICATION_INFO` ?? Thats very much is possible and can lead to UB's (Undefined Behaviours) or unknown crashes.
So to tackle this, guys at LunarG(creators of the vulkan SDK btw) created an elegant system for this known as validation layers. 
Validation layers sit between your API calls and the driver so that every API call you make passes through the layers before hitting the driver. You can pretty much call them vulkan's debugger(Not totally the correct term but helpful to think of them that way). 
Some common use cases of validation layers are : 
- Checking the values of parameters against the specification to detect misuse 
- Tracking creation and destruction of objects to find resource leaks 
- Checking thread safety by tracking the threads that calls originate from 
- Logging every call and its parameters to the standard output 
- Tracing Vulkan calls for profiling and replaying 

Ofourse validation layers does not come by default with vulkan, but LunarG's SDK for windows have them in built and on Linux most distros ship them differently so make sure you installed the layers package.

### Enabling validation layers
Now that all the theory is done, lets start integrating em into our project.

```cpp
// hellovulkan.cpp

const std::vector<const char*> validationLayers = 
{
    "VK_LAYER_KHRONOS_validation"
};
```

Like extensions, validation layers need to be enabled via their name. Ofcourse you are not going to enable each of them manually. Most of the generally used validation layers have been bundled into one layer known as `VK_LAYER_KHRONOS_validation` and most probably you will never need to enable anything else explicitly.
Again, Since every hardware is different, like extensions we need to check for their support too - 

```cpp
// hellovulkan.cpp

// check layers support
uint32_t layerCount = 0;
vkEnumerateInstanceLayerProperties(&layerCount, nullptr);
std::vector<VkLayerProperties> availableLayers(layerCount);
vkEnumerateInstanceLayerProperties(&layerCount, availableLayers.data());

for (const char* requiredLayer : validationLayers)
{
    bool layerFound = false;
    for (const VkLayerProperties &layerProperty : availableLayers)
    {
        if (std::strcmp(requiredLayer, layerProperty.layerName) == 0)
            layerFound = true;
        break;
    }
    if (!layerFound)
    {
        printf("Requested Layer: %s, Not available, Exiting....\n", requiredLayer);
        return 1;
    }
}
printf("All requested are present\n");

// Instance creation
// ...
```

We retrieve all the available layers [vkEnumerateInstanceLayerProperties](https://docs.vulkan.org/refpages/latest/refpages/source/vkEnumerateInstanceLayerProperties.html)
and using our same ol two call pattern, and store them in a vector.
Then again like extensions, we check if the requested layer is available or not. The reason for looping over our requested validation layers even though there's only 1 is because what if we enable more later. Ofcourse thats unlikely, but still, its a good practice.
Lets head over to instance creation, where if you remember I asked you to disable layers. We need to enable them now. Modify the instance creation function to also accept layers as a parameter. 

```cpp
// initializers.hpp

bool createInstance(VkInstance *pInstance, const std::vector<const char*> &requiredExtensions, const std::vector<const char*> &validationLayers)
```

Now enable them by passing in the VkInstanceCreateInfo struct

```cpp
// initializers.hpp
{
    // ...

    // Enable layers
    instanceInfo.enabledLayerCount = validationLayers.size();
    instanceInfo.ppEnabledLayerNames = validationLayers.data();
    
    // ...
}
```

Now compile the program, and see if you pass the layer check.

## Our own debug message printer.

Well, validation layers are quite verbose by default. Meaning that they will print out anything they see over the course of program. Even handle's creation!!
Now ofcourse its no problem, but its better we just print out messages that maybe or actually are harmful for our program. 
Thats why we will create our own messenger that will print only important messages.

### Enabling Extension
First we need to enable an extension named : `VK_EXT_debug_utils`.
This extension allows the functionality to create our own debug messengers.

```cpp
// hellovulkan.cpp
// Instance creation
uint32_t glfwExtensionCount = 0;
// Get all the required extensions.
const char **glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

// Create separate for storing required extensions
std::vector<const char *> requiredExtensions;
for (int i=0; i<glfwExtensionCount; ++i)
{
    requiredExtensions.emplace_back(glfwExtensions[i]);
}

// debug messenger extension
requiredExtensions.emplace_back(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);
```

Notice how I wrote `VK_EXT_DEBUG_UTILS_EXTENSION_NAME` instead of directly writing `VK_EXT_debug_utils`. These macros are just made to avoid typos.

### Callback Function
Lets create the `callback function` in a new file named debugmessenger.hpp (or anything you want)
:::note
A callback function is a function passed into another function as an argument, which is then invoked inside the outer function to complete some kind of routine or action. For example here the routine is whenever validation layers need to print anything. And vulkan will take pointer to our callback function and call it by passing its relevant parameters.
:::

```cpp
// debugmessenger.hpp
#pragma once
#include <vulkan/vulkan.h>
#include <cstdio>

VKAPI_ATTR VkBool32 VKAPI_CALL printMessage(
VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
VkDebugUtilsMessageTypeFlagsEXT messageType,
const VkDebugUtilsMessengerCallbackDataEXT* pMessageData,
void* pUserData) 
{
    printf("Validation Layer: %s\n", pMessageData->pMessage);

    return VK_FALSE;
}
```

Ok first off don't be scared, this function is not as scary as it looks.

First the `VKAPI_ATTR` and `VKAPI_CALL` are signatures telling vulkan that we need you(vulkan) to use this function.
The return type is `VkBool32` (vulkan's inbuilt true and false). This is required to tell vulkan whether we want to quit the program or not. Since we are using validation layers for only debugging purposes, we don't want our program to quit, thus we tell vulkan not to quit via VK_FALSE (VK_TRUE if you do want to).

Next, the arguments...

The first argument is `VkDebugUtilsMessageSeverityFlagBitsEXT` enum (name is unbearably long). Its nothing, just defines how severe the message is. It can have following values: 
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT`: Diagnostic messages, least severe, things like handle creation notifications
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT`: Informational message like the creation of any handle etc…..
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT`: Message about behavior that is not necessarily an error, but very likely a bug in your application and can cause issues
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT`: Message about behavior that is invalid and will likely cause crashes

A good thing about this enum is that you can kind of rank the messages as per their severity. Means we can do this

```cpp
// debugmessenger.hpp
if (messageSeverity >= VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT) {
    // Message is important enough to show :)))))
}
```

Next is the `VkDebugUtilsMessageTypeFlagsEXT` enum (wtf is it with the names), which states the type of message we have received. It can have following values
- `VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT`: Some event has happened that is unrelated to the specification or performance 
- `VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT`: Something has happened that violates the specification or indicates a possible mistake 
- `VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT`: Potential non-optimal use of Vulkan 

We are not going to use this, We just print whatever message we get just based on its severity. 

Last is `VkDebugUtilsMessengerCallbackDataEXT` struct ( T_T ) which contains the actual data about our message.
It has following members 
- `pMessage`: The actual message
- `pObjects`: Array of Vulkan object handles related to the message 
- `objectCount`: Number of objects in array

Finally, the `pUserData` (finally something short), contains a pointer that was specified during the setup of the callback and allows you to pass your own data to it. It is generally used in engines with their own loggers, not really necessary for this tutorial.

Well, now that the mammoth of a function has been completed, this is how it should look like

```cpp
// debugmessenger.hpp
VKAPI_ATTR VkBool32 VKAPI_CALL printMessage(
VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
VkDebugUtilsMessageTypeFlagsEXT messageType,
const VkDebugUtilsMessengerCallbackDataEXT* pMessageData,
void* pUserData) 
{
    if (messageSeverity >= VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT)
        printf("Validation Layer: %s\n", pMessageData->pMessage);

    return VK_FALSE;
}
```

Ok now that we have finally created the callback function, we need to tell vulkan about it.

### Creating Debug Messenger
Create another function named createDebugMessenger - 

```cpp
// debugmessenger.hpp
VkResult createDebugMessenger(VkInstance instance, VkDebugUtilsMessengerEXT *pDebugMessenger)
{
    // Our code
}
```

Our return type is going to be VkResult, and the function takes two arguments. First is the instance. 
Except instance creation(obviously), almost every handle you create will require instance.
Second is pointer to our actual debug messenger handle. Data type of debug messenger is `VkDebugUtilsMessengerEXT`.
Now again since its a handle, we need to first create its info via `VkDebugUtilsMessengerCreateInfoEXT`, defined in vulkan headers like this -

```cpp
typedef struct VkDebugUtilsMessengerCreateInfoEXT {
    VkStructureType                         sType;
    const void*                             pNext;
    VkDebugUtilsMessengerCreateFlagsEXT     flags;
    VkDebugUtilsMessageSeverityFlagsEXT     messageSeverity;
    VkDebugUtilsMessageTypeFlagsEXT         messageType;
    PFN_vkDebugUtilsMessengerCallbackEXT    pfnUserCallback;
    void*                                   pUserData;
} VkDebugUtilsMessengerCreateInfoEXT;
```

The `messageSeverity` flags define that severity of what levels are going to pass in our validation layers. Since we only concern ourselves with ones that can actually cause issues, we have to enable these three - `VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT` `VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT` `VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT`.
The `messageType` flag lets us filter what type of messages we need validation layers to print. Ofcourse since its not of our concern right now, we'll enable all.
The `pfnUserCallback` takes the actual callback function that we just created.
Read more about `VkDebugUtilsMessengerCreateInfoEXT` [here](https://docs.vulkan.org/refpages/latest/refpages/source/VkDebugUtilsMessengerCreateInfoEXT.html)

Now lets code this 

```cpp
// debugmessenger.hpp
VkResult createDebugMessenger(VkInstance instance, VkDebugUtilsMessengerEXT *pDebugMessenger)
{
    VkDebugUtilsMessengerCreateInfoEXT messengerInfo{};
    messengerInfo.sType = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
    messengerInfo.messageSeverity = 
        VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT | // Although I have enabled the VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT flag, it will get filtered out in the callback
        VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT | 
        VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
    messengerInfo.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
    messengerInfo.pfnUserCallback = printMessage;
    messengerInfo.pUserData = nullptr; // Optional

```

Ok so remember how validation layers are not actually a part of vulkan. Well this brings us to a problem. We cant just directly call vkCreateDebugMessenger(not real name, just using for reference) because it doesn't actually exist in the vulkan library. But we do know that it exist in our system as we did install them separately. So when we created instance, it dynamically loads all the relevant external libraries at runtime. 

:::note
This is why Vulkan separates instance creation from everything else — the instance tells the loader which layers and extensions to load, and only after that can you retrieve pointers to their functions.
:::


First we retrieve the function via the [vkGetInstanceProcAddr](https://docs.vulkan.org/refpages/latest/refpages/source/vkGetInstanceProcAddr.html).

This function takes in instance and name of the command to retrieve as parameters. This function returns the function as void pointer, so we need to convert it to relevant pointer to function data type. It returns NULL if function is not found.

```cpp
// debugmessenger.hpp
    PFN_vkCreateDebugUtilsMessengerEXT createMessenger = (PFN_vkCreateDebugUtilsMessengerEXT) vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT");
    if (createMessenger == NULL)
    {
        printf("Could not find the debug messenger creator function, Exiting....\n");
        return VK_ERROR_EXTENSION_NOT_PRESENT;
    }

    if (createMessenger(instance, &messengerInfo, nullptr, pDebugMessenger) != VK_SUCCESS)
    {
        printf("Could not create debug messenger, Exiting...\n");
        return VK_ERROR_EXTENSION_NOT_PRESENT;
    }

    printf("Created Debug Messenger\n");
    return VK_SUCCESS;
}
```
Since we want to retrieve debug messenger creator function, we pass `vkCreateDebugUtilsMessengerEXT`.

Finally we create our debug messenger AFTER creating the instance -

```cpp
// hellovulkan.cpp
VkInstance instance;
if (!createInstance(&instance, requiredExtensions, validationLayers))
    return 1;

VkDebugUtilsMessengerEXT debugMessenger;
if (createDebugMessenger(instance, &debugMessenger) != VK_SUCCESS)
    return 1;
```

Ofcourse, since we created it manually, we need to destroy it too. Similar to creation, we need to retrieve destruction function. Create a function named destroyDebugMessenger - 

```cpp
// debugmessenger.hpp
void destroyDebugMessenger(VkInstance instance, VkDebugUtilsMessengerEXT debugMessenger)
{
    PFN_vkDestroyDebugUtilsMessengerEXT destroyMessenger = (PFN_vkDestroyDebugUtilsMessengerEXT) vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT");
    if (destroyMessenger != NULL)
    {
        destroyMessenger(instance, debugMessenger, nullptr);
    }
}
```

and call this function BEFORE destroying the instance.

```cpp
// hellovulkan.cpp
// cleanup
destroyDebugMessenger(instance, debugMessenger);
vkDestroyInstance(instance, nullptr);
```

### Testing
Okay everything is done now, lets finally test if our hard work is fruitful - 
Temporarily comment out the `destroyDebugMessenger` function - 

```cpp
// hellovulkan.cpp
// cleanup
//destroyDebugMessenger(instance, debugMessenger);
vkDestroyInstance(instance, nullptr);
```

Now compile the code and run. If everything is done well, you should see validation layers throwing errors - 

```
❯ ./hellovulkan
All requested layers are present
All required extensions present
Created Instance
Created Debug Messenger
Validation Layer: vkDestroyInstance(): Object Tracking - For VkInstance 0x55cb1d7632e0, VkDebugUtilsMessengerEXT 0x10000000001 has not been destroyed.
The Vulkan spec states: All child objects that were created with instance or with a VkPhysicalDevice retrieved from it, and that can be destroyed or freed, must have been destroyed or freed prior to destroying instance (https://docs.vulkan.org/spec/latest/chapters/initialization.html#VUID-vkDestroyInstance-instance-00629)
Exiting.…
```
Well everything is completed, don't forget to uncomment `destroyDebugMessenger` after testing!


:::note
Since validation layers sit between the program and the drivers, every operation that we perform passes through validation layers. For debug purposes this is good, but this adds an extra overhead over every call which can result in slightly decreased performance. Just disable it whenever you ship something.
:::

Source Code is available **[here](https://github.com/curloz123/vklearn/tree/master/Getting%20Started/validation%20layers)**
## Extra Resources

| Resource | Description |
|---|---|
| [Vulkan-tutorial — Validation Layers](https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Validation_layers) | Vulkan-tutorial's equivalent chapter, good reference |   