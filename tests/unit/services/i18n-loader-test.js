import { moduleFor, test } from 'ember-qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import Ember from 'ember';

moduleFor('service:i18n-loader', 'Unit | Service | i18n loader', {
  unit: true,
  needs: ['service:i18n'],
  beforeEach() {
    let service = this.subject();
    service.set('_cache', Ember.A());
  }
});

// --------------------------------------------------------------------------------------------------

test('should check if cached', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const url = '/assets/i18n.json';
  service.get('_cache').push(url);

  assert.deepEqual(service._isCached(url), true, 'i18n was cached');
  assert.deepEqual(service._isCached('http://non-cached-i18n.json'), false, 'i18n was not cached');
});


// --------------------------------------------------------------------------------------------------

test('should update cache', function (assert) {
  assert.expect(1);

  let service = this.subject();

  const url = '/assets/j18n.json';

  service._updateCache(url);
  assert.deepEqual(
    service.get('_cache'),
    [
      url
    ]
  );
});

// --------------------------------------------------------------------------------------------------

test('should validate ajax settings', function (assert) {
  assert.expect(5);

  let service = this.subject();

  let ajaxSettings = null;
  assert.equal(service._isAjaxSettingsValid(ajaxSettings), false, 'ajaxSettings = null');

  ajaxSettings = {};
  assert.equal(service._isAjaxSettingsValid(ajaxSettings), false, 'ajaxSettings = {}');

  ajaxSettings = {
    url: null
  };
  assert.equal(service._isAjaxSettingsValid(ajaxSettings), false, 'ajaxSettings = { url: null }');

  ajaxSettings = {
    url: ''
  };
  assert.equal(service._isAjaxSettingsValid(ajaxSettings), false, 'ajaxSettings = { url: "" }');

  ajaxSettings = {
    url: '/assets/j18n.json'
  };
  assert.equal(service._isAjaxSettingsValid(ajaxSettings), true, 'ajaxSettings = { url: "/assets/j18n.json" }');
});

// --------------------------------------------------------------------------------------------------

test('should compute ajax settings', function (assert) {
  assert.expect(1);

  let service = this.subject();

  const settings = {
    url: '/assets/j18n.json'
  };

  assert.deepEqual(
    service._getAjaxSettings(settings),
    {
      cache: true,
      dataType: 'json',
      type: 'GET',
      url: '/assets/j18n.json'
    }
  );
});

// --------------------------------------------------------------------------------------------------

sinonTest('should fetch translations through AJAX call', function (assert) {
  assert.expect(3);

  let service = this.subject();

  const ajaxSettings = {
    url: '/assets/i18n.json'
  };
  const finalAjaxSettings = {
    cache: true,
    dataType: 'json',
    type: 'GET',
    url: ajaxSettings.url
  };
  const _getAjaxSettingsStub = this.stub(service, '_getAjaxSettings')
    .returns(finalAjaxSettings),
    _ajaxStub = this.stub(Ember.$, 'ajax').callsFake(() => {
      return new Ember.RSVP.Promise((resolve) => {
        resolve({ "name": "Name" });
      });
    });

  return service._fetchTranslations(ajaxSettings).then((response) => {
    assert.ok(_getAjaxSettingsStub.calledWith(ajaxSettings), 'ajax settings were retrieved');
    assert.ok(_ajaxStub.calledWith(finalAjaxSettings), 'ajax request was made');
    assert.deepEqual(response, { "name": "Name" }, 'received valid response');
  });
});

// --------------------------------------------------------------------------------------------------

sinonTest('should add translations to i18n', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const ajaxSettings = {
    url: '/assets/i18n-abc123pqr456.json'
  },
    i18nTranslations = {
      "name": "Name",
      "address": "Address"
    };

  const _fetchTranslationsStub = this.stub(service, '_fetchTranslations').returns(
    new Ember.RSVP.Promise((resolve) => {
      return resolve(i18nTranslations);
    })),
    _i18nAddTranslationsStub = this.stub(service.get('_i18n'), 'addTranslations').returns();

  return service._loadTranslations(ajaxSettings).then(() => {
    assert.ok(_fetchTranslationsStub.calledWith(ajaxSettings), 'i18n-JSON was fetched');
    assert.ok(_i18nAddTranslationsStub.calledWith('en', i18nTranslations), 'translations were added to i18n');
  });
});

