
// --- CONTROLLERS --- 

Ypo.NavBarController = Ember.Controller.extend({  // {{{

  isHomeActive: function(){
    return (Ypo.teamData.activeRoute === 'home') ? true : false;
  }.property('Ypo.teamData.activeRoute'),

  isWaypointsActive: function(){
    return (Ypo.teamData.activeRoute === 'waypoints') ? true : false;
  }.property('Ypo.teamData.activeRoute'),

  isAnytimesActive: function(){
    return (Ypo.teamData.activeRoute === 'anytimes') ? true : false;
  }.property('Ypo.teamData.activeRoute'),

  goHome: function(){
    Ypo.teamData.set('activeRoute', 'home');
    Ypo.teamData.save();
    this.transitionToRoute('home');           
  },

  goWaypoints: function(){
    Ypo.teamData.set('activeRoute', 'waypoints');
    Ypo.teamData.save();

    var track = Ypo.teamData.get('activeTrack');
    var index = Ypo.teamData.get('activeWaypoint');
    if( index > numOfWaypoints ){ 
      this.transitionToRoute('waypoints.end');
    }
    else{
      this.transitionToRoute('waypoint', missions.tracks[track].waypoints[index-1]);
    }
  },

  goAnytimes: function(){
    Ypo.teamData.set('activeRoute', 'anytimes');
    Ypo.teamData.save();

    this.transitionToRoute('anytimes.list');           
  }
});  // }}}

Ypo.DevBoxController = Ember.Controller.extend({  // {{{
  // --- DEVBOX ---
  showDevBox: function(){
    if( prompt('Password:') === 'lsd' ){
      $("#devBox").show();         
    }
  },
  hideDevBox: function(){
    $("#devBox").hide();         
  },
  clearLocalStorage: function(){
    if( confirm("Are you sure you want to clear local storage? \nAll progress will be lost.") ){
      localStorage.clear();
      window.location.reload();
    }
  },
  showLocalStorage: function(){
    alert( localStorage.teamData + window.location.toString() );
  },
  updateCache: function(){
    updateCache();
  },
  refresh: function(){
    window.location.reload();
  },
  changeTeamNum: function(){
    utils.setQueryParam( prompt('Please enter new team number:') );
  } 
});  // }}}

Ypo.ModalController = Ember.Controller.extend({  // {{{
  isCorrect: true,
  imgUrl: 'img/green-sign.png',
  title: 'Default Title',
  msg: 'Default Message',
  btn: 'Button Label',
  callback: null,
  context: null,
  
  applyCallback: function(){
    if( this.callback ){
      this.callback.apply( this.context ); 
    }
  },
       
  showModal: function(modalType, points, modelType, callback, context){
    if( modalType === 'good' ){
      this.setProperties({
        isCorrect: true,
        imgUrl: 'img/green-sign.png',
        title: 'Good job!',
        msg: 'You get ' + points + ' points',
        btn: 'OK'
      });
    }
    else if( modalType === 'invalid' ){
      this.setProperties({
        isCorrect: false,
        imgUrl: 'img/stop-sign.png',
        title: 'Invalid ' + modelType,
        msg: 'Please try again',
        btn: 'Close',
      });
    }
    else {
      this.setProperties({
        isCorrect: false,
        imgUrl: 'img/stop-sign.png',
        title: 'Sorry',
        msg: 'Only 3 tries allowed. The show must go on!',
        btn: 'Next',
      });
    }

    if( callback ){
      this.setProperties({
        callback: callback, 
        context: context
      });
    }
    else{
      this.setProperties({
        callback: null, 
        context: null
      });
    }
    $("#modal").modal(); // show
  }
});  // }}}

Ypo.HomeController = Ember.ObjectController.extend({  // {{{

  needs: ['navBar'],

  startNewGame: function(){
    var teamName = $('#teamNameInput').val();
    if( teamName === ''){ return }

    var teamNum = utils.getTeamNum();
    var computedTrack;
    if( teamNum === 'kids' ){
        computedTrack = 5;
    }
    else{
      computedTrack = (teamNum % numOfTracks);  // first track == missions.track[0]
    }

    Ypo.teamData.setProperties({
      isGameStarted: true,
      teamName: teamName,
      teamNum: teamNum,
      activeTrack: computedTrack,
      activeRoute: 'waypoints'
    });
    Ypo.teamData.save();

    this.get('controllers.navBar').goWaypoints(); 
    //this.transitionToRoute('waypoint', missions.tracks[computedTrack].waypoints[0] );
  }
});  // }}}

