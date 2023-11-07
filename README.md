# be-computed [WIP]


<!-- [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/be-switched)  -->
[![Playwright Tests](https://github.com/bahrus/be-computed/actions/workflows/CI.yml/badge.svg)](https://github.com/bahrus/be-computed/actions/workflows/CI.yml) 
[![NPM version](https://badge.fury.io/js/be-computed.png)](http://badge.fury.io/js/be-computed)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-computed?style=for-the-badge)](https://bundlephobia.com/result?p=be-computed)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-computed?compression=gzip">

Compute values from other HTML signals via local script tags.

## Special Symbols

In the examples below, we will encounter special symbols used in order to keep the statements small:

| Symbol      | Meaning              | Notes                                                                                |
|-------------|----------------------|--------------------------------------------------------------------------------------|
| /propName   |"Hostish"             | Attaches listeners to getters/setters.                                               |
| @propName   |Name attribute        | Listens for input events.                                                            |
| $propName   |Itemprop attribute    | If contenteditible, listens for input events.  Otherwise, uses be-value-added.       |
| #propName   |Id attribute          | Listens for input events.                                                            |
| -prop-name  |Marker indicates prop | Attaches listeners to getters/setters.                                               |


"Hostish" means:

1.  First, do a "closest" for an element with attribute itemscope, where the tag name has a dash in it.  Do that search recursively.  
2.  If no match found, use getRootNode().host.

## Example 1a -- compact notation [TODO]

```html
<div itemscope>
    <link itemprop=isHappy>
    <link itemprop=isWealthy>

    ...
    
    <link itemprop=isInNirvana be-computed='from $isHappy, $isWealthy via onload script.' 
        onload="return isHappy && !isWealthy">
</div>
```

## Example 1b

```html
<div itemscope>
    <link itemprop=isHappy>
    <link itemprop=isWealthy>

    ...

    <script nomodule>
        isHappy && !isWealthy
    </script>
    <link itemprop=isInNirvana be-computed='from $isHappy, $isWealthy.'>
</div>
```

## Example 1c

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        isHappy && !isWealthy && liberated.length > 17
    </script>
    <link itemprop=isInNirvana be-computed='from $isHappy, @isWealthy, #liberated.'>
</form>
```

## Example 1d

Add more context to the scripting

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({isHappy, isWealthy, liberated}) => {
            console.log({isHappy, isWealthy, liberated});
            return isHappy && !isWealthy && liberated.length > 17;
        }
    </script>
    <link itemprop=isInNirvana be-computed='from $isHappy, @isWealthy, #liberated.'>
</form>
```

## Example 1e

Values coming from host.

```html
<my-custom-element>
    #shadow
        <script nomodule>
            myProp ** 2
        </script>
        <data itemprop=squared be-computed='from /myProp.'>
        <be-hive></be-hive>
</my-custom-element>
```

The slash is optional, so this will also work:

## Example 1f
Values coming from host.

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

## Example 1g

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

## Example 2a

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({
            prop1: isHappy && !isWealthy && liberated.length > 17,
            prop2: liberated.blink(),
        })
    </script>
    <any-element itemprop=isInNirvana be-computed='from $isHappy, @isWealthy, #liberated.'></any-element>
</form>
```

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