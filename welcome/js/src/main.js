$(function(){
	$('#tutorial').click(function(){
		$('body').empty().append('<div class="row"><div class="col-xs-10 offset-xs-1"><div class="spinner"><div class="cube1"></div><div class="cube2"></div></div></div></div>')
		window.location = window.location.href + 'tutorial';
	})
	$('#play').click(function(){
		$('body').empty().append('<div class="row"><div class="col-xs-10 offset-xs-1"><div class="spinner"><div class="cube1"></div><div class="cube2"></div></div></div></div>')
		window.location = window.location.href + 'game';
	})
	
});