Ypo.WaypointController = Ember.ObjectController.extend({  // {{{

  needs: ['modal'],

  isCompleted: function() {
    var waypoint = Ypo.teamData.get('activeWaypoint');
    var completedWaypoints = Ypo.teamData.get('completedWaypoints');
    return !!completedWaypoints[waypoint-1];
  }.property('Ypo.teamData.activeWaypoint', 'Ypo.teamData.activeCompleted'),

  markCompleted: function( points ){
    var index = Ypo.teamData.get('activeWaypoint');
    Ypo.teamData.completedWaypoints.set([index-1], true);
    Ypo.teamData.set('activeCompleted', true); // hack to get isCompleted observer to fire
    Ypo.teamData.pointsAwarded.set([index-1], points);
    Ypo.teamData.incrementProperty('points', points);
    Ypo.teamData.save();

    if( this.get('isCreative') ){
      //points = this.get('pointValue');
      this.get('controllers.modal').showModal('good', points, null, function(){
        this.get('target').send('goNext'); 
      }, this);
    }
  },

  pointsAwarded: function(){
    var waypoint = Ypo.teamData.get('activeWaypoint');
    var points = Ypo.teamData.get('pointsAwarded');
    return points.get([waypoint-1]);
  }.property('Ypo.teamData.activeWaypoint'),

  pointVal: function(code){
    if( this.get('isCode') ){
      return codes[code];
    }
    else return this.get('pointValue');
  },

  isCorrect: function(input){
    if( this.get('isPassword') ){
      // parse password string
      var passwords = this.get('password').split(",");
      for( var i=0; i<passwords.length; i+=1 ){
        if( passwords[i] === input.toLowerCase() ){
            return true;
        }
      }
    } 
    else if( this.get('isCode') ){
      if( codes.hasOwnProperty(input) ){
        return true;
      }
    }
    return false;
  },

  formSubmit: function(){
    var input = this.get('inputVal');
    if( input === ''){ return false; }
    var modal = this.get('controllers.modal');

    if( this.isCorrect(input) ){
      Ypo.teamData.set('tries', 3);
      this.markCompleted( this.pointVal(input) );
      modal.showModal('good', this.pointVal(input), null, function(){
        this.get('target').send('goNext'); 
      }, this);
      return false;
    }

    else {
      Ypo.teamData.decrementProperty('tries');
      if( Ypo.teamData.tries < 1 ){
        Ypo.teamData.set('tries', 3);
        this.markCompleted( 0 );
        modal.showModal('triesExpired', null, null, function(){
          this.get('target').send('goNext'); 
        }, this);
        return false;
      }
      else{
        Ypo.teamData.save();
        modal.showModal('invalid', 0, this.get('type'));
        return false;
      }
    }
  },

  // nav

  isPrevEnabled: function(){
    return Ypo.teamData.get('activeWaypoint') > 1;
  }.property('Ypo.teamData.activeWaypoint'),
     
  isNextEnabled: function(){
    return this.get('isCompleted'); 
  }.property('isCompleted'), 

  /* observers examples
  activeWaypointWillChange: function() {
  }.observesBefore('Ypo.teamData.activeWaypoint'),
  
  activeWaypointDidChange: function() {
  }.observes('Ypo...'),
  */

});  // }}}

Ypo.AnytimesListItemController = Ember.ObjectController.extend({ // {{{
  isCompleted: function(){
    return !!Ypo.teamData.completedAnytimes[this.get('id') - 1];
  }.property('id', 'Ypo.teamData.completedAnytimes')
});  // }}}

Ypo.AnytimesListController = Ember.ArrayController.extend({  // {{{
  itemController: 'anytimesListItem',

  goAnytime: function(id){
    Ypo.teamData.set('activeAnytime', id);
    Ypo.teamData.save();
    this.transitionToRoute('anytime', missions.anytimes[id-1]); 
  }  
});  // }}}

Ypo.AnytimeController = Ember.ObjectController.extend({  // {{{
  
  needs: ['modal'],

  isCompleted: function() {
    var index = Ypo.teamData.get('activeAnytime');
    //var index = this.get('model').id;
    return !!Ypo.teamData.completedAnytimes[index-1];
  }.property('Ypo.teamData.activeAnytime', 'Ypo.teamData.completedAnytimes'),

  markCompleted: function( points ){
    Ypo.teamData.propertyWillChange('completedAnytimes');

    var index = Ypo.teamData.get('activeAnytime');
    Ypo.teamData.completedAnytimes[index - 1] = true;
    Ypo.teamData.set('activeCompleted', true); // hack to get isCompleted observer to fire
    Ypo.teamData.incrementProperty('points', points);
    Ypo.teamData.save();

    Ypo.teamData.propertyDidChange('completedAnytimes');

    if( this.get('isCreative') ){
      this.get('controllers.modal').showModal('good', points, null, function(){
        this.get('target').send('back'); 
      }, this);
    }
  },

  pointsAwarded: function(){
    var activeIndex = Ypo.teamData.get('activeAnytime');
    return missions.anytimes[activeIndex-1].pointValue;
  }.property('Ypo.teamData.activeAnytime'),

  isCorrect: function(input){
    // parse password string
    var answers = this.get('answer').replace(/\s/g,'').split(",");
    for( var i=0; i<answers.length; i+=1 ){
      if( answers[i] === input.toLowerCase() ){
          return true;
      }
    }
    return false;
  },

  formSubmit: function(){
    var input = this.get('inputVal');
    if( input === ''){ return false; }
    var modal = this.get('controllers.modal');

    if( this.isCorrect(input) ){
      this.markCompleted( this.get('pointValue') );
      modal.showModal('good', this.get('pointValue'), null, function() {
        this.get('target').send('back'); 
      }, this);
      return false;
    }
    else {
      modal.showModal('invalid', 0, 'answer'); 
      return false;
    }
  },

  hasImg: false, 

  imgUrl: function(){
    var active = Ypo.teamData.activeAnytime;
    return missions.anytimes[active-1].imgUrl;  
  }.property('Ypo.teamData.activeRoute')

});  // }}}


