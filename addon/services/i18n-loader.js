import Ember from 'ember';

// @public
export default Ember.Service.extend({

    // @private
    _i18n: Ember.inject.service('i18n'),

    // @private
    _cache: Ember.A(),

    // @private
    _isCached(url) {
        return this.get('_cache').includes(url);
    },

    // @private
    _updateCache(url) {
        this.get('_cache').pushObject(url);
    },

    // @private
    _isAjaxSettingsValid(ajaxSettings) {
        return !Ember.isEmpty(ajaxSettings) && !Ember.isEmpty(ajaxSettings.url) && !Ember.isBlank(ajaxSettings.url);
    },

    // @private
    _getAjaxSettings(ajaxSettings) {
        return Object.assign(
            {
                cache: true,
                dataType: 'json',
                type: 'GET'
            },
            ajaxSettings
        );
    },

    // @private
    _fetchTranslations(ajaxSettings) {
        return Ember.$.ajax(this._getAjaxSettings(ajaxSettings));
    },

    // @private
    _loadTranslations(ajaxSettings) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const i18n = this.get('_i18n');
            return this._fetchTranslations(ajaxSettings)
                .then((json) => {
                    i18n.addTranslations(i18n.locale, json);
                    resolve();
                }, (error) => {
                    reject(error);
                });
        });
    },

    // @public
    load(ajaxSettings) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if (!this._isAjaxSettingsValid(ajaxSettings)) {
                resolve();
                return;
            }
            if (this._isCached(ajaxSettings.url)) {
                resolve();
                return;
            }
            return this._loadTranslations(ajaxSettings)
                .then(() => {
                    this._updateCache(ajaxSettings.url);
                    resolve();
                }, (error) => {
                    reject(error);
                });
        });
    }
});
