var BindButtons = {
    bindAll: function() {
        $('#gameContainer').bind('mousewheel', function(e) {
            if (e.originalEvent.wheelDelta / 120 > 0) {
                zoomAction({ scale: 1.20, center: { x: e.originalEvent.clientX, y: e.originalEvent.clientY } })
            } else {
                zoomAction({ scale: .80, center: { x: e.originalEvent.clientX, y: e.originalEvent.clientY } })
            }
        });
        $('#previousEntity').click(function() {
            $(this).toggleClass('buttonDown');
            setTimeout(function(current) {
                $('#previousEntity').toggleClass('buttonDown');
            }, 200);
            goToPreviousEntity();
            return false;
        })
        $('#nextEntity').click(function() {
            if(firstTime.zoomToEntity){
                $('#nextEntity').removeClass('breathing');
                firstTime.zoomToEntity = false;
                firstTime.selectEntity = true;
                $('#allEntities').addClass('breathing');
                
            }
            $(this).toggleClass('buttonDown');
            setTimeout(function(current) {
                $('#nextEntity').toggleClass('buttonDown');
            }, 200);
            goToNextEntity();
            return false;
        })
        $('#screenName').on('focus', function() {
            //Move above keyboard if not safari
            if(isAndroid){
                $('#screenNameForm').css({
                    'padding-bottom': $(window).height() * 0.60
                })
                $('#startInfo').scrollTop($('#startInfo .modal-content').height() + $('#screenNameForm').offset().top);
            }
        });
        $(window).resize(function() {
            setWindowResizeProperties()
            bottomNavCenter();
            limitBackgroundOffset();
            redrawBackground();
            drawScoreBar(scores);
        });
        $('#showShop').click(function() {
            if(firstTime.showShop){
                $('#showShop').removeClass('breathing');
                firstTime.showShop = false;
                firstTime.buyEntity = true;
                $('#dwarfSoldier button').addClass('breathing');
				$('#elfFemale button').addClass('breathing');
            }else if(firstTime.buy2){
				$('#showShop').removeClass('breathing');
                firstTime.buy2 = false;
				$('#dwarfSoldier button').addClass('breathing');
                if(playerGold >= 75){
					$('#elfFemale button').addClass('breathing');
				}
			}
            if ($('#shopStats').is(":visible")) {
                $('#shopStats').hide();
            } else {
                $('#shopStats').show();
                createSortTable();
                $('#shopStats').scrollTop(0);
                var navHeight = $('#topNav .navbar').height() + $('#topNav .navbar').offset().top;
                $('#shopStatsNav').css({ 'margin-top': navHeight });
                navHeight += $('#shopStatsNav').height();
                $('#shopStats').css({ 'margin-top': navHeight });
                $('#shopButton').css({ 'padding-left': ($('#shopStats').width() / 2) - ($('#shopButton').width() + $('#rankingsButton').width()) / 2 });
            }
            if ($('#bottomNav').is(":visible")) {
                $('#bottomNav').hide();
            } else $('#bottomNav').show();
            $(this).toggleClass('buttonDown')
            return false;
        });
        $('#shopButton').click(function(e) {
            $('#shopStats').scrollTop(0);
        })
        $('#rankingsButton').click(function(e) {
            $('#shopStats').scrollTop(0);
        })
        $('#screenName').keypress(function(event) {
            if (event.keyCode == 13) {
                $('#closeIntro').click();
                return false;
            }
        });
        $('.buy').each(function() {
            $(this).click(function() {
                if (entityInfo[this.closest('.card').id].cost > playerGold) {
                    $("#playerGold").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
                    boughtEntity = null;
                    return false;
                } 
                if(firstTime.buyEntity){
                    $('.buy').removeClass('breathing');
                    firstTime.placeEntity = true;
					firstTime.buyEntity2 = true;
                    firstTime.buyEntity = false;
					$('#tutorialModal').modal({
						backdrop: 'static',
						keyboard: false
					})
					$('#tutorialModalButton').text('Try It!').unbind('click').click(function(e){
						$('#tutorialModal').modal('hide');
					});
					nextMessage(message4(name));
                }else if(firstTime.buyEntity2){
					entities[-1].selected = false;
					$('.buy').removeClass('breathing');
					firstTime.placeEntity2 = true;
                    firstTime.buyEntity2 = false;
					$('#tutorialModal').modal({
						backdrop: 'static',
						keyboard: false
					})
					$('#tutorialModalButton').text('Try It!').unbind('click').click(function(e){
						$('#tutorialModal').modal('hide');
						redrawBackground();
					});
					nextMessage(message11);
					
				}
                boughtEntity = this.closest('.card').id;

                    $('#shopStats').hide();
                    $('#showShop').toggleClass('buttonDown')
                    if ($('#bottomNav').is(":visible")) {
                        $('#bottomNav').hide();
                    } else $('#bottomNav').show();
               
                return false;
            })
        })
        $('#closeGameOver').click(function(){
             setTimeout(function(){$('#introTeamBox').fadeOut('slow')}, 1000);
        })
        $('#allEntities').click(function() {

            if ($(this).hasClass('buttonDown')) {
                deselectAllEntities();
            } else {
                selectAllVisiblePlayerEntities(entities, playerId);
            }
			if(firstTime.allEntities && LOO(selectedEntities) === 2){
                $('#allEntities').removeClass('breathing');
                firstTime.allEntities = false;
				$('#tutorialModal').modal({
					backdrop: 'static',
					keyboard: false
				});
				$('#tutorialModalButton').unbind('click').text('More...').click(function(){
					$('#tutorialModalButton').unbind('click').text('Try It').click(function(){
						locks.move = false;
						firstTime.goToOrange = true;
						$('#tutorialModal').modal('hide');
					});
					nextMessage(message14);
				});
				nextMessage(message13);
                
            }
			redrawBackground();
            $(this).toggleClass('buttonDown');
            return false;
        })
		$('#forgot').click(function(){
            if(firstTime.forgot){
                $('#forgot').removeClass('breathing');
                firstTime.forgot = false;
                nextMessage(message3);
                $('#tutorialModalButton').text('Try It!').unbind('click').click(function(e){
						$('#showShop').addClass('breathing');
						$('#tutorialModal').modal('hide');
					});
            }else{
				$('#tutorialModalButton').unbind('click').click(function(e){
						$('#tutorialModal').modal('hide');
					});
			}
			$('#tutorialModal').modal('show');
			return false;
			})
	
    }
}
