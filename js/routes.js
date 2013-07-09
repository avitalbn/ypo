
Ypo.LOG_TRANSITIONS = true;

Ypo.Router.map(function(){
  this.resource('home');
  this.resource('waypoints', function(){
    this.resource('waypoint', { path: ':waypoint_id' });
    this.route('end');
  });
  this.resource('anytimes', function(){
    this.route('list');
    this.resource('anytime', { path: ':anytime_id' }); 
  });
});

// --- ROUTES --- 

//Ypo.ApplicationRoute = Ember.Route.extend({});

Ypo.IndexRoute = Ember.Route.extend({
  redirect: function(){
    this.transitionTo('home');
  }
});

Ypo.HomeRoute = Ember.Route.extend({  // {{{
  activate: function(){
    Ypo.teamData.set('activeRoute', 'home');
  }
});  // }}}

Ypo.WaypointsRoute = Ember.Route.extend({  // {{{
  setupController: function(controller, model){
    var track = Ypo.teamData.activeTrack;
    controller.set('model', missions.tracks[track].waypoints); 
    Ypo.teamData.set('activeCompleted', false);
  },
  redirect: function(){
    if( !localStorage["isGameStarted"] ){
      this.transitionTo('home');
    }
    else{
      var track = Ypo.teamData.activeTrack;
      var index = Ypo.teamData.activeWaypoint;
      if( index > numOfWaypoints ){ 
        this.transitionTo('waypoints.end');
      }
      else{
        this.transitionTo('waypoint', missions.tracks[track].waypoints[index-1]);
      }
    }
  },

  events: {  // TODO: move to controller?
    // mission nav 
    goPrev: function(){
      var track = Ypo.teamData.get('activeTrack');
      var waypoint = Ypo.teamData.get('activeWaypoint');

      if( Ypo.teamData.teamNum === 'kids' && 
        waypoint === (numOfWaypoints + 1) ){
        Ypo.teamData.decrementProperty('activeWaypoint');
        Ypo.teamData.save();
        this.transitionTo('waypoint', missions.tracks[track].waypoints[waypoint-3] );
      }

      if( waypoint > 1 ){
        Ypo.teamData.set('activeCompleted', false);
        Ypo.teamData.decrementProperty('activeWaypoint');
        Ypo.teamData.save();
        this.transitionTo('waypoint', missions.tracks[track].waypoints[waypoint-2] );
      }
    },

    goNext: function(){
      var track = Ypo.teamData.get('activeTrack');
      var waypoint = Ypo.teamData.get('activeWaypoint');

      if( Ypo.teamData.completedWaypoints[waypoint-1] ){
        Ypo.teamData.set('activeCompleted', false);
        Ypo.teamData.incrementProperty('activeWaypoint');
        Ypo.teamData.save();

        if( Ypo.teamData.teamNum === 'kids' && 
            waypoint > (numOfWaypoints - 2) ){
          Ypo.teamData.incrementProperty('activeWaypoint');
          Ypo.teamData.save();
          this.transitionTo('waypoints.end');
          return false;
        }

        if( (waypoint + 1) > numOfWaypoints ){
          this.transitionTo('waypoints.end');
          return false;
        }
        this.transitionTo('waypoint', missions.tracks[track].waypoints[waypoint] );
      }
    }
  },

  activate: function(){
    console.log('waypointsRoute.activate');
    Ypo.teamData.set('activeRoute', 'waypoints');
  }
});  // }}}

Ypo.WaypointRoute = Ember.Route.extend({  // {{{
  model: function(){  // necessary for entering via url (page refreshes)
    var track = Ypo.teamData.activeTrack;
    var waypoint = Ypo.teamData.activeWaypoint;
    return missions.tracks[track].waypoints[waypoint-1]; 
  },

  setupController: function(controller, model){
    var track = Ypo.teamData.activeTrack;
    var waypoint = Ypo.teamData.activeWaypoint;
    controller.set('model', missions.tracks[track].waypoints[waypoint-1]); 
  },

  serialize: function() {
    return { waypoint_id: Ypo.teamData.activeWaypoint };
  },

  redirect: function(){
    if( !localStorage["isGameStarted"] ){
      this.transitionToRoute('home');
    }
  },

  activate: function(){
    Ypo.teamData.set('activeRoute', 'waypoints');
  }
});  // }}}

Ypo.AnytimesRoute = Ember.Route.extend({  // {{{
  setupController: function(controller, model){
    controller.set('model', missions.anytimes); 
  },
  redirect: function(){
    if( !localStorage["isGameStarted"] ){
      this.transitionTo('home');
    }
    else{
      this.transitionTo('anytimes.list');
    }
  },

  events: { // TODO: move to AnytimeRoute?
    back: function(){
       this.transitionTo('anytimes.list');
    },
    goPrev: function(){
      Ypo.teamData.decrementProperty('activeAnytime'); 
      Ypo.teamData.save();
      var active = Ypo.teamData.get('activeAnytime');
      if( active < 1 ){
        var length = missions.anytimes.length;
        Ypo.teamData.set('activeAnytime', length);
        Ypo.teamData.save();
        this.transitionTo('anytime', missions.anytimes[length-1]);
        return false;
      }
      else{
        this.transitionTo('anytime', missions.anytimes[active-1]);
        return false;
      }
    },

    goNext: function(){
      Ypo.teamData.set('activeCompleted', false);
      Ypo.teamData.incrementProperty('activeAnytime');
      var index = Ypo.teamData.get('activeAnytime');
      if( index > missions.anytimes.length){
        Ypo.teamData.set('activeAnytime', 1);
        Ypo.teamData.save();
        this.transitionTo('anytime', missions.anytimes[0]);
        return false;
      }
      else{
        Ypo.teamData.save();
        this.transitionTo('anytime', missions.anytimes[index-1]);
        return false;
      }
    }
  },

  activate: function(){
    Ypo.teamData.set('activeRoute', 'anytimes');
  }
});  // }}}

Ypo.AnytimesListRoute = Ember.Route.extend({  // {{{
  model: function(){
    return missions.anytimes; 
  },
  setupController: function(controller){
    controller.set('model', missions.anytimes); 
  },
  redirect: function(){
    if( !localStorage["isGameStarted"] ){
      this.transitionToRoute('home');
    }
  },
  activate: function(){
    Ypo.teamData.set('activeRoute', 'anytimes');
  }
});  // }}}

Ypo.AnytimeRoute = Ember.Route.extend({  // {{{
  model: function(){  // necessary for entering via url (page refreshes)
    var index = Ypo.teamData.activeAnytime;
    return missions.anytimes[index -1]; 
  },
  setupController: function(controller, model){
    var index = Ypo.teamData.activeAnytime;
    controller.set('model', missions.anytimes[index-1]); 
    controller.set('hasImg', missions.anytimes[index-1].hasImg);  
  },
  serialize: function(model) {
    return { anytime_id: Ypo.teamData.activeAnytime }; 
  },
  redirect: function(){
    if( !localStorage["isGameStarted"] ){
      this.transitionToRoute('home');
    }
  },
  activate: function(){
    Ypo.teamData.set('activeRoute', 'anytimes');
  },
  enter: function(){
    Ypo.teamData.set('activeCompleted', false);  // hack to get isCompleted observer to fire
  }
});  // }}}

