### Merlin.json documentation

```
{
    "name": "@cnbritain/merlin-www-section-feature",
    "main": "feature",
    "currentTheme": null,
    "data": {
        "feature": "demo/data/feature.json"
    },
    "js": {
        "demo": "demo/demo.js"
    },
    "themes": {
        "wireframe": "sass/wireframe/wireframe.scss",
        "vogue": "sass/vogue/vogue.scss",
        "missvogue": "sass/missvogue/missvogue.scss",
        "wired": "sass/wired/wired.scss",
        "glamour": "sass/glamour/glamour.scss"
    },
    "partials": {
        "feature": "templates/section-feature.html"
    },
    "dependencies": [
        "@cnbritain/merlin-www-image"
    ]
}
```

##### name \<string>

The name of the component. This should match the name in package.json. All partials and data is stored under the name to avoid namespace collisions.

##### main \<string>

This is the key of the main component template in the `partials`  object.

##### currentTheme \<string>

The current theme of the project. This will be resolved in the sass importer where the keyword `:theme` has been used. It is best to leave this value as null in a component but set this value in the www app.

##### data \<object>

This is an object of data sources. The key represents a short name of the file. The input files **must** be json.

##### js \<object>

This is an object of js files. A reserved keyword of `demo` is used for all the demo preview pages.

##### themes \<object>

This is an object of sass files. The key represents the brand whos theme it is.

##### partials \<object>

This is an object of mustache partials. The key is the name of the partial.  These are imported into mustache.

##### dependencies \<array.\<string>>

This is a list of strings referencing other merlin-www-components.