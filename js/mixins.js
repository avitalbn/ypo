
Ypo.Mixin = Ember.Mixin.create({
  lastUpdated: null,
  ticker: null,

  timeSinceLastUpdated: (function() {
    return (this.get('ticker') - this.get('lastUpdated')) / 1000;
  }).property('lastUpdated', 'ticker'),

  didLoad: function() {
    this.set('lastUpdated', Date.now());
    var self = this;
    setInterval({ self.set('ticker', Date.now()) }, 1000);
  }
});
