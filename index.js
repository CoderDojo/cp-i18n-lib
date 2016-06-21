'use strict';

var fs = require('fs');
var path = require('path');
var po2json = require('po2json');
var Jed = require('jed');
var translators = {};
var poData = {};

function I18NHelper(options) {
  this.poFilePath = options.poFilePath;
  this.poFileName = options.poFileName || 'messages.po';
  this.domain = options.domain;
  this.defaultLocale = options.defaultLocale || 'en_US';
}

I18NHelper.prototype = {
  loadLocaleData: function (locale) {
    if (!translators[locale] && !poData[locale]) {
      if (!fs.existsSync(path.join(this.poFilePath, locale, this.poFileName))) {
        locale = this.defaultLocale;
      }
      poData[locale] = po2json.parseFileSync(path.join(this.poFilePath, locale, this.poFileName), {
        format: 'jed1.x',
        domain: this.domain
      });
      translators[locale] = new Jed(poData[locale]);
    }
  },

  getTranslator: function (locale) {
    this.loadLocaleData(locale);
    return translators[locale];
  },

  getPoData: function (locale) {
    this.loadLocaleData(locale);
    return poData[locale];
  },

  getClosestTranslation: function (locale, key) {
    var translation = null;
    if (this.translationExists(locale, key)) {
      translation = this.getTranslator(locale).translate(key);
    } else if (this.defaultTranslationExists(key)) {
      translation = this.getDefaultTranslation(key);
    }
    return translation;
  },

  getDefaultTranslation: function (key) {
    return this.getTranslator(this.defaultLocale).translate(key);
  },

  translationExists: function (locale, key) {
    return !!(this.getPoData(locale) && this.getPoData(locale).locale_data[this.domain] && this.getPoData(locale).locale_data[this.domain][key]);
  },

  defaultTranslationExists: function (key) {
    return !!this.getPoData(this.defaultLocale).locale_data[this.domain][key];
  }
};

module.exports = I18NHelper;