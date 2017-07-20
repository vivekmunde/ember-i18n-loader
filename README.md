# ember-i18n-loader

This [Ember.js](https://emberjs.com) addon offers a wrapper service `i18n-loader` on top of the [ember-i18n](https://github.com/jamesarosen/ember-i18n) addon  to load the translation on demand or live using the [jQuery AJAX](http://api.jquery.com/jquery.ajax/). It extends the sample code available at [ember-i18n:Fetching-Translations-Live](https://github.com/jamesarosen/ember-i18n/wiki/Example:-Fetching-Translations-Live).

### Loading translations on demand

Multilingual large scale apps do not require to load translations for all supported languages as the app uses only one language at a time. In some cases, the complete set of translations for one language can be a heavy load task for initial load, as only current/initial screen/route translations are necessary, which can cause more delays on app load time. So its preferable to load the translations for only one language or in chunks (for single language) as they are required.

The translations can be loaded in the `beforeModel()` hook of the respective routes.

	i18nLoader: Ember.inject.service('i18n-loader'),
	beforeModel() {
	  return this.get('i18nLoader).load('locales/en/translations.json');
	}

### Demo @ [ember-i18n-loader-demo](https://github.com/vivekmunde/ember-i18n-loader-demo)

## .load(ajaxSettings)

`i18n-loader` service exposes a method `load(ajaxSettings)` to load the translations. 

#### **`ajaxSettings`**

A JSON object holding the AJAX settings for the i18n resource. This object must have at least `url` property set pointing to the location of i18n resource. The JSON object passed gets merged into the default AJAX settings and therefore the default AJAX settings can be overridden.

Default AJAX settings which can be overridden:

	{
	  cache: true,
	  dataType: 'json',
	  type: 'GET'
	}

The caller can pass:

	{
	  url: '/locales/en/translations.json',
	  headers: {
	    "Authorization": "bearer aXVmZ2hpdzg3eWZ1ZndmdWdiNDU1c29pdmpic29nNDU2NGZzYmVpZmhzaWY2NnVzZGhiaWpzaGI0NTZmdWdo"
	  }
	}

#### **Promise Based Response**

The service `i18n-loader` returns a promise, which gets resolved if the translations are loaded successfully otherwise rejected on any error.

#### **Caching**
The service `i18n-loader` remembers the translation urls to avoid loading the same translations for consequent requests for same url. 
Note: The service does not remember the translations key already loaded, instead it remembers the urls of the translation files like `/locales/en/abc.route.translations.json`.

## Example

The locales are stored under the `public/locales` directory of the app. 

	public
	|__locales
	   |__de
	      |__translations.json
	   |__en
	      |__translations.json	
	   |__fr
	      |__translations.json

Or further dividing them into smaller chunks.

	public
	|__locales
	   |__de
	      |__common.translations.json
	      |__product-management.translations.json
	      |__user-administration.translations.json
	   |__en
	      |__common.translations.json
	      |__product-management.translations.json
	      |__user-administration.translations.json
	   |__fr
	      |__common.translations.json
	      |__product-management.translations.json
	      |__user-administration.translations.json

The app can detect users's expected language in the application route and loads the translations.

*routes/application.js*

	i18n: Ember.inject.service(),
	i18nLoader: Ember.inject.service('i18n-loader'),
	beforeModel() {
	  // find the locale
	  const locale = navigator.language;
	  // set the i18n locale
	  this.set('i18n.locale', locale);
	  // load translations
	  return this.get('i18nLoader').load(`/locales/${locale}/translations.json`);
	}

## Caution

**AJAX Approach**: Browsers do not allow cross domain resource downloads through AJAX unless the server allows the requests through [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) settings. 

## Installation

* `git clone <repository-url>` this repository
* `cd ember-i18n-loader`
* `npm install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
