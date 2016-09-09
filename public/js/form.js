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



function saveGame() {
    if(Cookies.loggedIn === 'false'){
        $('$saveAlertBad').show();
        return;
    }
    var state = {};
    state.entities = {};

    state.entities = entities;

    player1.gold = 300;
    player1.team = 'red';
    player1.ai = true;
    player1.name = "player1"

    player2.gold = 200;
    player2.team = 'blue';
    player2.ai = false;
    player2.name = 'player2';
    var players = [player1, player2];

    state['baseNHealth'] = baseNHealth;
    state['baseSHealth'] = baseSHealth;
    state['players'] = players;
    state['level'] = level;
    state['levelsWon'] = levelsWon;
    var toSend = {};
    toSend.Name = new Date($.now()).getTime();
    //console.log(toSend.Name);
    toSend.Data = state;
    //console.log(toSend);

    //Change this when you want to pick saves
    toSend.Name = 'recent';

    $.ajax({
        url: APIURL + '/' + Cookies.get('userName') + '/save/' + toSend.Name,
        method: 'PUT',
        beforeSend: function(request){
            request.setRequestHeader("Authorization", Cookies.get('token'));
        },//Authorization?
        //  dataType: 'application/json',
        // contentType:'application/json',
        data: JSON.stringify(state),
        success: function(data, textStatus, res) {
            //data = JSON.parse(data);
            //console.log('Reponse: ');
            //console.log(data);

            Cookies.set('saveName', toSend.Name);
            $('#saveAlertGood').show();



        },
        error: function(data, textStatus, res) {
            //console.log("ERROR: ");
            //console.log(data);
            $('#saveAlertBad').show();


        }

    })

    return JSON.stringify(state);

}

function loadGame(state){

    var theSave = Cookies.get('saveName');

    theSave = 'recent';  //Change me for more functionality

        $.ajax({
        url: APIURL + '/' + Cookies.get('userName') + '/save/' + theSave,
        method: 'GET',
        beforeSend: function(request){
            request.setRequestHeader("Authorization", Cookies.get('token'));
        },//Authorization?
        //  dataType: 'application/json',
        // contentType:'application/json',
        success: function(data, textStatus, res) {
            //data = JSON.parse(data);
            data = data.data;
            //console.log('Reponse: ');
            //console.log(data);
            player1 = data.players[0];
            player2 = data.players[1];
            level = data.level;
            baseNHealth = data.baseNHealth;
            baseSHealth = data.baseSHealth;
            baseS = data.baseS;
            baseN = data.baseN;
            entities = data.entities;
            levelsWon = data.levelsWon;
            for(var entity in entities){
                entities[entity].image.loaded = false;
                entities[entity].image = new Image();
                entities[entity].blank = new Image();
                entities[entity].blank.src = 'img/characters/blank.png'
                entities[entity].image.src = entities[entity].png;
                entities[entity].intervalSet = false;
                //travelSouth(entities[entity]); //won't need this
            }
            firstLoad = true;




            startLevel(true);


        },
        error: function(data, textStatus, res) {
            //console.log("ERROR: ");
            //console.log("text:", textStatus);
            //console.log('res', res);
            //console.log('data:')
            //console.log(data);  //server doesn't provid anything useful, grrr
            startGame(level, true);

           // alert('Error Loading Your Game! Sorry :(')
        }

    })


}

function gameOver() { //need to work on this
    if (baseNHealth <= 0){
        //console.log("You Win!");
        if(levelsWon.length < 3){
            displayLevels('Congratulations! You Beat ' + levelTitles[level] + '.  Select your next level');
        }else{
            displayLevels('Congratulations! You Have Conquered the Seven Kingdoms! Care To Replay a Level?');
        }
        $('#cancelLevel').hide();
        if(Cookies.get('loggedIn') === 'true'){
            for(var lev in levels){
                $('#' + levels[lev]).hide()
            }

            var levelNumber = $.inArray(level, levels);
            //console.log(levelNumber);
            levelNumber++;
            levelNumber %= 3;
            var nextLevel = levels[levelNumber]

            if($.inArray(nextLevel, levelsWon) === -1){
                levelsWon.push(nextLevel);
            }

            for(var lev in levelsWon){
                $('#' + levelsWon[lev]).show()
            }
        }
        // figure out how to end game
    }
    else if (baseSHealth <= 0){
        //console.log("You Lose!");
        displayLevels('Sorry You Failed While Trying to Conquer ' + levelTitles[level] + '.  Select your next level');
        $('#cancelLevel').hide();
       if(Cookies.get('loggedIn') === 'true'){
            for(var lev in levels){
                $('#' + levels[lev]).hide()
            }

            for(var lev in levelsWon){
                $('#' + levelsWon[lev]).show()
            }
        }

    }
    else{
        return false;
    }

}
