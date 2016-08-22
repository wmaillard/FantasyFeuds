function doubleCheck(form) {
    var val = checkForm(form);
    var val2 = matchingPasswords(form);
    return val && val2;
}

function matchingPasswords(form) {
    if ($("#newPassword").val() !== $("#newPasswordAgain").val()) {
        dangerInput($("#newPassword"));
        dangerInput($("#newPasswordAgain"));
        alert("Your passwords don't match");
        return false;
    } else if ($('#newPassword').val()) {
        removeDanger($("#newPassword"));
        removeDanger($("#newPasswordAgain"));
        return true;
    }

}

function checkForm(form) {
    var flag = true;

    form.find('input').each(function() {
        if (!$(this).val()) {
            dangerInput($(this));
            flag = false;
        } else {
            removeDanger($(this));
        }
    })
    return flag;
}

function dangerInput(field) {
    field.closest('.form-group').addClass('has-error');
    field.siblings('span').addClass('glyphicon-remove');
}

function removeDanger(field) {
    field.closest('.form-group').removeClass('has-error');
    field.siblings('span').removeClass('glyphicon-remove');
}

function blank(field) {
    alert($())
}

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