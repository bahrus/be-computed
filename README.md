# be-computed [WIP]


<!-- [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/be-switched)  -->
[![Playwright Tests](https://github.com/bahrus/be-computed/actions/workflows/CI.yml/badge.svg)](https://github.com/bahrus/be-computed/actions/workflows/CI.yml) 
[![NPM version](https://badge.fury.io/js/be-computed.png)](http://badge.fury.io/js/be-computed)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-computed?style=for-the-badge)](https://bundlephobia.com/result?p=be-computed)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-computed?compression=gzip">

Compute values from other HTML signals via local script tags.

*be-computed* is very close in purpose to [be-overloading](https://github.com/bahrus/be-overloading).  *be-overloading* focuses more on user-initiated event driven reactions.  *be-computed* is more focused on observing peer elements (and/or the host) and calculating values based on these dependencies reactively. 

## Special Symbols

In the examples below, we will encounter special symbols used in order to keep the statements small, as far as identifying which elements to pull in property values from, and observing those elements for property value changes:

| Symbol      | Meaning              | Notes                                                                                                                                       |
|-------------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| /propName   |"Hostish"             | Attaches listeners to getters/setters on properties of "hostish".                                                                           |
| @propName   |Name attribute        | Listens for input events on form elements based on matching the name attribute.                                                             |
| $propName   |Itemprop attribute    | Matches element based on matching itemprop attribute.  If contenteditible, listens for input events.  Otherwise, uses be-value-added.       |
| #propName   |Id attribute          | Matches element based on id within ShadowDOM realm.  Listens for input events.                                                              |
| -prop-name  |Marker indicates prop | Matches elements based on finding the exact attribute starting with a dash.  Attaches listeners to getters/setters.                         |


"Hostish" means:

1.  First, do a "closest" for an element with attribute itemscope, where the tag name has a dash in it.  Do that search recursively.  
2.  If no match found, use getRootNode().host.

## Example 1a -- Locality of behavior notation with inline expression

```html
<div itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <link itemprop=isWealthy href=https://schema.org/False>

    ...
    
    <link itemprop=isInNirvana 
        onload="isHappy && !isWealthy"
        be-computed='from onload expression, passing in $isHappy, $isWealthy.' 
    >
</div>
```

What this does:

1.  Since the onload attribute expression doesn't start with export const ..., and doesn't start with an open parenthesis, *be-computed* wraps the expression like so:

```JavaScript
export const expr = ({isHappy, isWealthy}) => {
    return isHappy && !isWealthy;
}
```

2.  Since the return statement returns a primitive, it applies the value to the adorned element, based on context.  In this case, it sets:

```html
<link itemprop=isInNirvana href=https://schema.org/True>
```

if the conditions are met, and attaches the [be-value-added](https://github.com/bahrus/be-value-added) enhancement.

The value of the computation can be obtained via oLink.beEnhanced.beValueAdded.value.

## Example 1b -- Verbose notation with external script tag

```html
<div itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <link itemprop=isWealthy href=https://schema.org/False>

    ...

    <script nomodule>
        isHappy && !isWealthy
    </script>
    <link itemprop=isInNirvana be-computed='from previous script element expression, passing in $isHappy, $isWealthy.'>
</div>
```

Advantages of using script element -- less issues with characters that cause problems inside an attribute, may get better IDE support.  Disadvantages -- a little further away, a little more verbose, if you need to move the element, need to remember to move the associated script element along with it.

## Example 1c -- compact notation with inline expression 

```html
<div itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <link itemprop=isWealthy href=https://schema.org/False>

    ...
    
    <link itemprop=isInNirvana 
        onload="isHappy && !isWealthy" 
        be-computed='from $isHappy, $isWealthy.' 
    >
</div>
```

## Example 1d -- compact notation with external script tag 

```html
<div itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <link itemprop=isWealthy href=https://schema.org/False>

    ...

    <script nomodule>
        isHappy && !isWealthy
    </script>
    <link itemprop=isInNirvana be-computed='from $isHappy, $isWealthy.'>
</div>
```

## Example 1e -- bind to named elements and id'd elements
```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...
    <link itemprop=isInNirvana
      onload="isHappy && !isWealthy && liberated?.length > 17"
      be-computed='from $isHappy, @isWealthy, #liberated.'
    >
</form>
```

## Example 1f -- Add more context to the scripting


```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <link itemprop=isInNirvana 
        onload="
            ({isHappy, isWealthy, liberated}) => {
                console.log({isHappy, isWealthy, liberated});
                return isHappy && !isWealthy && liberated?.length > 17;
            }
        "
        be-computed='from $isHappy, @isWealthy, #liberated.'
    >
</form>
```

Since the expression starts with open parenthesis, wrapping is more lightweight.  Just adds export const default.

## Example 1g

Specify export symbol

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <link itemprop=isInNirvana 
        onload="
            export const calculateInNirvana = ({isHappy, isWealthy, liberated}) => {
                console.log({isHappy, isWealthy, liberated});
                return isHappy && !isWealthy && liberated?.length > 17;
            }
        "
        be-computed='from onload export of calculateInNirvana, passing in $isHappy, @isWealthy, #liberated.'
    >
</form>
```

This allows for multiple expressions that can be used by different enhancements.


## Example 1h -- Values coming from host. [TODO]

```html
<my-custom-element>
    #shadow
        <script nomodule>
            myProp ** 2
        </script>
        <data itemprop=squared be-computed='from /numValue.'></data>
        <be-hive></be-hive>
</my-custom-element>
```

The slash is optional, so this will also work:

## Example 1i -- Values coming from host, take II. [TODO]

```html
<my-custom-element>
    #shadow
        <script nomodule>
            myProp ** 2
        </script>
        <data itemprop=squared be-computed='from myProp.'>
        <be-hive></be-hive>
</my-custom-element>
```

## Example 1j [TODO]

Value coming from marker

```html
<form itemscope>
    <my-custom-element -num-value></my-custom-element>
    

    <script nomodule>
        numValue ** 2
    </script>
    <meta itemprop=square be-computed='from -num-value.'>
</form>
```

## Example 2a Assigning objects, verbose notation, external script

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({
            prop1: isHappy && !isWealthy && liberated?.length > 17,
            prop2: liberated?.blink()
        })
    </script>
    <any-element itemprop=isInNirvana be-computed='from previous script element expression, passing in $isHappy, @isWealthy, #liberated, and assign result.'></any-element>
</form>
```

Detecting such expressions:  Starts and ends with ({...}), no arrow.  If need to use arrow functions inside, need to provide the context.

## Example 2b Assigning objects, compact notation, external script

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        {
            prop1: isHappy && !isWealthy && liberated?.length > 17,
            prop2: liberated?.blink()
        }
    </script>
    <any-element itemprop=isInNirvana be-computed='from $isHappy, @isWealthy, #liberated, and assign result.'></any-element>
</form>
```

## Example 2c Assigning objects, verbose notation, inline attribute

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <any-element itemprop=isInNirvana
        onload="({
            prop1: isHappy && !isWealthy && liberated?.length > 17,
            prop2: liberated?.blink()
        })" 
        be-computed='from onload expression, passing in $isHappy, @isWealthy, #liberated, and assign result.'></any-element>
</form>
```

## Example 2d Assigning objects, compact notation, inline attribute [TODO]

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...
    <any-element itemprop=isInNirvana
        onload="
        {
            prop1: isHappy && !isWealthy && liberated?.length > 17,
            prop2: liberated?.blink()
        }
        " 
        be-computed='from $isHappy, @isWealthy, #liberated, and assign result.'>
    </any-element>
</form>
```

## Example 3a Support for inner transform, verbose notation [TODO] 


```html
<div itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <link itemprop=isWealthy href=https://schema.org/False>

    ...
    
    <div  
        onload="{isInNirvana: isHappy && isWealthy}"
        be-computed='from onload expression, passing in $isHappy, $isWealthy, and do data-xform transform.'
        data-xform='{
            "span": "isInNirvana"
        }'
        >
        <span></span>
    </div>
</div>
```

Uses DTR syntax (enhanced by be-linked for things like html signals, etc).

## Example 3b Support for inner transform, compact notation [TODO] 


```html
<div itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <link itemprop=isWealthy href=https://schema.org/False>

    ...
    
    <div  
        onload="{isInNirvana: isHappy && isWealthy}"
        be-computed='from $isHappy, $isWealthy, with xform.'
        data-xform='{
            "span": "isInNirvana"
        }'
        >
        <span></span>
    </div>
</div>
```

## Example 3b [TODO] Support for inner transform


```html
<div itemscope>
    <link itemprop=isHappy>
    <link itemprop=isWealthy>

    ...
    
    <div be-computed='apply data-xform transform on $isHappy, $isWealthy.' 
        data-xform='{
            "span": "isHappy",
            "article": "isWealthy"
        }'
        >
        <span></span>
        <article></article>
    </div>
</div>
```


[TODO] be-linked extends trans-render to support signals

## Viewing Your Element Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'be-computed/be-computed.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-computed';
</script>
```