
// --- VIEWS ---

Ypo.Input = Ember.TextField.extend({
  classNames: ['input-block-level']  // TODO: move to html
});

Ypo.NavBarView = Ember.View.extend({  // {{{

  click: function(event){
    var con = this.get('controller');
    switch( event.target.id ){
      // --- NAV
      case 'nav-brand': 
      case 'nav-home': 
        con.goHome(); break;
      case 'nav-waypoints':
        con.goWaypoints(); break;
      case 'nav-anytimes':
        con.goAnytimes(); break;
      default: break;
    }
  },

  touchStart: function(event){
    this.click(event);
  }
});  // }}}

Ypo.DevBoxView = Ember.View.extend({  // {{{
  touchStart: function(event){
    var con = this.get('controller');
    switch( event.target.id ){
      // --- DEVBOX
      case 'showDevBox':
        con.showDevBox(); break;
      default: break;
    }
  }
});  // }}}


/*
  color: function() {
    return 'hi there: ' + this.get('controller.content.type');
  }.property('controller.content.type') 
    //<input id="wpInput" type="text" class="input-block-level"> placeholder={{type}}> -->
    */

/*
Ypo.DevboxView = Ember.View.extend({
  isVisibleBinding: 'controller.isVisible'  
});

Ypo.DevboxController = Ember.Controller.extend({
  isVisible: false,
  show: function() { this.set('isVisible', true); },
  hide:hide...
});
*/


