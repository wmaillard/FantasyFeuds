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
            $(this).toggleClass('buttonDown');
            setTimeout(function(current) {
                $('#nextEntity').toggleClass('buttonDown');
            }, 200);
            goToNextEntity();
            return false;
        })
        $('#screenName').on('focus', function() {
            $('#screenNameForm').css({
                'padding-bottom': $(window).height() * 0.60
            })
            $('#startInfo').scrollTop($('#startInfo .modal-content').height() + $('#screenNameForm').offset().top);
        });
        $(window).resize(function() {
            setWindowResizeProperties()
            bottomNavCenter();
            limitBackgroundOffset();
            redrawBackground();
            drawScoreBar(scores);
        });
        $('#showShop').click(function() {
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
                boughtEntity = this.closest('.card').id;
                if (entityInfo[boughtEntity].cost > playerGold) {
                    $("#playerGold").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
                    boughtEntity = null;
                } else {
                    $('#shopStats').hide();
                    $('#showShop').toggleClass('buttonDown')
                    if ($('#bottomNav').is(":visible")) {
                        $('#bottomNav').hide();
                    } else $('#bottomNav').show();
                }
                return false;
            })
        })
        $('#allEntities').click(function() {
            if ($(this).hasClass('buttonDown')) {
                deselectAllEntities();
            } else {
                selectAllVisiblePlayerEntities(entities, playerId);
            }
            $(this).toggleClass('buttonDown');
            return false;
        })
    }
}
