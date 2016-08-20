function logOut() {
    Cookies.set('loggedIn', false);
    $('#signedInNav').hide();
    $('#signInNav').show();
  //  $('#saveGame').remove();
}

function signInNav() {
    $('#signInBox').show();
    $('#levelButtons').hide();
    $('#signUpForm').hide()
    $('#signInForm').show();
    $('#prompt').text('Sign In');
    $('#skip').hide();
    $('#cancel').show();
}

function displayLevels(title){
        $('#prompt').show();
        $('#levelButtons').show();
        $('#signInForm').hide();
        $('#cancel').hide();
        $('#prompt').text(title);
        $('#skip').hide();

        $('#theNorth').prop('onclick',null).off('click');
        $('#theNeck').prop('onclick',null).off('click');
        $('#dorne').prop('onclick',null).off('click');

        $('#theNorth').click(function(){
            startGame('theNorth', true);
        })
        $('#theNeck').click(function(){
            startGame('theNeck', true);
        })
        $('#dorne').click(function(){
            startGame('dorne', true);
        })
        $('#signInBox').show();
        $('#cancelLevel').show();

 }