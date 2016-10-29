var BindButtons = {
    bindAll: function() {
        $('#gameContainer').bind('mousewheel', function(e) {
            if (e.originalEvent.wheelDelta / 120 > 0) {
                zoomAction({ scale: 1.10, center: { x: e.originalEvent.clientX, y: e.originalEvent.clientY } })
            } else {
                zoomAction({ scale: .90, center: { x: e.originalEvent.clientX, y: e.originalEvent.clientY } })
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
        $(window).resize(function() {
            setWindowResizeProperties()
            bottomNavCenter();
            limitBackgroundOffset();
            redrawBackground();
            drawScoreBar(scores);
        });
        $('#showShop').click(function() {
            if ($('#shop').is(":visible")) {
                $('#shop').hide();
            } else $('#shop').show();
            if ($('#bottomNav').is(":visible")) {
                $('#bottomNav').hide();
            } else $('#bottomNav').show();
            $(this).toggleClass('buttonDown')
            return false;
        });
        $('.buy').each(function() {
            $(this).click(function() {
                boughtEntity = this.closest('.card').id;
                if (entityInfo[boughtEntity].cost > playerGold) {
                    $("#playerGold").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
                } else {
                    $('#shop').hide();
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