// --------------------------------------------------------------------------------------------------

sinonTest('should handle error during translations adding to i18n', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const ajaxSettings = {
    url: '/assets/i18n.json'
  },
    fetchError = {
      message: "error"
    };

  this.stub(service, '_fetchTranslations').returns(
    new Ember.RSVP.Promise((resolve, reject) => {
      return reject(fetchError);
    }));
  const _i18nAddTranslationsStub = this.stub(service.get('_i18n'), 'addTranslations').returns();

  return service._loadTranslations(ajaxSettings).catch((responseError) => {
    assert.ok(_i18nAddTranslationsStub.notCalled, 'translations were not added');
    assert.deepEqual(responseError, fetchError, 'error was returned');
  });
});

// --------------------------------------------------------------------------------------------------

sinonTest('should not load translations if ajaxSettings are not valid', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const invalidAjaxSettings = {
    x: "y"
  };

  const _isAjaxSettingsValidStub = this.stub(service, '_isAjaxSettingsValid').returns(false),
    _isCached = this.spy(service, '_isCached');

  return service.load(invalidAjaxSettings).then(() => {
    assert.ok(_isAjaxSettingsValidStub.calledWith(invalidAjaxSettings), 'ajax settings validity was checked');
    assert.ok(_isCached.notCalled, '_isCached was not called');
  });
});

// --------------------------------------------------------------------------------------------------

sinonTest('should not load translations if translations were already loaded', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const ajaxSettings = {
    url: '/assets/i18n.json'
  };

  this.stub(service, '_isAjaxSettingsValid').returns(true);
  const _isCached = this.stub(service, '_isCached').returns(true),
    _loadTranslations = this.spy(service, '_loadTranslations');

  return service.load(ajaxSettings).then(() => {
    assert.ok(_isCached.calledWith(ajaxSettings.url), 'translations caching was checked');
    assert.ok(_loadTranslations.notCalled, '_loadTranslations was not called');
  });
});

// --------------------------------------------------------------------------------------------------

sinonTest('should load translations', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const ajaxSettings = {
    url: '/assets/i18n.json'
  },
    i18nTranslations = {
      "name": "Name",
      "address": "Address"
    };

  this.stub(service, '_isAjaxSettingsValid').returns(true);
  this.stub(service, '_isCached').returns(false);
  const _loadTranslations = this.stub(service, '_loadTranslations')
    .returns(new Ember.RSVP.Promise((resolve) => {
      resolve(i18nTranslations)
    })),
    _updateCache = this.stub(service, '_updateCache').returns();

  return service.load(ajaxSettings).then(() => {
    assert.ok(_loadTranslations.calledWith(ajaxSettings), 'translations were added to i18n');
    assert.ok(_updateCache.calledWith(ajaxSettings.url), 'cache was updated');
  });
});

// --------------------------------------------------------------------------------------------------

sinonTest('should handle error during translations loading', function (assert) {
  assert.expect(2);

  let service = this.subject();

  const ajaxSettings = {
    url: '/assets/i18n.json'
  },
    loadError = {
      message: "error"
    };

  this.stub(service, '_isAjaxSettingsValid').returns(true);
  this.stub(service, '_isCached').returns(false);
  this.stub(service, '_loadTranslations')
    .returns(new Ember.RSVP.Promise((resolve, reject) => {
      reject(loadError)
    }));
  const _updateCache = this.stub(service, '_updateCache').returns();

  return service.load(ajaxSettings).catch((error) => {
    assert.ok(_updateCache.notCalled, 'cache was not updated');
    assert.deepEqual(error, loadError, 'error was returned');
  });
});
