var BindButtons = { 
 bindAll: function(){


 	 $('#gameContainer').bind('mousewheel', function(e){
 	 	var centerY = $('#gameContainer').height() / 2;
 	 	var centerX = $('#gameContainer').width() / 2;

        if(e.originalEvent.wheelDelta /120 > 0) {
            zoomAction({scale: 1.10, center: {x: centerX, y: centerY}})
        }
        else{
            zoomAction({scale: .90, center: {x: centerX, y: centerY}})
        }
    });


 	$('#showShop').click(function(){
 		if($('#shop').is(":visible")){
 			$('#shop').hide();
 		}
        else $('#shop').show();
        return false;
    });

  	$('#signOut').click(function() {
  		$('#saveGame').hide();
  	    logOut();
  	    return false;
  	});
  
  	$('#signInNav').click(function() {
  	    signInNav();
  	    return false;
  	})
  
  	$("#zoomIn").click(function() {
  	    zoomIn();
  	    return false;
  	});
  
  	$("#zoomOut").click(function() {
  	    zoomOut();
  	    return false;
  	});
  
      $('#menu-close').click(function(){
      	$('#menu-toggle').show()
      	$('#saveAlertBad').hide();
      	$('#saveAlertGood').hide();
      })
      // ********** Login Stuff ****************
      $('#cancel').click(function() {
          $('#signInBox').hide();
      })
       $('#saveGame').click(function(){
      	saveGame();
      	return false;
      });
      $('#menu-toggle').click(function(){
      	$('#menu-toggle').hide();
      	if(Cookies.get('loggedIn') !== 'true'){
      		$('#saveGame').hide();
      	}else{
      		$('#saveGame').show();
      	}
      });
         $('#signIn').click(function() {
          if (checkForm($(this).closest('form'))) {
              var body = {}
              body.uname = $('#userName').val();
              body.password = $('#oldPassword').val();
              $.ajax({
                  url: APIURL + '/login',
                  method: 'POST',
                  //  dataType: 'application/json',
                  // contentType:'application/json',
                  data: JSON.stringify(body),
                  success: function(data, textStatus, res) {
                      //data = JSON.parse(data);
                      //console.log('data: ');
                      //console.log(data);
                      var auth = res.getResponseHeader('Authorization');
                      //console.log(auth);
                      Cookies.set('token', auth);
  
                      Cookies.set('userName', data.uname);
                      Cookies.set('level', data.level);
                      Cookies.set('loggedIn', true);
                      $('#signInNav').hide();
                      $('#signedInNav').show();
                      $('#saveGame').show();
  
                      $('#signedInNav div').text('Signed in as ' + data.uname);
                      startGame(levels[data.level]);
  
                  },
                  error: function(data, textStatus, res) {
                  	$('#warningBelow').append('<div id="problem" class="col-md-12">Sorry, incorrect user info </div>')
                      //console.log("ERROR: ");
                      //console.log(data);
                      //console.log(textStatus);
                      //console.log(res);
                  }
  
              })
  
          }
  
          return false;
      })
  
  
  
      
 //  $('#gameContainer').click(clickGameContainer)


  
      $('#levelSelect').click(function(){
	      displayLevels("Choose a Level");
	  	return false;

	  })
	    $('#signUp').click(function() {
	      $('#signInForm').hide();
	      $('#signUpForm').show();
	      return false;

	  })

	  $('#cancelLevel').click(function(){
	  	$('#prompt').hide();
	  	$('#levelButtons').hide();
	  	$('#signInBox').hide();

	  	return false;
	  })
	   $('#signUpSubmit').click(function() {
	      if (doubleCheck($(this).closest('form'))) {
	          var body = {}
	          body.uname = $(newUserName).val();
	          body.email = $(newEmail).val();
	          body.password = $(newPassword).val();
	          $.ajax({
	              //contentType: 'application/json',
	              url: APIURL + '/register',
	              method: 'PUT',
	              //  dataType: 'application/json',
	              data: JSON.stringify(body),
	              success: function(data, textStatus, request) {
	                  //  data = JSON.parse(data);
	                  var auth = request.getResponseHeader('Authorization');
	                  ////console.log(headers);
	                  //Cookies.set('token', headers.authorization);
	                  //console.log('data: ');
	                  //console.log(data);
	                  //console.log('auth:')
	                  //console.log(auth)
	                  ////console.log('token: ')
	                  ////console.log(Cookies.get('token'));
	                  Cookies.set('userName', data.uname);
	                  Cookies.set('level', data.level);
	                  Cookies.set('loggedIn', true);
	                  Cookies.set('token', auth);

	                  //  $('form').hide();

	                  $('#signedInNav').show();
	                  $('#signedInNav div').text('Signed in as ' + data.uname);
	                  $('#signInForm').show();
	                  $('#signUpForm').hide();
	                  $('#saveGame').show();
	                  $('#signInNav').hide();

	                  startGame('theNeck', true);

	              },
	              error: function(data, textStatus, request) {
	                  //console.log('testStatus: ' + textStatus);
	                  //console.log('request:');
	                  //console.log(request);
	                  //console.log("ERROR: ");
	                  //console.log(data);
	                  $('#inputWarningBelow').append('<div id="problemSignUp" class="col-md-12">Sorry, that login is taken</div>')

	              }

	          })

	      } else {
	          //console.log('form problem');
	      }

	      return false;

	  });
	  $('#skip').click(function() {
	      $('form').hide();
	      $('#skip').hide();
	      $('#levelButtons').show();
	      $('#prompt').text('Choose a level');
	  });

	  $("#gameContainer").on('mousedown', function(e) {
		    pressMap(e)
		}).on('mouseup', function(e) {
		    releasePressMap(e)
		}).on('mousemove', function(e) {
		    mapMove(e);
		});
	$("#gameContainer").on('touchstart', function(e) {
		console.log('touchstart')
			if(e.originalEvent.changedTouches.length === 1){


			    pressMap(e, true)
			}
		    return false;
		}).on('touchend', function(e) {
			console.log('touchEnd')
			if(e.originalEvent.changedTouches.length === 1){


			    releasePressMap(e, true);
			}
		    return false;
		}).on('touchmove', function(e) {
			if(e.originalEvent.changedTouches.length === 1){

		    	mapMove(e, true);
		    }
		    return false;
		});
	}
}
