
// --- MODELS --- 

Ypo.TeamData = Ember.Object.extend({
  init: function(){
    if( localStorage['isGameStarted'] ){
      // resume
      var teamData = JSON.parse(localStorage["teamData"]); 

      this.setProperties({
        isGameStarted: true,
        teamName: teamData['teamName'],
        teamNum: teamData['teamNum'],
        activeTrack: teamData['activeTrack'],
        activeWaypoint: teamData['activeWaypoint'],
        activeAnytime: teamData['activeAnytime'],
        activeCompleted: teamData['activeCompleted'],
        points: teamData['points'],
        pointsAwarded: teamData['pointsAwarded'],
        completedAnytimes: teamData['completedAnytimes'],
        completedWaypoints: teamData['completedWaypoints'],
        tries: teamData['tries'],
        activeRoute: teamData['activeRoute']
      });
    }
    else {
      // set defaults
      this.setProperties({
        isGameStarted: false,
        teamName: 'teamName',
        teamNum: null,
        activeTrack: 0,
        activeWaypoint: 1,
        activeAnytime: 1,
        activeCompleted: false,
        points: 0,
        pointsAwarded: [0,0,0,0,0,0], // for waypoints,
        completedAnytimes: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        completedWaypoints: [0,0,0,0,0,0],
        tries: 3,
        activeRoute: 'home'
      });
    }
  },

  save: function(){
    var teamData = {
      teamName: Ypo.teamData.get('teamName'),
      teamNum: Ypo.teamData.get('teamNum'),
      activeTrack: Ypo.teamData.get('activeTrack'),
      activeWaypoint: Ypo.teamData.get('activeWaypoint'),
      activeAnytime: Ypo.teamData.get('activeAnytime'),
      activeCompleted: Ypo.teamData.get('activeCompleted'),
      points: Ypo.teamData.get('points'),
      pointsAwarded: Ypo.teamData.get('pointsAwarded'), 
      completedAnytimes: Ypo.teamData.get('completedAnytimes'),
      completedWaypoints: Ypo.teamData.get('completedWaypoints'),
      tries: Ypo.teamData.get('tries'),
      activeRoute: Ypo.teamData.get('activeRoute')
    };
    localStorage['teamData'] = JSON.stringify( teamData );
    localStorage['isGameStarted'] = true;
  }

});

//Ypo.teamData = Ypo.TeamData.create();
Ypo.set('teamData', Ypo.TeamData.create());

