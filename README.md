# be-computed [TODO]

Compute values from other HTML signals via local script tags.

## Example 1a [TODO]

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

## Example 1b [TODO]

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

## Example 1c

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