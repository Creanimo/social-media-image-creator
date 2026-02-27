* This is a webapp to create images for social media.
* The user puts different types of layers over a background image.
* There are preset assets for the user to choose from and for the app to fetch default states from.
* The editor canvas is an iframe. There is a live preview pipeline to update the canvas from the editor sidebar without reloading the page.
* The code follows a model, view, controller architecture.
* Mustache is the templating engine.
* Split code into isolated modules when possible.
* There is a dependency injection in util/ with id generator, image blob handler and user preference storage.
* High-level business logic is located in service/ (e.g., importers, exporters, factories).
* UI-to-model adapters are located in adapter/ (e.g., form adapters).
* Pass the dependency injection to classes so dependencies can be mocked in tests.
* Use modern ES6 javascript. Use immer to make immutable objects.
* Ingested assets and user creations are saved in the browser's IndexedDB.
* Use jsdoc for documentation and type hinting.
* There are no unit tests yet. Later we will use mocha, chai and karma (to test IndexedDB related functions in a real browser).