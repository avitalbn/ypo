
/* --- APPLICATION CACHE --- {{{1 */

function updateCache(){
  var appCache = window.applicationCache;
  appCache.update(); // Attempt to update the user's cache.

  if (appCache.status == window.applicationCache.UPDATEREADY) {
    appCache.swapCache();  // The fetch was successful
    alert("Update successful, new cache swapped.");
  }
  else {
    alert("Update failed");
  }
}

// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {

  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      // Swap it in and reload the page to get the new hotness.
      window.applicationCache.swapCache();
      if (confirm('A new version of this site is available. \nDownload the new hotness?')) {
        window.location.reload();
      }
    } else {
      // Manifest didn't changed. Nothing new to server.
    }
  }, false);

}, false);
// end app cache }}}1

var utils = {  // {{{
  setQueryParam: function( param ){
    window.location.search = 'teamNum=' + param;
  },

  getQueryParam: function( name ){
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null){
      return ""; }
    else {
      return decodeURIComponent(results[1].replace(/\+/g, " ")); }
  },

  setTeamNum: function( teamNum ){
    Ypo.teamData.set('teamNum', teamNum);
    if( teamNum === 'kids' ){
      Ypo.teamData.set('activeTrack', numOfTracks);  
    }
    else{
      Ypo.teamData.set('activeTrack', teamNum % numOfTracks);  
    }
  },

  getTeamNum: function(){
    if( Ypo.teamData.teamNum ){
      return Ypo.teamData.teamNum;
    }
    // query param takes priority
    var teamNum = this.getQueryParam('teamNum'); 
    if( teamNum === 'kids' ){
      return teamNum;
    }
    teamNum = parseInt( teamNum );
    if( isNaN(teamNum) || !isFinite(teamNum) || 
      teamNum < 1 || teamNum == null ){
      teamNum = parseInt( prompt('Please enter your team number:') );
      if( isNaN(teamNum) || !isFinite(teamNum) || teamNum < 1 ){
        alert( 'Invalid number entered. Using default value of 1');
        teamNum = 1;
      }
    }
    return teamNum;
  }
}  // }}}

