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

## Example 1c [TODO]

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

## Example 1d [TODO]

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

## Example 1e [TODO]

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