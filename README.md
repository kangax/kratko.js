<img src="http://dl.dropbox.com/u/822184/kratko_screenshot_1.png">

## What is this?

kratko.js helps you refactor Javascript. It takes an object and collects information about it. It lets you see which objects have too many methods, which methods do too many things, and accept too many arguments.

## How do I use it?

kratko.js defines 2 global objects — `Kratko` and `TableViewer`. `Kratko` is used for getting stats of an object — lengths of methods, lengths of method arguments, as well their average, minimum and maximum values. `TableViewer` provides simple UI to view those stats via HTML table.

## Which stats do I get?

`Kratko.getStatsFor()` returns an object with stats that looks like this:

    {
      methods: {
        name: {
          methodString: ...,
          length: ...,
          argsLength: ...
        }
      },
  
      totalMethodLength: ...,
  
      minMethodLength: ...,
      maxMethodLength: ...,
  
      totalArgsLength: ...,
  
      minArgsLength: ...,
      maxArgsLength: ...,
  
      numMethods: ...
    }

For example, if we have an object with 2 methods `foo` and `bar`:

    var obj = {
      foo: function(x, y) {
        return x + y;
      },
      bar: function(a, b, c, d, e, f, g) {
        if (true) {
          // some comment
          alert(123);
        }
      }
    };

Here's an output returned by `Kratko.getStatsFor`:

    {
      methods: {
        foo: {
          methodString: 'function (x, y) {\n  return x + y;\n}',
          length: 1,
          argsLength: 2
        },
        bar: {
          methodString: 'function (a, b, c, d, e, f, g) {\n  if (true) {\n    //some comment\n    alert(123);\n  }}',
          length: 3,
          argsLength: 7
        }
      },
      
      totalMethodLength: 4,
      minMethodLength: 1,
      maxMethodLength: 3,
      
      totalArgsLength: 9,
      minArgsLength: 2,
      maxArgsLength: 7,
      
      numMethods: 2
    }

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kangax/kratko.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

